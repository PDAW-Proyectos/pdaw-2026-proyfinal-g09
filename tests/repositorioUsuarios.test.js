import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RepositorioUsuarios } from '../src/services/RepositorioUsuarios.js';
import { Usuario } from '../src/Usuario.js';
import { Administrador } from '../src/Administrador.js';

let carpeta, archivo, repo;
const datos = { username: 'Nidodo', email: 'nidodo@example.com', passwordHash: '$2b$hash-de-prueba' };

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'nidodo-repositorio-'));
  archivo = join(carpeta, 'data', 'usuarios.json');
  repo = new RepositorioUsuarios(archivo);
  await repo.cargar();
});
afterEach(async () => { await rm(carpeta, { recursive: true, force: true }); });

test('crea el archivo vacío y devuelve null para búsquedas sin resultados', async () => {
  expect(JSON.parse(await readFile(archivo, 'utf8'))).toEqual([]);
  expect(repo.buscarPorId('inexistente')).toBeNull();
  expect(repo.buscarPorEmail('nadie@example.com')).toBeNull();
});

test('recupera perfiles, roles, permisos y hashes después de reiniciar', async () => {
  const usuario = await repo.agregarUsuario(new Usuario(datos));
  const admin = await repo.agregarUsuario(new Administrador({ ...datos, email: 'admin@example.com' }));
  usuario.actualizarPerfil('NuevoNombre');
  admin.habilitarAcceso(usuario);
  await repo.actualizarUsuario(usuario);
  const reiniciado = new RepositorioUsuarios(archivo);
  await reiniciado.cargar();
  const recuperado = reiniciado.buscarPorEmail(' NIDODO@EXAMPLE.COM ');
  expect(recuperado.id).toBe(usuario.id);
  expect(recuperado.username).toBe('NuevoNombre');
  expect(recuperado.puedeJugarDemo()).toBe(true);
  expect(recuperado.passwordHash).toBe(datos.passwordHash);
  expect(reiniciado.buscarPorId(admin.id)).toBeInstanceOf(Administrador);
  const lista = reiniciado.listar();
  lista.pop();
  expect(reiniciado.listar()).toHaveLength(2);
});

test('rechaza duplicados, actualizaciones inexistentes y objetos comunes', async () => {
  const usuario = await repo.agregarUsuario(new Usuario(datos));
  await expect(repo.agregarUsuario(usuario)).rejects.toThrow('id ya');
  await expect(repo.agregarUsuario(new Usuario({ ...datos, email: ' NIDODO@example.com ' }))).rejects.toThrow('email ya');
  await expect(repo.actualizarUsuario(new Usuario(datos))).rejects.toThrow('no existe');
  const otro = await repo.agregarUsuario(new Usuario({ ...datos, email: 'otro@example.com' }));
  await expect(repo.actualizarUsuario(new Usuario({ ...datos, id: otro.id }))).rejects.toThrow('email ya');
  await expect(repo.agregarUsuario({})).rejects.toThrow(TypeError);
  await expect(repo.actualizarUsuario({})).rejects.toThrow(TypeError);
  expect(repo.listar()).toHaveLength(2);
});

test.each(['{incompleto', '{}', JSON.stringify([{ ...datos, rol: 'desconocido' }]),
  JSON.stringify([{ ...datos, id: '1', rol: 'usuario' }, { ...datos, id: '2', rol: 'usuario' }])
])('no sobrescribe un archivo inválido: %s', async contenido => {
  await writeFile(archivo, contenido, 'utf8');
  await expect(new RepositorioUsuarios(archivo).cargar()).rejects.toThrow();
  expect(await readFile(archivo, 'utf8')).toBe(contenido);
});

test('conserva una cuenta de Google sin contraseña después de volver a cargar el archivo', async () => {
  const usuario = await repo.agregarUsuario(new Usuario({
    username: 'GooglePrueba', email: 'google@example.com', googleId: '123456789'
  }));
  const reiniciado = new RepositorioUsuarios(archivo);
  await reiniciado.cargar();
  const recuperado = reiniciado.buscarPorId(usuario.id);
  expect(recuperado.googleId).toBe('123456789');
  expect(reiniciado.buscarPorGoogleId('123456789').id).toBe(usuario.id);
  expect(reiniciado.buscarPorGoogleId(null)).toBeNull();
  expect(recuperado.passwordHash).toBeNull();
  expect(recuperado.toJSON()).not.toHaveProperty('googleId');
  await expect(reiniciado.agregarUsuario(new Usuario({
    username: 'OtraCuenta', email: 'otro-google@example.com', googleId: '123456789'
  }))).rejects.toThrow('Google ya');
});
