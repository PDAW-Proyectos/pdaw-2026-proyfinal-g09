import { ErrorHttp } from '../src/Errores.js';
import express from 'express';
import bcrypt from 'bcrypt';

export default function crearRouterPerfil(repositorioUsuarios) {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        try {
            if (!req.session.usuarioId) {
                return next(
                    new ErrorHttp(401, 'No hay una sesión iniciada')
                );
            }

            const usuario = repositorioUsuarios.buscarPorId(
                req.session.usuarioId
            );

            if (!usuario) {
                return next(
                    new ErrorHttp(
                        401,
                        'La sesión no corresponde a un usuario válido'
                    )
                );
            }

            return res.status(200).json({
                usuario: usuario.toJSON()
            });

        } catch (error) {
            next(error);
        }
    });

    router.put('/password', async (req, res, next) => {
        try {
            if (!req.session.usuarioId) {
                return next(
                    new ErrorHttp(401, 'No hay una sesión iniciada')
                );
            }

            const { passwordActual, passwordNueva } = req.body ?? {};

            if (
                typeof passwordActual !== 'string' ||
                typeof passwordNueva !== 'string' ||
                !passwordActual ||
                !passwordNueva
            ) {
                return next(
                    new ErrorHttp(
                        400,
                        'La contraseña actual y la nueva son obligatorias'
                    )
                );
            }

            if (
                passwordNueva.length < 8 ||
                passwordNueva.length > 20
            ) {
                return next(
                    new ErrorHttp(
                        400,
                        'La nueva contraseña debe tener entre 8 y 20 caracteres'
                    )
                );
            }

            if (passwordActual === passwordNueva) {
                return next(
                    new ErrorHttp(
                        400,
                        'La nueva contraseña debe ser diferente de la actual'
                    )
                );
            }

            const usuarioId = req.session.usuarioId;

            const usuario = repositorioUsuarios.buscarPorId(usuarioId);

            if (!usuario) {
                return next(
                    new ErrorHttp(
                        401,
                        'La sesión no corresponde a un usuario válido'
                    )
                );
            }

            if (!usuario.passwordHash) {
                return next(
                    new ErrorHttp(
                        400,
                        'Esta cuenta no tiene una contraseña local para modificar'
                    )
                );
            }

            const coincide = await bcrypt.compare(
                passwordActual,
                usuario.passwordHash
            );

            if (!coincide) {
                return next(
                    new ErrorHttp(
                        401,
                        'La contraseña actual es incorrecta'
                    )
                );
            }

            const nuevoHash = await bcrypt.hash(passwordNueva, 12);

            await repositorioUsuarios.actualizarPasswordHash(
                usuarioId,
                nuevoHash
            );

            await new Promise((resolve, reject) => {
                req.session.regenerate(error => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            req.session.usuarioId = usuarioId;

            await new Promise((resolve, reject) => {
                req.session.save(error => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            return res.status(200).json({
                mensaje: 'La contraseña se cambió correctamente'
            });

        } catch (error) {
            next(error);
        }
    });

    return router;
}
