import { jest } from '@jest/globals';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import { registrarSolicitud, manejarErrores, rutaNoEncontrada } from '../middlewares/errores.js';
import crearRouterRegistro from '../routes/Registro.routes.js';
import crearRouterPerfil from '../routes/Perfil.routes.js';
import { ErrorHttp } from '../src/Errores.js';

let registros;
beforeEach(() => {
  registros = [];
  for (const nivel of ['info', 'warn', 'error']) {
    jest.spyOn(console, nivel).mockImplementation((linea) => registros.push(JSON.parse(linea)));
  }
});
afterEach(() => jest.restoreAllMocks());

function crearApp(repo = {}) {
  const app = express();
  app.use(registrarSolicitud);
  app.use(express.json());
  app.use(session({ secret: 'solo-pruebas', resave: false, saveUninitialized: false }));
  app.use('/api/registro', crearRouterRegistro(repo));
  app.use('/api/perfil', crearRouterPerfil(repo));
  app.get('/api/externo', () => {
    throw new ErrorHttp(502, 'Servicio temporalmente no disponible');
  });
  app.get('/api/defecto', () => {
    throw new Error('password=secreto; G:/ruta/privada');
  });
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}

test.each([
  ['/api/perfil', 401],
  ['/api/inexistente', 404],
  ['/api/externo', 502],
  ['/api/defecto', 500],
])('%s devuelve un error uniforme %i y permite correlacionar el registro', async (ruta, status) => {
  const respuesta = await request(crearApp()).get(ruta);
  expect(respuesta.status).toBe(status);
  expect(respuesta.headers['content-type']).toContain('application/problem+json');
  expect(respuesta.body).toMatchObject({ type: 'about:blank', status, instance: ruta });
  expect(respuesta.body.requestId).toBe(respuesta.headers['x-request-id']);
  expect(registros).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ requestId: respuesta.body.requestId, status }),
    ]),
  );
  expect(JSON.stringify([respuesta.body, registros])).not.toMatch(/password=secreto|privada/);
});

test('un fallo al guardar devuelve 500, nunca un error de datos 400', async () => {
  const repo = {
    buscarPorEmail: () => null,
    agregarUsuario: async () => {
      throw new Error('archivo privado');
    },
  };
  const respuesta = await request(crearApp(repo)).post('/api/registro').send({
    username: 'Nidodo',
    email: 'persona@example.com',
    password: 'Clave1234',
  });
  expect(respuesta.status).toBe(500);
  expect(respuesta.body.detail).not.toContain('archivo privado');
  expect(JSON.stringify(registros)).not.toMatch(/persona@example.com|Clave1234/);
});

test('JSON mal formado devuelve 400 sin mostrar su contenido', async () => {
  const respuesta = await request(crearApp())
    .post('/api/registro')
    .set('Content-Type', 'application/json')
    .send('{"password":"secreto"');
  expect(respuesta.status).toBe(400);
  expect(respuesta.body.detail).toContain('JSON válido');
  expect(JSON.stringify([respuesta.body, registros])).not.toContain('secreto');
});
