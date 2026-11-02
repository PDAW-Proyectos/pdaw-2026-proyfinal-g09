
import express from 'express';

export default function crearRouterLogout() {
    const router = express.Router();

    router.post('/', (req, res) => {
        req.session.destroy((error) => {
            if (error) {
                console.error('Error al cerrar sesión:', error);

                return res.status(500).json({
                    mensaje: 'Error al cerrar sesión'
                });
            }

            res.clearCookie('clase08.sid');

            return res.status(200).json({
                mensaje: 'Sesión cerrada correctamente'
            });
        });
    });

    return router;
}
