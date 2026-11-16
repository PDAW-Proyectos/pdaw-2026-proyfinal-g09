
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Noticia } from '../Noticias.js';

export class RepositorioNoticias {
    #noticias = [];
    #rutaArchivo;

    constructor(rutaArchivo = resolve('data/noticias.json')) {
        this.#rutaArchivo = rutaArchivo;
    }

    async cargar() {
        try {
            const contenido = await readFile(this.#rutaArchivo, 'utf-8');
            const noticias = JSON.parse(contenido);

            if (!Array.isArray(noticias)) {
                throw new Error('El archivo de noticias tiene un formato inválido');
            }

            this.#noticias = noticias.map(noticia => new Noticia({
                ...noticia,
                fecha: new Date(noticia.fecha)
            }));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.#noticias = [];
                await this.guardar();
            } else {
                throw error;
            }
        }
    }

    async guardar() {
        await mkdir(dirname(this.#rutaArchivo), { recursive: true });

        const contenido = this.#noticias.map(noticia => noticia.toJSON());

        await writeFile(
            this.#rutaArchivo,
            JSON.stringify(contenido, null, 2),
            'utf-8'
        );
    }

    obtenerTodas() {
        return [...this.#noticias];
    }

    buscarPorId(id) {
        return this.#noticias.find(noticia => noticia.id === id) || null;
    }

    async agregarNoticia(datos) {
        const noticia = new Noticia(datos);

        this.#noticias.push(noticia);

        await this.guardar();

        return noticia;
    }

    async actualizarNoticia(id, datos) {
        const indice = this.#noticias.findIndex(
            noticia => noticia.id === id
        );

        if (indice === -1) {
            return null;
        }

        const noticiaActual = this.#noticias[indice];

        const noticiaActualizada = new Noticia({
            id: noticiaActual.id,
            titulo: datos.titulo ?? noticiaActual.titulo,
            contenido: datos.contenido ?? noticiaActual.contenido,
            fecha: noticiaActual.fecha,
            autor: noticiaActual.autor
        });

        this.#noticias[indice] = noticiaActualizada;

        await this.guardar();

        return noticiaActualizada;
    }

    async eliminarNoticia(id) {
        const indice = this.#noticias.findIndex(
            noticia => noticia.id === id
        );

        if (indice === -1) {
            return false;
        }

        this.#noticias.splice(indice, 1);

        await this.guardar();

        return true;
    }
}
