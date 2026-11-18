import { Router } from 'express';
import requiereSesion from '../middlewares/requiereSesion.js';
import requiereAdmin from '../middlewares/requiereAdmin.js';

export function crearRouterNoticias(repositorioNoticias, repositorioUsuarios) {
    const router = Router();

    router.get('/', (req, res, next) => {
        try {
            const noticias = repositorioNoticias.obtenerTodas();

            noticias.sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            const resultado = obtenerListado(noticias, req.query);

            if (resultado.error) {
                return res.status(400).json({
                    error: resultado.error
                });
            }

            return res.json(resultado.datos);

        } catch (error) {
            next(error);
        }
    });


    router.get('/:id', (req, res, next) => {
        try {
            const { id } = req.params;

            const noticia = repositorioNoticias.obtenerPorId(id);

            if (!noticia) {
                return res.status(404).json({
                    error: 'La noticia solicitada no existe'
                });
            }

            return res.json(noticia.toJSON());

        } catch (error) {
            next(error);
        }
    });


    router.post(
        '/',
        requiereSesion(repositorioUsuarios),
        requiereAdmin,
        async (req, res, next) => {
            try {
                const { titulo, contenido } = req.body ?? {};

                const errorValidacion = validarDatos(titulo, contenido);

                if (errorValidacion) {
                    return res.status(400).json({
                        error: errorValidacion
                    });
                }

                const noticia = await repositorioNoticias.agregarNoticia({
                    titulo,
                    contenido,
                    autor: req.usuario.id
                });

                return res.status(201).json({
                    mensaje: 'Noticia creada correctamente',
                    noticia: noticia.toJSON()
                });

            } catch (error) {
                next(error);
            }
        }
    );

    return router;
}

function obtenerListado(noticias, parametros) {
    const { pagina, limite } = parametros;

    if (pagina === undefined && limite === undefined) {
        return {
            datos: noticias.map(noticia => noticia.toJSON())
        };
    }

    const numeroPagina = Number(pagina ?? 1);
    const cantidad = Number(limite ?? 10);

    if (
        !Number.isInteger(numeroPagina) ||
        !Number.isInteger(cantidad) ||
        numeroPagina < 1 ||
        cantidad < 1 ||
        cantidad > 50
    ) {
        return {
            error: 'Los parámetros de paginación no son válidos'
        };
    }

    const inicio = (numeroPagina - 1) * cantidad;
    const noticiasPaginadas = noticias.slice(inicio, inicio + cantidad);

    return {
        datos: {
            noticias: noticiasPaginadas.map(noticia => noticia.toJSON()),
            pagina: numeroPagina,
            limite: cantidad,
            total: noticias.length,
            totalPaginas: Math.ceil(noticias.length / cantidad)
        }
    };
}

function validarDatos(titulo, contenido) {
    if (typeof titulo !== 'string' || typeof contenido !== 'string') {
        return 'El título y el contenido son obligatorios';
    }

    const tituloLimpio = titulo.trim();
    const contenidoLimpio = contenido.trim();

    if (tituloLimpio.length < 5 || tituloLimpio.length > 100) {
        return 'El título debe tener entre 5 y 100 caracteres';
    }

    if (contenidoLimpio.length < 10 || contenidoLimpio.length > 2000) {
        return 'El contenido debe tener entre 10 y 2000 caracteres';
    }

    return null;
}
