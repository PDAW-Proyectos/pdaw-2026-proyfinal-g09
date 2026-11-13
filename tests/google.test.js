import { manejarErrores } from '../middlewares/errores.js';
import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import crearRouterGoogle from '../routes/Google.routes.js';
import crearRouterLogin from '../routes/Login.routes.js';
import crearRouterLogout from '../routes/Logout.routes.js';
import crearRouterRegistro from '../routes/Registro.routes.js';
import { RepositorioUsuarios } from '../src/services/RepositorioUsuarios.js';
import { Usuario } from '../src/Usuario.js';

let carpeta, usuarios, app, agente, cliente, perfil, nonce;
const origen = 'http://localhost:3002';
const clientId = 'cliente-de-prueba.apps.googleusercontent.com';

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'nidodo-google-'));
  usuarios = new RepositorioUsuarios(join(carpeta, 'usuarios.json'));
  await usuarios.cargar();
  perfil = { sub: 'google-123', email: 'google@example.com', email_verified: true, name: 'Usuario Google' };
  cliente = { verifyIdToken: jest.fn(async () => ({ getPayload: () => ({ nonce, ...perfil }) })) };
  app = express();
  app.use(express.json());
  app.use(session({ name: 'clase08.sid', secret: 'secreto-solo-para-tests', resave: false, saveUninitialized: false }));
  app.use('/api/login/google', crearRouterGoogle(usuarios, { clientId, appUrl: origen, cliente }));
  app.use('/api/login', crearRouterLogin(usuarios, { appUrl: origen }));
  app.use('/api/logout', crearRouterLogout());
  app.use('/api/registro', crearRouterRegistro(usuarios));
  app.use(manejarErrores);
  agente = request.agent(app);
  const config = await agente.get('/api/login/google/config').expect(200);
  nonce = config.body.nonce;
  expect(config.body.clientId).toBe(clientId);
  expect(config.headers['cache-control']).toBe('no-store');
});

afterEach(async () => { await rm(carpeta, { recursive: true, force: true }); });

function ingresar() {
  return agente.post('/api/login/google').set('Origin', origen).send({ credential: 'credencial-simulada' });
}

test('crea una cuenta común desde el perfil verificado y abre la sesión', async () => {
  const anterior = nonce;
  const respuesta = await ingresar().expect(200);
  expect(cliente.verifyIdToken).toHaveBeenCalledWith({ idToken: 'credencial-simulada', audience: clientId });
  expect(respuesta.body.usuario).toMatchObject({ rol: 'usuario', esContribuyente: false });
  expect(respuesta.body.usuario).not.toHaveProperty('googleId');
  expect(respuesta.body.usuario).not.toHaveProperty('passwordHash');
  const actual = await agente.get('/api/login').expect(200);
  expect(actual.body.usuario.id).toBe(respuesta.body.usuario.id);
  expect(usuarios.listar()[0].passwordHash).toBeNull();
  await ingresar().expect(401);
  const config = await agente.get('/api/login/google/config').expect(200);
  nonce = config.body.nonce;
  expect(nonce).not.toBe(anterior);
  await ingresar().expect(200);
  expect(usuarios.listar()).toHaveLength(1);
});

test('no vincula una cuenta local por compartir el email ni concede sus permisos', async () => {
  await usuarios.agregarUsuario(new Usuario({ username: 'CuentaLocal', email: perfil.email, passwordHash: '$2hash' }));
  await ingresar().expect(409);
  expect(usuarios.listar()).toHaveLength(1);
  expect(usuarios.listar()[0].googleId).toBeNull();
  expect((await agente.get('/api/login')).body.usuario).toBeNull();
});

test.each([
  { email_verified: false }, { nonce: 'otra-sesion' }, { sub: '' }, { email: 'sin-formato' }
])('rechaza un perfil inválido o no correspondiente a esta sesión: %j', async cambio => {
  Object.assign(perfil, cambio);
  await ingresar().expect(401);
  expect(usuarios.listar()).toHaveLength(0);
});

test('rechaza una credencial que la biblioteca oficial no valida sin exponer su error', async () => {
  cliente.verifyIdToken.mockRejectedValue(new Error('detalle-interno-privado'));
  const respuesta = await ingresar().expect(401);
  expect(JSON.stringify(respuesta.body)).not.toContain('detalle-interno-privado');
  expect(usuarios.listar()).toHaveLength(0);
});

test('exige una sesión iniciada para el flujo de Google y un origen permitido', async () => {
  await request(app).post('/api/login/google').set('Origin', origen).send({ credential: 'simulada' }).expect(401);
  await agente.post('/api/login/google').set('Origin', 'https://otro.example').send({ credential: 'simulada' }).expect(403);
  expect(cliente.verifyIdToken).not.toHaveBeenCalled();
});

