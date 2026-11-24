# ADR 001: sesiones del servidor con cookie

Estado: implementada; justificación documentada retrospectivamente el 24/11/2026.

## Contexto

El sitio y la API se sirven desde Express en el mismo origen. Necesitamos conservar la identidad entre peticiones y permitir logout y comprobaciones de rol, con código acorde al alcance académico.

## Decisión

Usar express-session. La cookie `clase08.sid` identifica una sesión que contiene `usuarioId`. Se regenera la sesión al ingresar, se guarda antes de responder y se destruye al salir. HttpOnly limita su lectura desde JavaScript, SameSite=Lax restringe su envío entre sitios y Secure se activa en producción. El secreto firma la cookie; no cifra la contraseña.

## Alternativas y criterio

Alternativas técnicas para comparar: tokens de acceso gestionados por el cliente o sesiones persistidas en un almacenamiento externo. No se afirma que ambas se hayan prototipado. El mismo origen y la biblioteca conocida permiten un recorrido explícito de autenticación y permisos, sin implementar un ciclo propio de tokens.

## Consecuencias

Podemos consultar la identidad en servidor, invalidar la sesión al salir y verificar el rol en cada petición protegida. El almacenamiento actual está en memoria: reiniciar cierra sesiones y no es apropiado para varias instancias sin configuración adicional. HTTPS y un SESSION_SECRET propio son necesarios en producción. HttpOnly no reemplaza los controles de permisos ni elimina todo riesgo de solicitudes no deseadas.

## Evidencia

`server.js`, `routes/Login.routes.js`, `Google.routes.js`, `Logout.routes.js`, `middlewares/requiereSesion.js` y `requiereAdmin.js`. `tests/google.test.js` cubre creación y cierre de sesión, entre otros casos. La cookie no contiene el perfil ni la contraseña. Los usuarios persisten por separado.
