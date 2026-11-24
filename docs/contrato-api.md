# Contrato de la API

Base local: `http://localhost:3000`. Cuerpos JSON con `Content-Type: application/json`. Las sesiones se identifican con la cookie `clase08.sid`; desde el mismo origen el navegador la envía con las peticiones. Este documento refleja las rutas de la versión `052a410`, no una API futura.

## Endpoints

| Método y ruta | Acceso | Entrada | Respuesta exitosa | Errores previstos |
| --- | --- | --- | --- | --- |
| POST `/api/registro` | Público | `username`, `email`, `password` | 201: `{mensaje, usuario}` | 400, 409, 500 |
| POST `/api/login` | Público | `email`, `password` | 200: `{mensaje, usuario}` y sesión | 400, 401, 500 |
| GET `/api/login` | Público | Cookie si existe | 200: `{usuario}` o `{usuario:null}` | 500 |
| POST `/api/logout` | Público | Sin cuerpo obligatorio | 200: `{mensaje}`; destruye sesión y borra cookie | 500 |
| GET `/api/login/google/config` | Público | Sin cuerpo | 200: `{clientId, nonce}`; guarda intento en sesión | 503, 500 |
| POST `/api/login/google` | Intento de Google válido | `{credential}` y cabecera `Origin` coincidente | 200: `{mensaje, usuario}` y sesión autenticada | 400, 401, 403, 409, 502, 503, 504, 500 |
| GET `/api/perfil` | Sesión | Cookie | 200: `{usuario}` | 401, 500 |
| PUT `/api/perfil/password` | Sesión y contraseña local | `passwordActual`, `passwordNueva` | 200: `{mensaje}`; renueva la sesión actual | 400, 401, 500 |
| GET `/api/noticias` | Público | Query opcional `pagina`, `limite` | 200: arreglo o resultado paginado | 400, 500 |
| GET `/api/noticias/:id` | Público | ID en ruta | 200: noticia | 404, 500 |
| POST `/api/noticias` | Administrador | `titulo`, `contenido` | 201: `{mensaje, noticia}` | 400, 401, 403, 500 |
| GET `/api/admin/resumen` | Administrador | Cookie | 200: contadores | 401, 403, 500 |
| GET `/api/admin/usuarios` | Administrador | Cookie | 200: arreglo de usuarios públicos | 401, 403, 500 |
| PATCH `/api/admin/usuarios/:id/acceso` | Administrador | ID y `{esContribuyente:boolean}` | 200: `{mensaje, usuario}` | 400, 401, 403, 404, 500 |
| GET `/api/admin/noticias` | Administrador | Cookie | 200: arreglo de noticias | 401, 403, 500 |
| POST `/api/admin/noticias` | Administrador | `titulo`, `contenido` | 201: `{mensaje, noticia}` | 400, 401, 403, 500 |
| PUT `/api/admin/noticias/:id` | Administrador | ID, `titulo`, `contenido` | 200: `{mensaje, noticia}` | 400, 401, 403, 404, 500 |
| DELETE `/api/admin/noticias/:id` | Administrador | ID en ruta | 200: `{mensaje}` | 401, 403, 404, 500 |

Las rutas inexistentes bajo `/api` responden 404. Los fallos inesperados que llegan al manejador común responden 500. Los valores 500 de la tabla incluyen fallos de persistencia y excepciones; no significan que exista una prueba para cada endpoint.

## Validaciones y representaciones

