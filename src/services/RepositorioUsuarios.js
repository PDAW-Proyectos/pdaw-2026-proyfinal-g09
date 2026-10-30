import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Usuario } from '../Usuario.js';
import { Administrador } from '../Administrador.js';

export class RepositorioUsuarios {
  constructor(ruta) {
    this.ruta = ruta;
    this.usuarios = [];
  }

  async cargar() {
    try {
      const datos = JSON.parse(await readFile(this.ruta, 'utf8'));
      if (!Array.isArray(datos)) throw new Error('El archivo de usuarios no es válido');
      const usuarios = datos.map(dato => this.restaurar(dato));
      const ids = new Set(usuarios.map(usuario => usuario.id));
      const emails = new Set(usuarios.map(usuario => usuario.email));
      if (ids.size !== usuarios.length || emails.size !== usuarios.length) {
        throw new Error('El archivo contiene usuarios duplicados');
      }
      this.usuarios = usuarios;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.guardar();
    }
  }

  restaurar(datos) {
    if (datos.rol === 'administrador') return new Administrador(datos);
    if (datos.rol === 'usuario') return new Usuario(datos);
    throw new Error('El rol de usuario no es válido');
  }

  async guardar() {
    const datos = this.usuarios.map(usuario => usuario.paraPersistir());

    await mkdir(dirname(this.ruta), { recursive: true });
    await writeFile(this.ruta, JSON.stringify(datos, null, 2), 'utf8');
  }

  listar() { return [...this.usuarios]; }

  buscarPorId(id) {
    return this.usuarios.find(usuario => usuario.id === id) ?? null;
  }

  buscarPorEmail(email) {
    return this.usuarios.find(usuario => usuario.email === email.trim().toLowerCase()) ?? null;
  }

  async agregarUsuario(usuario) {
    if (!(usuario instanceof Usuario)) throw new TypeError('Se necesita un Usuario');
    if (this.buscarPorId(usuario.id)) throw new Error('El id ya está registrado');
    if (this.buscarPorEmail(usuario.email)) throw new Error('El email ya está registrado');
    this.usuarios.push(usuario);
    await this.guardar();
    return usuario;
  }

  async actualizarUsuario(usuario) {
    if (!(usuario instanceof Usuario)) throw new TypeError('Se necesita un Usuario');
    const indice = this.usuarios.findIndex(actual => actual.id === usuario.id);
    if (indice === -1) throw new Error('El usuario no existe');
    const mismoEmail = this.buscarPorEmail(usuario.email);
    if (mismoEmail && mismoEmail.id !== usuario.id) throw new Error('El email ya está registrado');
    this.usuarios[indice] = usuario;
    await this.guardar();
    return usuario;
  }
}
