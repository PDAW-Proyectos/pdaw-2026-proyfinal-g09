
import express from 'express';
import bcrypt from 'bcrypt';

export default function crearRouterLogin(repositorioUsuarios) {
    const router = express.Router();

    router.post('/', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (
                typeof email !== 'string' ||
                typeof password !== 'string' ||
                !email.trim() ||
                !password
            ) {
                return res.status(400).json({
                    mensaje: 'Email y contraseña son obligatorios'
                });
            }

            const usuario = repositorioUsuarios.buscarPorEmail(email);

            if (!usuario || !usuario.passwordHash) {
                return res.status(401).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            const contraseñaValida = await bcrypt.compare(
                password,
                usuario.passwordHash
            );

            if (!contraseñaValida) {
                return res.status(401).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            req.session.regenerate((error) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: 'Error al crear la sesión'
                    });
                }

                req.session.usuarioId = usuario.id;

                req.session.save((error) => {
                    if (error) {
                        return res.status(500).json({
                            mensaje: 'Error al guardar la sesión'
                        });
                    }

                    return res.status(200).json({
                        mensaje: 'Inicio de sesión correcto',
                        usuario: usuario.toJSON()
                    });
                });
            });

        } catch (error) {
            console.error('Error al iniciar sesión:', error);

            return res.status(500).json({
                mensaje: 'Error al iniciar sesión'
            });
        }
    });


    router.get('/', (req, res) => {
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
            console.error('Error al consultar la sesión:', error);
            return res.status(500).json({
                mensaje: 'Error al consultar la sesión'
            });
        }
    });

    return router;
}
