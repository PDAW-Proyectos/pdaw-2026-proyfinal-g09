import { manejarErrores } from '../middlewares/errores.js';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import crearRouterRegistro from '../routes/Registro.routes.js';
import { RepositorioUsuarios } from '../src/services/RepositorioUsuarios.js';

let carpeta, archivo, repo, app;
const datos = { username: 'Nidodo', email: 'nidodo@example.com', password: 'Clave1234' };

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'nidodo-registro-'));
  archivo = join(carpeta, 'usuarios.json');
  repo = new RepositorioUsuarios(archivo);
  await repo.cargar();
  app = express();
  app.use(express.json());
  app.use('/api/registro', crearRouterRegistro(repo));
  app.use(manejarErrores);
});
afterEach(async () => { await rm(carpeta, { recursive: true, force: true }); });

test('registra, persiste un hash bcrypt real y no devuelve credenciales', async () => {
  const respuesta = await request(app).post('/api/registro').send({
    ...datos, username: ' Nidodo ', email: ' NIDODO@example.com ', rol: 'administrador', esContribuyente: true
  });
  expect(respuesta.status).toBe(201);
  expect(respuesta.body.usuario).toMatchObject({ username: 'Nidodo', email: datos.email, rol: 'usuario', esContribuyente: false });
  expect(respuesta.body.usuario).not.toHaveProperty('password');
  expect(respuesta.body.usuario).not.toHaveProperty('passwordHash');
  const [guardado] = JSON.parse(await readFile(archivo, 'utf8'));
  expect(guardado).not.toHaveProperty('password');
  expect(await bcrypt.compare(datos.password, guardado.passwordHash)).toBe(true);
  expect(await bcrypt.compare('Incorrecta', guardado.passwordHash)).toBe(false);
  const reiniciado = new RepositorioUsuarios(archivo);
  await reiniciado.cargar();
  expect(reiniciado.buscarPorId(guardado.id).passwordHash).toBe(guardado.passwordHash);
});

test('devuelve 409 para un email repetido aunque cambien espacios y mayúsculas', async () => {
  await request(app).post('/api/registro').send(datos).expect(201);
  await request(app).post('/api/registro').send({ ...datos, email: ' NIDODO@EXAMPLE.COM ' }).expect(409);
  expect(repo.listar()).toHaveLength(1);
});

test.each([
  {}, { username: 'ab' }, { username: 'a'.repeat(21) }, { username: 123 },
  { email: 'sin-arroba' }, { email: null }, { password: 'corta' },
  { password: 'a'.repeat(21) }, { password: 12345678 }
])('rechaza datos incompletos o inválidos sin guardar: %j', async cambios => {
  const cuerpo = Object.keys(cambios).length ? { ...datos, ...cambios } : {};
  const respuesta = await request(app).post('/api/registro').send(cuerpo);
  expect(respuesta.status).toBe(400);
  expect(respuesta.body.detail).toEqual(expect.any(String));
  expect(repo.listar()).toHaveLength(0);
  expect(JSON.parse(await readFile(archivo, 'utf8'))).toEqual([]);
});