test('rechaza credenciales ausentes y no permite el login con contraseña en una cuenta solo Google', async () => {
  await agente.post('/api/login/google').set('Origin', origen).send({}).expect(400);
  await usuarios.agregarUsuario(new Usuario({ username: 'GooglePrueba', email: perfil.email, googleId: perfil.sub }));
  await agente.post('/api/login').send({ email: perfil.email, password: 'Clave1234' }).expect(401);
});

test('requiere configuración y no ofrece un Client ID vacío', async () => {
  app.use('/sin-configuracion', crearRouterGoogle(usuarios, { appUrl: origen, cliente }));
  await request(app).get('/sin-configuracion/config').expect(503);
});

test('cerrar sesión invalida la sesión del servidor y borra la cookie', async () => {
  const ingreso = await ingresar().expect(200);
  const cookieAnterior = ingreso.headers['set-cookie'][0].split(';')[0];
  const salida = await agente.post('/api/logout').set('Origin', origen).expect(200);
  expect(salida.headers['set-cookie'][0]).toContain('clase08.sid=;');
  expect((await agente.get('/api/login')).body.usuario).toBeNull();
  const repetida = await request(app).get('/api/login').set('Cookie', cookieAnterior).expect(200);
  expect(repetida.body.usuario).toBeNull();
});


test('si Google tarda demasiado responde 504 y no crea usuario ni sesión', async () => {
  const lento = { verifyIdToken: () => new Promise(() => {}) };
  app.use('/google-lento', crearRouterGoogle(usuarios, { clientId, appUrl: origen, cliente: lento, esperaMs: 20 }));
  app.use(manejarErrores);
  await agente.get('/google-lento/config').expect(200);
  const respuesta = await agente.post('/google-lento').set('Origin', origen).send({ credential: 'simulada' }).expect(504);
  expect(respuesta.body.detail).toContain('tardó demasiado');
  expect(usuarios.listar()).toHaveLength(0);
  expect((await agente.get('/api/login')).body.usuario).toBeNull();
});

test('guarda la foto verificada y la actualiza en el siguiente ingreso', async () => {
  perfil.picture = 'https://lh3.googleusercontent.com/foto-uno';
  const ingreso = await ingresar().expect(200);
  expect(ingreso.body.usuario.avatarUrl).toBe(perfil.picture);
  const restaurado = new RepositorioUsuarios(join(carpeta, 'usuarios.json'));
  await restaurado.cargar();
  expect(restaurado.listar()[0].avatarUrl).toBe(perfil.picture);
  nonce = (await agente.get('/api/login/google/config')).body.nonce;
  perfil.picture = 'https://lh3.googleusercontent.com/foto-dos';
  expect((await ingresar().expect(200)).body.usuario.avatarUrl).toBe(perfil.picture);
});

test('descarta una URL de foto ajena a Google y mantiene el ingreso', async () => {
  perfil.picture = 'https://otra.example/foto';
  expect((await ingresar().expect(200)).body.usuario.avatarUrl).toBeNull();
});


test('permite registrar dos cuentas normales después de una cuenta Google y volver a ingresar tras reiniciar', async () => {
  await ingresar().expect(200);
  for (const username of ['LocalUno', 'LocalDos']) {
    const alta = await request(app).post('/api/registro').send({
      username, email: username.toLowerCase() + '@example.com', password: 'Clave1234'
    }).expect(201);
    expect(alta.body.usuario).not.toHaveProperty('googleId');
    expect(usuarios.buscarPorId(alta.body.usuario.id).googleId).toBeNull();
  }
  const reiniciado = new RepositorioUsuarios(join(carpeta, 'usuarios.json'));
  await reiniciado.cargar();
  expect(reiniciado.listar()).toHaveLength(3);
  const otraApp = express();
  otraApp.use(express.json());
  otraApp.use(session({ secret: 'secreto-de-test', resave: false, saveUninitialized: false }));
  otraApp.use('/api/login', crearRouterLogin(reiniciado));
  const local = request.agent(otraApp);
  await local.post('/api/login').send({ email: 'localuno@example.com', password: 'Clave1234' }).expect(200);
  expect((await local.get('/api/login')).body.usuario.username).toBe('LocalUno');
  await local.post('/api/login').send({ email: 'localuno@example.com', password: 'Incorrecta' }).expect(401);
});

test('un fallo de conexión con Google devuelve 502 sin crear una sesión', async () => {
  cliente.verifyIdToken.mockRejectedValue(Object.assign(new Error('detalle interno'), { code: 'ENOTFOUND' }));
  const respuesta = await ingresar().expect(502);
  expect(respuesta.body.detail).toContain('temporalmente');
  expect(respuesta.body.detail).not.toContain('detalle interno');
  expect(usuarios.listar()).toHaveLength(0);
  expect((await agente.get('/api/login')).body.usuario).toBeNull();
});
