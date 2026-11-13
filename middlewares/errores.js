import { randomUUID } from 'node:crypto';
import { ErrorHttp } from '../src/Errores.js';

export function registrarSolicitud(req, res, next) {
  req.id = randomUUID();
  res.set('X-Request-Id', req.id);
  const inicio = Date.now();
  const ruta = req.originalUrl.split('?')[0];
  res.on('finish', () =>
    console.info(
      JSON.stringify({
        level: 'info',
        time: new Date().toISOString(),
        requestId: req.id,
        method: req.method,
        path: ruta,
        status: res.statusCode,
        ms: Date.now() - inicio,
      }),
    ),
  );
  next();
}

export function rutaNoEncontrada(req, res, next) {
  next(new ErrorHttp(404, 'El recurso solicitado no existe'));
}

export function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);
  const jsonInvalido = error.type === 'entity.parse.failed';
  const conocido = error instanceof ErrorHttp;
  const status = conocido ? error.status : jsonInvalido ? 400 : 500;
  const detail = conocido
    ? error.message
    : jsonInvalido
      ? 'El cuerpo de la solicitud no contiene un JSON válido'
      : 'No se pudo completar la solicitud. Volvé a intentar más tarde';
  const requestId = req.id || randomUUID();
  const level = status >= 500 ? 'error' : 'warn';
  console[level](
    JSON.stringify({
      level,
      time: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status,
      error: error.name,
    }),
  );
  res
    .set('X-Request-Id', requestId)
    .status(status)
    .type('application/problem+json')
    .json({
      type: 'about:blank',
      title: status >= 500 ? 'Error del servidor' : 'Solicitud rechazada',
      status,
      detail,
      instance: req.originalUrl.split('?')[0],
      requestId,
    });
}
