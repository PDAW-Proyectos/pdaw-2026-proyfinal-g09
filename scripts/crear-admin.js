import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import { Administrador } from '../src/Administrador.js';
import { RepositorioUsuarios } from '../src/services/RepositorioUsuarios.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repositorio = new RepositorioUsuarios(
  path.join(directory, '..', 'data', 'usuarios.json')
);

await repositorio.cargar();

if (repositorio.listar().some(usuario => usuario.rol === 'admin')) {
  console.log('Ya existe una cuenta administradora. No se realizaron cambios.');
  process.exit(0);
}

const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Configurá ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env.');
  process.exitCode = 1;
} else if (ADMIN_PASSWORD.length < 8 || ADMIN_PASSWORD.length > 20) {
  console.error('ADMIN_PASSWORD debe tener entre 8 y 20 caracteres.');
  process.exitCode = 1;
} else {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = new Administrador({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    passwordHash
  });
  await repositorio.agregarUsuario(admin);
  console.log(`Cuenta administradora creada para ${admin.email}.`);
}
