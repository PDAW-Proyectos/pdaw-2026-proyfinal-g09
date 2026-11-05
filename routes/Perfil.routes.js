import express from 'express';

export default function crearRouterPerfil(repositorioUsuarios) {
    const router = express.Router();

    router.get('/', (req, res) => {
        try {
            if (!req.session.usuarioId) {
                return res.status(401).json({
                    mensaje: 'No hay una sesión iniciada'
                });
            }
            const usuario = repositorioUsuarios.buscarPorId(
                req.session.usuarioId
            );
            if (!usuario) {
                return res.status(401).json({
                    mensaje: 'La sesión no corresponde a un usuario válido'
                });
            }
            return res.status(200).json({
                usuario: usuario.toJSON()
            });
        } catch (error) {
            console.error('Error al consultar el perfil:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar el perfil'
            });
        }
    });

    return router;
}
