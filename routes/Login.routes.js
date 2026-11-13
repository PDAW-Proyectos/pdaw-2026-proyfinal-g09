import { ErrorHttp } from '../src/Errores.js';

import express from 'express';
import bcrypt from 'bcrypt';

export default function crearRouterLogin(repositorioUsuarios) {
    const router = express.Router();

    router.post('/', async (req, res, next) => {
        try {
            const { email, password } = req.body ?? {};

            if (
                typeof email !== 'string' ||
                typeof password !== 'string' ||
                !email.trim() ||
                !password
            ) {
                return next(new ErrorHttp(400, 'Email y contraseña son obligatorios'));
            }

            const usuario = repositorioUsuarios.buscarPorEmail(email);

            if (!usuario || !usuario.passwordHash) {
                return next(new ErrorHttp(401, 'Credenciales inválidas'));
            }

            const contraseñaValida = await bcrypt.compare(
                password,
                usuario.passwordHash
            );

            if (!contraseñaValida) {
                return next(new ErrorHttp(401, 'Credenciales inválidas'));
            }

            req.session.regenerate((error) => {
                if (error) {
                    return next(new ErrorHttp(500, 'Error al crear la sesión'));
                }

                req.session.usuarioId = usuario.id;

                req.session.save((error) => {
                    if (error) {
                        return next(new ErrorHttp(500, 'Error al guardar la sesión'));
                    }

                    return res.status(200).json({
                        mensaje: 'Inicio de sesión correcto',
                        usuario: usuario.toJSON()
                    });
                });
            });

        } catch (error) {
            next(error);
        }
    });


    router.get('/', (req, res, next) => {
        res.set('Cache-Control', 'no-store');
        try {
            if (!req.session.usuarioId) {
                return res.status(200).json({
                    usuario: null
                });
            }
            const usuario = repositorioUsuarios.buscarPorId(
                req.session.usuarioId
            );
            if (!usuario) {
                return res.status(200).json({
                    usuario: null
                });
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
