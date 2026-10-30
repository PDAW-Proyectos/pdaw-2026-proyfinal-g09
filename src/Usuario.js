import { randomUUID } from 'node:crypto';

export class Usuario {
  #username;
  #email;
  #esContribuyente;

  constructor({ id = randomUUID(), username, email, esContribuyente = false }) {
    if (typeof id !== 'string' || !id.trim()) {
      throw new TypeError('El id es obligatorio');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new TypeError('El email no es válido');
    }
    if (typeof esContribuyente !== 'boolean') {
      throw new TypeError('La condición de contribuyente debe ser booleana');
    }
    Object.defineProperty(this, 'id', { value: id, enumerable: true });
    this.actualizarPerfil(username);
    this.#email = email.trim().toLowerCase();
    this.#esContribuyente = esContribuyente;
  }

  get username() { return this.#username; }
  get email() { return this.#email; }
  get esContribuyente() { return this.#esContribuyente; }
  get rol() { return 'usuario'; }

  actualizarPerfil(username) {
    if (typeof username !== 'string' ||
        username.trim().length < 3 ||
        username.trim().length > 20) {
        throw new TypeError(
            'El nombre de usuario debe tener entre 3 y 20 caracteres'
        );
    }

    this.#username = username.trim();
  }

  habilitarContribuyente() { this.#esContribuyente = true; }
  revocarContribuyente() { this.#esContribuyente = false; }
  puedeJugarDemo() { return this.#esContribuyente; }
  puedeAccederPanel() { return false; }
  puedeGestionarUsuarios() { return false; }

  toJSON() {
    return {
      id: this.id,
      username: this.#username,
      email: this.#email,
      esContribuyente: this.#esContribuyente,
      rol: this.rol
    };
  }
}
