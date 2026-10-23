import { Usuario } from './Usuario.js';

export class Administrador extends Usuario {
  get rol() { return 'administrador'; }

  puedeJugarDemo() { return true; }
  puedeAccederPanel() { return true; }
  puedeGestionarUsuarios() { return true; }

  habilitarAcceso(usuario) {
    this.#comprobarUsuario(usuario);
    usuario.habilitarContribuyente();
  }

  revocarAcceso(usuario) {
    this.#comprobarUsuario(usuario);
    usuario.revocarContribuyente();
  }

  #comprobarUsuario(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError('Se necesita una instancia de Usuario');
    }
  }
}