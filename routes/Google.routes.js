import { ErrorHttp } from '../src/Errores.js';
import { Router } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../src/Usuario.js';

export default function crearRouterGoogle(usuarios, {
  clientId, appUrl, cliente = new OAuth2Client(), esperaMs = 10000
}) {
  const router = Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  router.get('/config', (req, res, next) => {
    if (!clientId) return next(new ErrorHttp(503, 'El ingreso con Google todavía no está configurado'));
    // Google incluirá este valor en la credencial firmada para vincularla a esta sesión.
    const nonce = randomBytes(32).toString('hex');
    req.session.googleIngreso = { nonce, vence: Date.now() + 10 * 60 * 1000 };
    res.json({ clientId, nonce });
  });

  router.post('/', async (req, res, next) => {
    if (!clientId) return next(new ErrorHttp(503, 'El ingreso con Google todavía no está configurado'));
    if (req.get('Origin') !== new URL(appUrl).origin) {
      return next(new ErrorHttp(403, 'El origen de la solicitud no es válido'));
    }
    const intento = req.session.googleIngreso;
    delete req.session.googleIngreso;
    if (!intento || intento.vence < Date.now()) {
      return next(new ErrorHttp(401, 'Volvé a iniciar el ingreso con Google'));
    }
    const credential = req.body?.credential;
    if (typeof credential !== 'string' || !credential || credential.length > 16000) {
      return next(new ErrorHttp(400, 'Falta una credencial válida de Google'));
    }

    let perfil;
    let temporizador;
    try {
      const demora = new Promise((_, reject) => {
        temporizador = setTimeout(() => {
          const error = new Error('Google tardó demasiado');
          error.name = 'TimeoutError';
          reject(error);
        }, esperaMs);
      });
      const ticket = await Promise.race([
        cliente.verifyIdToken({ idToken: credential, audience: clientId }), demora
      ]);
      perfil = ticket.getPayload();
      const recibido = Buffer.from(typeof perfil?.nonce === 'string' ? perfil.nonce : '');
      const esperado = Buffer.from(intento.nonce);
      if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado) ||
          perfil.email_verified !== true || typeof perfil.email !== 'string' ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email) ||
          typeof perfil.sub !== 'string' || !perfil.sub.trim() ||
          perfil.sub !== perfil.sub.trim() || perfil.sub.length > 255) {
        throw new Error('Identidad inválida');
      }
    } catch (error) {
      if (error.name === 'TimeoutError') return next(new ErrorHttp(504, 'Google tardó demasiado en responder. Volvé a cargar la página e intentá otra vez'));
      if (['ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code) || error.response?.status >= 500) {
        return next(new ErrorHttp(502, 'Google no está disponible temporalmente. Volvé a intentar más tarde'));
      }
      return next(new ErrorHttp(401, 'No se pudo verificar tu identidad con Google. Volvé a intentar'));
    } finally {
      clearTimeout(temporizador);
    }

    try {
      let usuario = usuarios.buscarPorGoogleId(perfil.sub);
      if (!usuario) {
        if (usuarios.buscarPorEmail(perfil.email)) {
          return next(new ErrorHttp(409, 'Usá el método de ingreso original de esta cuenta. La vinculación con Google todavía no está disponible'));
        }
        const nombre = typeof perfil.name === 'string' ? perfil.name.trim().slice(0, 20) : '';
        usuario = new Usuario({
          username: nombre.length >= 3 ? nombre : 'UsuarioGoogle',
          email: perfil.email, googleId: perfil.sub, avatarUrl: perfil.picture
        });
        await usuarios.agregarUsuario(usuario);
      }
      if (usuario.avatarUrl !== (perfil.picture || null)) {
        usuario.actualizarAvatar(perfil.picture);
        await usuarios.actualizarUsuario(usuario);
      }
      req.session.regenerate(error => {
        if (error) return next(new ErrorHttp(500, 'No se pudo crear la sesión'));
        req.session.usuarioId = usuario.id;
        req.session.save(error => {
          if (error) return next(new ErrorHttp(500, 'No se pudo guardar la sesión'));
          res.json({ mensaje: 'Inicio de sesión correcto', usuario: usuario.toJSON() });
        });
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
