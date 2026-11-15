
import express from 'express';

import requiereSesion from '../middlewares/requiereSesion.js';
import requiereAdmin from '../middlewares/requiereAdmin.js';

export default function crearRouterAdmin(repositorioUsuarios) {
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
            res.json({
                mensaje: esContribuyente
                    ? 'Acceso de contribuyente habilitado'
                    : 'Acceso de contribuyente revocado',
                usuario: usuario.toJSON()
            });
        } catch (_error) {
            res.status(500).json({
                error: 'No se pudo actualizar el acceso del usuario'
            });
        }
    });

    return router;
}
