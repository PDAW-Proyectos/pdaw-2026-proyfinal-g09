import { Router } from 'express';
import requiereSesion from '../middlewares/requiereSesion.js';
import requiereAdmin from '../middlewares/requiereAdmin.js';

export function crearRouterNoticias(repositorio, repositorioUsuarios) {
    const router = Router();

    // Obtener todas las noticias
    router.get('/', (req, res) => {
        try {
            const noticias = repositorio.obtenerTodas();

            noticias.sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            const { pagina, limite } = req.query;

            if (pagina === undefined && limite === undefined) {
                return res.json(
                    noticias.map(noticia => noticia.toJSON())
                );
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
                return res.status(400).json({
                    error: 'Los parámetros de paginación no son válidos'
                });
            }

            const inicio = (numeroPagina - 1) * cantidad;

            const noticiasPaginadas = noticias.slice(
                inicio,
                inicio + cantidad
            );

            return res.json({
                noticias: noticiasPaginadas.map(
                    noticia => noticia.toJSON()
                ),
                pagina: numeroPagina,
                limite: cantidad,
                total: noticias.length,
                totalPaginas: Math.ceil(noticias.length / cantidad)
            });

        } catch (error) {
            console.error('Error al obtener noticias:', error);

            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    });

    // Obtener una noticia por identificador
    router.get('/:id', (req, res) => {
        try {
            const noticia = repositorio.buscarPorId(req.params.id);

            if (!noticia) {
                return res.status(404).json({
                    error: 'La noticia solicitada no existe.'
                });
            }

            return res.json(noticia.toJSON());

        } catch (error) {
            console.error('Error al obtener noticia:', error);

            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    });

    // Crear noticia (solo administradores)
    router.post(
        '/',
        requiereSesion(repositorioUsuarios),
        requiereAdmin,
        async (req, res) => {
            try {
                const { titulo, contenido } = req.body ?? {};

                if (
                    typeof titulo !== 'string' ||
                    typeof contenido !== 'string'
                ) {
                    return res.status(400).json({
                        error: 'El título y el contenido son obligatorios'
                    });
                }

                const tituloLimpio = titulo.trim();
                const contenidoLimpio = contenido.trim();

                if (
                    tituloLimpio.length < 5 ||
                    tituloLimpio.length > 100
                ) {
                    return res.status(400).json({
                        error: 'El título debe tener entre 5 y 100 caracteres'
                    });
                }

                if (
                    contenidoLimpio.length < 10 ||
                    contenidoLimpio.length > 2000
                ) {
                    return res.status(400).json({
                        error: 'El contenido debe tener entre 10 y 2000 caracteres'
                    });
                }

                const noticia = await repositorio.agregarNoticia({
                    titulo: tituloLimpio,
                    contenido: contenidoLimpio,
                    autor: req.usuario.username
                });

                return res.status(201).json({
                    mensaje: 'Noticia creada correctamente',
                    noticia: noticia.toJSON()
                });

            } catch (error) {
                console.error('Error al crear noticia:', error);

                return res.status(500).json({
                    error: 'No se pudo guardar la noticia'
                });
            }
        }
    );

    return router;
}