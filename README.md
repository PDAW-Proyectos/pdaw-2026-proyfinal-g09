# La cochera de Nidodo

Somos el grupo 09 y este es nuestro proyecto para la materia Proyecto de Desarrollo de Aplicaciones Web.

La idea es hacer una página para nuestro juego **La cochera de Nidodo**, un juego de terror en primera persona en el que trabajás durante el turno de noche de una cochera. Tenés que atender clientes, registrar tickets y mantener todo en funcionamiento mientras descubrís qué pasa en el lugar.

![La cochera de Nidodo](public/img/portada-nidodo.webp)

## Ficha del proyecto

| Aspecto | Descripción |
| --- | --- |
| Propuesta | Dar a conocer el juego y reunir una comunidad que acompañe su desarrollo. |
| Público | Personas interesadas en los videojuegos independientes y de terror. |
| Funciones principales | Presentación del juego, galería, demo jugable, donaciones, foro y novedades. |
| Acceso | La información es pública. Cada persona puede registrarse con email y contraseña o ingresar con Google. |
| Donaciones | Un aporte al proyecto permite obtener acceso permanente a la demo. |
| Administración | Gestión de la comunidad, publicaciones y acceso al juego. |

## Funcionalidades

| Apartado | ¿Qué ofrece? |
| --- | --- |
| Inicio | Información del juego, sus características e imágenes. |
| Registro e ingreso | Una cuenta para participar y acceder a los beneficios del proyecto. |
| Demo | Una versión del juego para probar directamente desde el navegador. |
| Donaciones | Una forma de ayudar al desarrollo y habilitar la demo para la cuenta. |
| Foro | Un espacio para compartir opiniones y hablar sobre el juego. |
| Novedades | Publicaciones sobre los avances del proyecto. |
| Panel de administración | Herramientas para gestionar usuarios, publicaciones y permisos. |

## APIs elegidas

| API | ¿Para qué la usamos? |
| --- | --- |
| Google | Inicio de sesión con una cuenta de Google. |
| Mercado Pago | Recepción de donaciones para acompañar el desarrollo del juego. |

## Equipo y roles

| Integrante | Roles |
| --- | --- |
| Leandro Liverotti | Scrum Master y desarrollador |
| Alexis Pokorny | Product Owner y desarrollador |

Los dos programamos y revisamos los cambios. Además, nos repartimos la organización del equipo:

| Rol | Responsable | ¿Qué hace? |
| --- | --- | --- |
| Scrum Master | Leandro | Ayuda a organizar el trabajo, seguir las tareas y resolver las trabas del equipo. |
| Product Owner | Alexis Pokorny | Define las prioridades y organiza las funcionalidades del backlog. |
| Desarrolladores | Leandro y Alexis | Programan, integran y revisan las distintas partes del proyecto. |

## Cómo abrir la página

Necesitás tener instalado Node.js. Desde la carpeta del proyecto, ejecutá:

```bash
npm install
npm start
```

Después entrá a [http://localhost:3000/](http://localhost:3000/).

La demo de prueba se abre desde la página o entrando a [http://localhost:3000/demo/](http://localhost:3000/demo/). La primera carga puede tardar porque descarga los archivos del juego. Para jugar necesitás teclado y mouse: **WASD** para caminar, **E** para interactuar y **Escape** para pausar.

No hace falta tener Unity instalado para abrir esta versión. Para cerrar el servidor, presioná **Ctrl+C** en la terminal.

## Carpetas del proyecto

| Carpeta | Contenido |
| --- | --- |
| `public` | Páginas, estilos, imágenes y JavaScript del navegador. |
| `src` | Clases y lógica del servidor. |
| `routes` | Rutas de la API. |
| `data` | Archivos donde se guarda la información. |
| `docs` | Diagramas y boceto de la página. |
| `La-cochera-exportacion-web` | Versión del juego para el navegador. |

## Diagramas y diseño

En la carpeta [docs](docs/) están los documentos que usamos para organizar la idea:

- [Diagrama de contexto](docs/diagrama-contexto.jpeg).
- [Diagrama de clases](docs/diagrama-clases-dominio.jpeg).
- [Mapa de navegabilidad](docs/mapa-navegabilidad.jpeg).
- [Boceto de la página principal](docs/wireframe-inicio.jpeg).

Las tareas se organizan en los [issues del repositorio](https://github.com/PDAW-Proyectos/pdaw-2026-proyfinal-g09/issues), y trabajamos con ramas y pull requests para integrar los cambios de cada uno.
