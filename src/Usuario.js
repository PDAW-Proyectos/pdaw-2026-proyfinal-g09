import { randomUUID } from 'node:crypto';

export class Usuario {
  #username;
  #email;
  #esContribuyente;
  #passwordHash;
  #rol;
  #googleId;
  #avatarUrl;

  constructor({id = randomUUID(),username,email,passwordHash = null,googleId = null,avatarUrl = null,esContribuyente = false,rol = 'usuario'}) {
    if (typeof id !== 'string' || !id.trim()) {
      throw new TypeError('El id es obligatorio');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new TypeError('El email no es válido');
    }
    if (googleId !== null && (typeof googleId !== 'string' || !googleId.trim() || googleId !== googleId.trim() || googleId.length > 255)) {
      throw new TypeError('El identificador de Google no es válido');
    }
    if (passwordHash === null && googleId === null) throw new TypeError('Se necesita contraseña o cuenta de Google');
    this.#googleId = googleId;
    this.actualizarAvatar(avatarUrl);
    if (passwordHash !== null && (typeof passwordHash !== 'string' || !passwordHash.startsWith('$2'))) {
    throw new TypeError('El hash de la contraseña no es válido');
    }
    this.#passwordHash = passwordHash;
    if (typeof esContribuyente !== 'boolean') {
      throw new TypeError('La condición de contribuyente debe ser booleana');
    }
    Object.defineProperty(this, 'id', { value: id, enumerable: true });
    this.actualizarPerfil(username);
    this.#email = email.trim().toLowerCase();
    this.#esContribuyente = esContribuyente;
    
    if (!['usuario', 'admin'].includes(rol)) {
      throw new TypeError('El rol debe ser usuario o admin');
    }
    this.#rol = rol;
  }

  get avatarUrl() { return this.#avatarUrl; }

  actualizarAvatar(url) {
    this.#avatarUrl = null;
    if (typeof url !== 'string') return;
    try {
      const destino = new URL(url);
      if (destino.protocol === 'https:' && !destino.username && !destino.password &&
          (destino.hostname === 'googleusercontent.com' || destino.hostname.endsWith('.googleusercontent.com'))) {
        this.#avatarUrl = destino.href;
      }
    } catch { /* Sin foto válida se utiliza el avatar predeterminado. */ }
  }

  get googleId() { return this.#googleId; }
  get username() { return this.#username; }
  get email() { return this.#email; }
  get esContribuyente() { return this.#esContribuyente; }
  get rol() { return this.#rol; }
  get passwordHash() {return this.#passwordHash;}

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

  paraPersistir() {
    return {
        ...this.toJSON(),
        passwordHash: this.#passwordHash,
        googleId: this.#googleId
    };
  }

  toJSON() {
    return {
      id: this.id,
      username: this.#username,
      email: this.#email,
      esContribuyente: this.#esContribuyente,
      avatarUrl: this.#avatarUrl,
      rol: this.rol
    };
  }
}
