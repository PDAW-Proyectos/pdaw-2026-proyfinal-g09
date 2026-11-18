import express from 'express';

import requiereSesion from '../middlewares/requiereSesion.js';
import requiereAdmin from '../middlewares/requiereAdmin.js';

export default function crearRouterAdmin(repositorioUsuarios, repositorioNoticias) {
    const router = express.Router();

    router.use(requiereSesion(repositorioUsuarios));
    router.use(requiereAdmin);


    router.get('/resumen', (req, res) => {
        const usuarios = repositorioUsuarios.listar();

        const resumen = {
            totalUsuarios: usuarios.length,
            administradores: usuarios.filter(usuario => usuario.rol === 'admin').length,
            usuariosRegistrados: usuarios.filter(usuario => usuario.rol === 'usuario').length,
            contribuyentes: usuarios.filter(usuario => usuario.esContribuyente).length
        };

        res.json(resumen);
    });


    router.get('/usuarios', (req, res) => {
        const usuarios = repositorioUsuarios.listar();

        res.json(usuarios.map(usuario => usuario.toJSON()));
    });

    router.patch('/usuarios/:id/acceso', async (req, res) => {
        const usuario = repositorioUsuarios.buscarPorId(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                error: 'El usuario no existe'
            });
        }

        const { esContribuyente } = req.body;

        if (typeof esContribuyente !== 'boolean') {
            return res.status(400).json({
                error: 'Debés indicar si el usuario será contribuyente'
            });
        }

        if (usuario.rol === 'admin') {
            return res.status(403).json({
                error: 'No se puede modificar el acceso de otro administrador'
            });
        }

        try {
            if (esContribuyente) {
                req.usuario.habilitarAcceso(usuario);
            } else {
                req.usuario.revocarAcceso(usuario);
            }

            await repositorioUsuarios.actualizarUsuario(usuario);

            return res.json({
                mensaje: esContribuyente
                    ? 'Acceso de contribuyente habilitado'
                    : 'Acceso de contribuyente revocado',
                usuario: usuario.toJSON()
            });

        } catch (error) {
            console.error('Error al modificar acceso:', error);

            return res.status(500).json({
                error: 'No se pudo actualizar el acceso del usuario'
            });
        }
    });

    router.get('/noticias', (req, res) => {
        try {
            const noticias = repositorioNoticias.obtenerTodas();

            noticias.sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            return res.json(
                noticias.map(noticia => noticia.toJSON())
            );

        } catch (error) {
            console.error('Error al obtener noticias:', error);

            return res.status(500).json({
                error: 'No se pudieron obtener las noticias'
            });
        }
    });

    router.post('/noticias', async (req, res) => {
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

            if (tituloLimpio.length < 5 || tituloLimpio.length > 100) {
                return res.status(400).json({
                    error: 'El título debe tener entre 5 y 100 caracteres'
                });
            }

            if (contenidoLimpio.length < 10 || contenidoLimpio.length > 2000) {
                return res.status(400).json({
                    error: 'El contenido debe tener entre 10 y 2000 caracteres'
                });
            }

            const noticia = await repositorioNoticias.agregarNoticia({
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
    });


    router.put('/noticias/:id', async (req, res) => {
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

            if (tituloLimpio.length < 5 || tituloLimpio.length > 100) {
                return res.status(400).json({
                    error: 'El título debe tener entre 5 y 100 caracteres'
                });
            }

            if (contenidoLimpio.length < 10 || contenidoLimpio.length > 2000) {
                return res.status(400).json({
                    error: 'El contenido debe tener entre 10 y 2000 caracteres'
                });
            }

            const noticia = await repositorioNoticias.actualizarNoticia(
                req.params.id,
                {
                    titulo: tituloLimpio,
                    contenido: contenidoLimpio
                }
            );

            if (!noticia) {
                return res.status(404).json({
                    error: 'La noticia no existe'
                });
            }

            return res.json({
                mensaje: 'Noticia modificada correctamente',
                noticia: noticia.toJSON()
            });

        } catch (error) {
            console.error('Error al modificar noticia:', error);

            return res.status(500).json({
                error: 'No se pudo modificar la noticia'
            });
        }
    });

    router.delete('/noticias/:id', async (req, res) => {
        try {
            const eliminada = await repositorioNoticias.eliminarNoticia(
                req.params.id
            );

            if (!eliminada) {
                return res.status(404).json({
                    error: 'La noticia no existe'
                });
            }

            return res.json({
                mensaje: 'Noticia eliminada correctamente'
            });

        } catch (error) {
            console.error('Error al eliminar noticia:', error);

            return res.status(500).json({
                error: 'No se pudo eliminar la noticia'
            });
        }
    });

    return router;
}
