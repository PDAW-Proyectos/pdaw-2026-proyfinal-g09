# La cochera de Nidodo

Somos el grupo 09 y este es nuestro proyecto para la materia Proyecto de Desarrollo de Aplicaciones Web.

La página presenta **La cochera de Nidodo**, nuestro juego de terror en primera persona. Durante el turno de noche de una cochera tenés que atender clientes, registrar tickets y mantener todo en funcionamiento mientras descubrís qué pasa en el lugar.

![La cochera de Nidodo](public/img/portada-nidodo.webp)

## Ficha del proyecto

| Aspecto | Descripción |
| --- | --- |
| Propuesta | Dar a conocer el juego y reunir una comunidad que acompañe su desarrollo. |
| Público | Personas interesadas en videojuegos independientes y de terror. |
| Funciones actuales | Presentación, galería, juego web, registro, ingreso, perfil, noticias y administración. |
| Acceso | Inicio, noticias y juego web públicos. Perfil con sesión y funciones administrativas con rol admin. |
| Ejecución local | http://localhost:3000/ |
| Despliegue | Todavía no se documentó una URL pública en este repositorio. |

## Funcionalidades

| Apartado | ¿Qué ofrece esta versión? |
| --- | --- |
| Inicio | Presentación del juego, características e imágenes. |
| Registro e ingreso | Cuentas comunes con nombre de usuario, email y contraseña; ingreso local o con Google y cierre de sesión. |
| Perfil | Consulta de datos y cambio de contraseña para cuentas con contraseña local. |
| Juego web | Exportación de Unity en otra pestaña, con opción de pantalla completa. Por ahora el acceso es libre. |
| Noticias | Listado público paginado y detalle de novedades. |
| Administración | Resumen y listado de usuarios, habilitación o revocación de la condición de contribuyente y creación, edición y eliminación de noticias. |

La condición de contribuyente existe en el modelo y se modifica desde administración, pero **todavía no protege el acceso a los archivos del juego**.

Las donaciones mediante Mercado Pago están pausadas y no forman parte de la versión activa. No hay confirmación de pagos ni desbloqueo automático. El foro queda pendiente.

## Integración con Google

Google Identity Services entrega al navegador una credencial firmada (ID token). El backend la verifica con `google-auth-library` antes de buscar o crear la cuenta y establecer una sesión de nuestra aplicación.

Se utilizan el identificador de Google, el email, el nombre y la foto cuando está disponible. La aplicación no recibe la contraseña de Google. Una cuenta local no se vincula automáticamente con Google por compartir email: se pide usar el método original.

## Equipo y roles

| Integrante | Roles |
| --- | --- |
| Leandro Liverotti | Scrum Master y desarrollador |
| Alexis Pokorny | Product Owner y desarrollador |

Los dos programamos y revisamos los cambios.

| Rol | Responsable | ¿Qué hace? |
| --- | --- | --- |
| Scrum Master | Leandro | Organiza el seguimiento del trabajo y ayuda a resolver las trabas del equipo. |
| Product Owner | Alexis | Define las prioridades y organiza las funcionalidades del backlog. |
| Desarrolladores | Leandro y Alexis | Programan, integran y revisan las distintas partes del proyecto. |

## Cómo abrir la página

Necesitás Node.js y npm. La integración continua está configurada con Node.js 22. Desde la raíz del proyecto:

```bash
npm ci
npm start
```

