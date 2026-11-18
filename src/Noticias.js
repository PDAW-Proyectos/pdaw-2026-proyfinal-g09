import { randomUUID } from 'node:crypto';

export class Noticia {
    #id;
    #titulo;
    #contenido;
    #fecha;
    #autor;

    constructor({
        id = randomUUID(),
        titulo,
        contenido,
        fecha = new Date(),
        autor
    }) {
        this.#validarId(id);
        this.#validarTitulo(titulo);
        this.#validarContenido(contenido);
        this.#validarFecha(fecha);
        this.#validarAutor(autor);

        this.#id = id;
        this.#titulo = titulo.trim();
        this.#contenido = contenido.trim();
        this.#fecha = fecha;
        this.#autor = autor.trim();
    }

    #validarId(id) {
        if (typeof id !== 'string' || !id.trim()) {
            throw new Error('El ID de la noticia es obligatorio');
        }
    }

    #validarTitulo(titulo) {
        if (
            typeof titulo !== 'string' ||
            titulo.trim().length < 5 ||
            titulo.trim().length > 100
        ) {
            throw new Error('El título debe tener entre 5 y 100 caracteres');
        }
    }

    #validarContenido(contenido) {
        if (
            typeof contenido !== 'string' ||
            contenido.trim().length < 10 ||
            contenido.trim().length > 2000
        ) {
            throw new Error('El contenido debe tener entre 10 y 2000 caracteres');
        }
    }

    #validarFecha(fecha) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
            throw new Error('La fecha de la noticia no es válida');
        }
    }

    #validarAutor(autor) {
        if (typeof autor !== 'string' || !autor.trim()) {
            throw new Error('El autor de la noticia es obligatorio');
        }
    }

    get id() {
        return this.#id;
    }

    get titulo() {
        return this.#titulo;
    }

    get contenido() {
        return this.#contenido;
    }

    get fecha() {
        return this.#fecha;
    }

    get autor() {
        return this.#autor;
    }

    toJSON() {
        return {
            id: this.#id,
            titulo: this.#titulo,
            contenido: this.#contenido,
            fecha: this.#fecha,
            autor: this.#autor
        };
    }
}
