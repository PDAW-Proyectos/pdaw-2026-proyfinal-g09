import { Usuario } from '../src/Usuario.js';
import { Administrador } from '../src/Administrador.js';

// Las clases reciben un hash ya generado; la ruta se prueba con bcrypt real.
const datos = { username: 'Nidodo', email: 'nidodo@example.com', passwordHash: '$2b$hash-de-prueba' };

test('normaliza el perfil, genera IDs distintos y no expone el hash en JSON', () => {
  const usuario = new Usuario({ ...datos, username: ' Nidodo ', email: ' NIDODO@example.com ' });
  expect(usuario.username).toBe('Nidodo');
  expect(usuario.email).toBe('nidodo@example.com');
  expect(usuario.id).not.toBe(new Usuario(datos).id);
  expect(() => { usuario.id = 'otro'; }).toThrow(TypeError);
  expect(JSON.parse(JSON.stringify(usuario))).not.toHaveProperty('passwordHash');
  expect(usuario.paraPersistir().passwordHash).toBe(datos.passwordHash);
});

test.each([
  { username: 'ab' }, { username: 'a'.repeat(21) }, { email: 'incorrecto' },
  { id: '' }, { passwordHash: 'texto-plano' }, { esContribuyente: 'si' }
])('rechaza datos inválidos: %j', cambio => {
  expect(() => new Usuario({ ...datos, ...cambio })).toThrow(TypeError);
});

test('un usuario común no administra y necesita ser contribuyente para jugar', () => {
  const usuario = new Usuario(datos);
  expect(usuario.puedeAccederPanel()).toBe(false);
  expect(usuario.puedeGestionarUsuarios()).toBe(false);
  expect(usuario.puedeJugarDemo()).toBe(false);
  usuario.habilitarContribuyente();
  expect(usuario.puedeJugarDemo()).toBe(true);
  usuario.revocarContribuyente();
  expect(usuario.puedeJugarDemo()).toBe(false);
});

test('el administrador hereda de Usuario y puede gestionar el acceso', () => {
  const admin = new Administrador(datos);
  const usuario = new Usuario({ ...datos, email: 'otro@example.com' });
  expect(admin).toBeInstanceOf(Usuario);
  expect(admin.toJSON().rol).toBe('administrador');
  expect(admin.puedeAccederPanel()).toBe(true);
  expect(admin.puedeGestionarUsuarios()).toBe(true);
  expect(admin.puedeJugarDemo()).toBe(true);
  admin.habilitarAcceso(usuario);
  expect(usuario.puedeJugarDemo()).toBe(true);
  admin.revocarAcceso(usuario);
  expect(usuario.puedeJugarDemo()).toBe(false);
  expect(() => admin.habilitarAcceso({})).toThrow(TypeError);
  expect(() => admin.revocarAcceso(null)).toThrow(TypeError);
});