- Registro: nombre de 3 a 20 caracteres después de quitar espacios de extremos; correo válido y normalizado a minúsculas; contraseña de 8 a 20 caracteres. Se rechazan emails repetidos y `admin@admin.com`. El registro no acepta elevar el rol.
- Login: correo y contraseña deben ser cadenas no vacías. Se busca por correo y se usa `bcrypt.compare`. Una cuenta solo Google no admite login con contraseña local.
- Usuario público: `{id, username, email, esContribuyente, avatarUrl, rol}`. No contiene `passwordHash`, `googleId` ni el ID token.
- Noticias: título de 5 a 100 caracteres y contenido de 10 a 2000, después de quitar espacios de extremos. Autor tomado de `req.usuario.username`, no del cuerpo. Representación: `{id, titulo, contenido, fecha, autor}`; fecha serializada en ISO.
- Listado de noticias: sin query de paginación devuelve un arreglo. Si se manda `pagina` o `limite`, devuelve `{noticias, pagina, limite, total, totalPaginas}`. Valores predeterminados: página 1 y límite 10; página entera mayor o igual a 1 y límite entero de 1 a 50. Orden: fecha descendente.
- Resumen administrativo: `{totalUsuarios, administradores, usuariosRegistrados, contribuyentes}`. Los contadores no son categorías necesariamente disjuntas.
- Cambio de contraseña: nueva de 8 a 20 caracteres y distinta de la actual. Exige contraseña local existente y compara la actual. No implementa recuperación por email ni cierre de todas las demás sesiones.
- Acceso: no se permite modificar la condición de contribuyente de un administrador. El cambio afecta al modelo; los archivos de `/demo` siguen públicos.

## Flujo Google

1. GET de configuración crea un nonce ligado a la sesión, válido por diez minutos.
2. El navegador obtiene de Google el ID token y lo envía como `credential`.
3. POST exige el mismo origen configurado en `APP_URL`, un intento vigente y una credencial válida.
4. `verifyIdToken` verifica la credencial para nuestro Client ID. Se comprueban nonce, email verificado, formato del correo e identificador `sub`.
5. Se busca por `sub`, almacenado como `googleId`. Si el email pertenece a una cuenta local no se vincula automáticamente: responde 409.
6. Se crea o actualiza la cuenta y se regenera la sesión con su `usuarioId`. La espera del servidor tiene un límite de diez segundos.

El intento se consume al enviar el POST; después de fallar puede ser necesario volver a pedir configuración. La cookie de ese intento no significa que el usuario ya esté autenticado.

## Errores

El manejador común devuelve `application/problem+json` con `type`, `title`, `status`, `detail`, `instance` y `requestId`. Ejemplo ilustrativo:

```json
{"type":"about:blank","title":"Solicitud rechazada","status":401,"detail":"Credenciales inválidas","instance":"/api/login","requestId":"identificador-de-la-solicitud"}
```

El manejador usa Solicitud rechazada para errores 4xx y Error del servidor para 5xx. Los middlewares de acceso y las rutas de noticias y administración también responden JSON con `{error}`. El cliente debe leer `detail` o `error` según la respuesta; no se declara un formato único que el código aún no tiene.

| Estado | Significado |
| --- | --- |
| 400 | Datos o JSON inválidos. |
| 401 | Falta de autenticación válida. |
| 403 | Sin permiso u origen rechazado. |
| 404 | Recurso o endpoint inexistente. |
| 409 | Conflicto de cuenta. |
| 500 | Fallo interno. |
| 502 | Fallo externo reconocido en Google. |
| 503 | Google sin configuración. |
| 504 | Verificación de Google excede la espera. |

## Ejemplo de lectura pública

```js
const respuesta = await fetch('/api/noticias?pagina=1&limite=10');
const datos = await respuesta.json();
if (!respuesta.ok) throw new Error(datos.detail || datos.error);
console.log(datos.noticias);
```

`fetch` no rechaza automáticamente por 401 o 500: se comprueba `respuesta.ok`. No hay endpoints activos de pagos, foro ni salud en esta versión. `/demo/` es contenido estático público, no una ruta protegida de la API.

## Paginación en la interfaz

Desde main 052a410, el listado público solicita seis noticias por página mediante la query del endpoint. Administración obtiene los arreglos completos y los pagina en el navegador de a diez elementos; no hay paginación de servidor en los GET administrativos.