Entrá a [http://localhost:3000/](http://localhost:3000/). Para detener el servidor, presioná **Ctrl+C**.

### Configuración

El servidor carga las variables de un archivo `.env` en la raíz, excluido de Git. Para la ejecución local predeterminada no es necesario crearlo.

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto del servidor; por defecto, `3000`. |
| `APP_URL` | Origen esperado para Google; por defecto, `http://localhost:` seguido del puerto configurado. |
| `GOOGLE_CLIENT_ID` | Identificador público de Google. Hay uno predeterminado para los orígenes locales autorizados. |
| `SESSION_SECRET` | Secreto para firmar la cookie. En desarrollo se genera uno aleatorio al arrancar si falta. Es obligatorio en producción. |
| `NODE_ENV` | Con `production`, exige el secreto y activa cookies `Secure`, que requieren HTTPS. |
| `ADMIN_USERNAME` | Nombre del primer administrador, utilizado por el script. |
| `ADMIN_EMAIL` | Email del primer administrador, utilizado por el script. |
| `ADMIN_PASSWORD` | Contraseña del primer administrador, de 8 a 20 caracteres, utilizada por el script. |

Otro puerto o dominio puede requerir autorización en Google Cloud. Cambiar `APP_URL` no agrega esa autorización. Este flujo no utiliza un Client Secret de Google.

### Crear el primer administrador

El registro público siempre crea cuentas comunes. Configurá estas variables en `.env` con tus propios valores:

```env
ADMIN_USERNAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=elegi-una-clave
```

Ejecutá `npm run crear-admin`. Si ya existe un administrador, el script no hace cambios. Si no existe, guarda la cuenta en `data/usuarios.json` con un **hash generado con bcrypt**. Después podés quitar `ADMIN_PASSWORD` del `.env`.

Si el servidor estaba encendido, reinicialo para cargar la cuenta creada por el script. Iniciá sesión y abrí `/Admin.html`. Los endpoints del panel verifican sesión y rol en el servidor.

### Probar el juego

Elegí **Jugar en otra pestaña** desde Inicio o entrá a [http://localhost:3000/demo/](http://localhost:3000/demo/). La primera carga puede tardar porque descarga los archivos del juego.

Necesitás teclado y mouse: **WASD** para caminar, **E** para interactuar y **Escape** para pausar. No necesitás Unity instalado para jugar esta exportación; el editor es necesario para generar una nueva versión.

## Datos y sesiones

Los repositorios guardan usuarios y noticias en `data/usuarios.json` y `data/noticias.json`. Los datos sobreviven al reinicio mientras se conserven esos archivos. `data` está fuera de `public` y no se sirve como contenido estático.

Las contraseñas locales se guardan como hashes de bcrypt. Las respuestas públicas de usuarios omiten el hash y el identificador de Google.

Las sesiones están en memoria del servidor y se identifican mediante la cookie `clase08.sid`, con `HttpOnly`, `SameSite=Lax` y duración configurada de una hora. **Reiniciar el servidor elimina las sesiones, pero no las cuentas guardadas.** Cerrar sesión destruye la sesión y elimina la cookie.

## Pruebas y revisión del código

Después de instalar las dependencias:

| Comando | Uso |
| --- | --- |
| `npm test` | Ejecuta las pruebas con Jest y Supertest. |
| `npm run test:coverage` | Ejecuta las pruebas y genera el informe de cobertura. |
| `npm run lint` | Busca errores y advierte sobre complejidad en nuestro JavaScript. |
| `npm run format:check` | Revisa el formato de los archivos incluidos en el script de Prettier. |
| `npm run format` | Aplica formato a esos mismos archivos. |

Las pruebas cubren modelos de usuarios y administrador, validaciones, persistencia, registro, compatibilidad entre cuentas locales y Google, sesiones y logout, avatar y manejo de errores. Google se simula: estas pruebas no reemplazan la comprobación real del ingreso con una cuenta de Google.

Los tests de persistencia usan archivos temporales y no modifican `data/usuarios.json`. No hay suites específicas para el CRUD de noticias, los endpoints administrativos ni el cambio de contraseña. Tampoco prueban el gameplay de Unity.

GitHub Actions ejecuta instalación, lint, revisión de formato y tests en los PR y ante cambios en `main`. Unity queda fuera de lint y formato; Prettier no se aplica a todo el repositorio.

## Organización del proyecto

| Ubicación | Contenido |
| --- | --- |
| `server.js` | Configuración de Express, sesiones, archivos públicos, routers y arranque. |
| `public` | HTML, CSS, imágenes y JavaScript del navegador. |
| `routes` | Endpoints HTTP que reciben solicitudes y coordinan respuestas. |
| `middlewares` | Controles de sesión y rol, registro de solicitudes y manejo de errores. |
| `src` | Modelos como Usuario, Administrador y Noticia. |
| `src/services` | Repositorios de usuarios y noticias. |
| `scripts` | Creación del primer administrador. |
| `tests` | Pruebas automáticas. |
| `data` | Archivos de datos del servidor. |
| `docs` | Diagramas, boceto y evidencias de verificaciones anteriores. |
| `La-cochera-exportacion-web` | Exportación del juego para el navegador. |

## Diagramas y diseño

En [docs](docs/) están:

- [Diagrama de contexto](docs/diagrama-contexto.png).
- [Diagrama de clases del dominio](docs/diagrama-clases-dominio.png).
- [Mapa de navegabilidad](docs/mapa-navegabilidad.png).
- [Boceto de la página principal](docs/wireframe-inicio.jpeg).
- [Verificación de la actualización del juego web](docs/verificacion-juego-web.pdf).

La documentación actualizada está en el [índice de docs](docs/index.pdf): contrato de API, arquitectura, decisiones, guía de uso y lecciones aprendidas. Los diagramas actuales reflejan el código implementado; los JPEG anteriores se conservan en `docs/historico`. El wireframe inicial y las capturas Lighthouse son antecedentes históricos.

Las tareas se organizan en los [issues del repositorio](https://github.com/PDAW-Proyectos/pdaw-2026-proyfinal-g09/issues). Trabajamos con ramas y pull requests para revisar e integrar cambios.

## Errores de la API

Los errores derivados al manejador común usan `application/problem+json`, con mensaje en `detail` y `requestId`. Administración, noticias y los controles de acceso también usan respuestas con `{ "error": "mensaje" }`. El formato todavía no está unificado en toda la API.

| Código | Situación |
| --- | --- |
| 400 | Datos inválidos, paginación incorrecta o JSON mal formado. |
| 401 | Credenciales incorrectas o ausencia de una sesión válida. |
| 403 | Falta de permisos de administrador, operación administrativa no permitida u origen no permitido en Google. |
| 404 | Recurso o ruta de la API inexistente. |
| 409 | Conflicto al registrar una cuenta o al ingresar con otro método. |
| 500 | Fallo interno del servidor. |
| 502 | Fallo de conexión reconocido al verificar la credencial de Google. |
| 503 | Ingreso con Google sin configuración disponible. |
| 504 | Tiempo de espera agotado al verificar la credencial de Google. |

El registro común de solicitudes de la API incluye método, ruta, estado, duración e identificador; no incluye cuerpos de solicitudes, contraseñas, cookies ni credenciales.

## Pendientes para la entrega

- Documentar la URL pública y completar la preparación para producción: el servidor escucha en `127.0.0.1`, las sesiones están en memoria y los datos dependen de archivos locales.
- Revisar entre ambos integrantes la documentación antes de entregar.
- Completar las pruebas de noticias, endpoints administrativos y cambio de contraseña.
- Retomar donaciones y protección del juego cuando se defina su alcance.

Para desplegar en Linux hay que corregir la diferencia de mayúsculas entre los imports de Admin/Noticias en `server.js` y los nombres de los archivos versionados. Esta actualización de documentación no modifica el código del servidor.
