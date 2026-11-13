import { ErrorHttp } from '../src/Errores.js';

import express from 'express';

export default function crearRouterLogout() {
    const router = express.Router();

    router.post('/', (req, res, next) => {
        req.session.destroy((error) => {
            if (error) {

                return next(new ErrorHttp(500, 'Error al cerrar sesión'));
            }

            res.clearCookie('clase08.sid');

            return res.status(200).json({
                mensaje: 'Sesión cerrada correctamente'
            });
        });
    });

    return router;
}
