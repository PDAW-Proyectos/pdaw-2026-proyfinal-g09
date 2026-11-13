import { ErrorHttp } from '../src/Errores.js';
import express from 'express';

export default function crearRouterPerfil(repositorioUsuarios) {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        try {
            if (!req.session.usuarioId) {
                return next(new ErrorHttp(401, 'No hay una sesión iniciada'));
            }
            const usuario = repositorioUsuarios.buscarPorId(
                req.session.usuarioId
            );
            if (!usuario) {
                return next(new ErrorHttp(401, 'La sesión no corresponde a un usuario válido'));
            }
            return res.status(200).json({
                usuario: usuario.toJSON()
            });
        } catch (error) {
            next(error);
        }
    });

    return router;
}
