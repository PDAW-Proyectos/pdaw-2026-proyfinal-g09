import { randomUUID } from 'node:crypto';

export class Usuario {
  #nombre;
  #apellido;
  #email;
  #esContribuyente;

  constructor({ id = randomUUID(), nombre, apellido, email, esContribuyente = false }) {
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
    this.actualizarPerfil(nombre, apellido);
    this.#email = email.trim().toLowerCase();
    this.#esContribuyente = esContribuyente;
  }

  get nombre() { return this.#nombre; }
  get apellido() { return this.#apellido; }
  get email() { return this.#email; }
  get esContribuyente() { return this.#esContribuyente; }
  get rol() { return 'usuario'; }

  actualizarPerfil(nombre, apellido) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new TypeError('El nombre es obligatorio');
    }
    if (typeof apellido !== 'string' || !apellido.trim()) {
      throw new TypeError('El apellido es obligatorio');
    }
    this.#nombre = nombre.trim();
    this.#apellido = apellido.trim();
  }

  habilitarContribuyente() { this.#esContribuyente = true; }
  revocarContribuyente() { this.#esContribuyente = false; }
  puedeJugarDemo() { return this.#esContribuyente; }
  puedeAccederPanel() { return false; }
  puedeGestionarUsuarios() { return false; }

  toJSON() {
    return {
      id: this.id,
      nombre: this.#nombre,
      apellido: this.#apellido,
      email: this.#email,
      esContribuyente: this.#esContribuyente,
      rol: this.rol
    };
  }
}
