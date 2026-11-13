import { ErrorHttp } from '../src/Errores.js';
import { Router } from "express";
import { Usuario } from "../src/Usuario.js";
import bcrypt from "bcrypt";

export default function crearRouterRegistro(repositorio) {
    const router = Router();

    router.post("/", async (req, res, next) => {
        try {
            const { username, email, password } = req.body ?? {};
            if (typeof username !== "string" ||
                username.trim().length < 3 ||
                username.trim().length > 20) {
                return next(new ErrorHttp(400, "El nombre de usuario debe tener entre 3 y 20 caracteres"));
            }
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (typeof email !== "string" ||
                !regexEmail.test(email.trim())) {
                return next(new ErrorHttp(400, "El correo electrónico no es válido"));
            }
            if (typeof password !== "string" ||
                password.length < 8 ||
                password.length > 20) {
                return next(new ErrorHttp(400, "La contraseña debe tener entre 8 y 20 caracteres"));
            }

            const emailNormalizado = email.trim().toLowerCase();

            if (repositorio.buscarPorEmail(emailNormalizado)) {
                return next(new ErrorHttp(409, "No se pudo registrar la cuenta con esos datos. Revisalos o iniciá sesión"));
            }
            const passwordHash = await bcrypt.hash(password, 12);

            const usuario = new Usuario({
                username: username.trim(),
                email: emailNormalizado,
                passwordHash
            });
            await repositorio.agregarUsuario(usuario);
            return res.status(201).json({
                mensaje: "Usuario registrado correctamente",
                usuario: usuario.toJSON()
            });
        } catch (error) {
            next(error);
        }
    });
    return router;
}
