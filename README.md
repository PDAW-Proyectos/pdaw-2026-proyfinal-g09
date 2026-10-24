# La cochera de Nidodo en el navegador

## Almacenamiento de usuarios

`src/services/RepositorioUsuarios.js` guarda usuarios y administradores en `data/usuarios.json`, fuera de la carpeta pública y excluido de Git. El archivo se crea al llamar a cargar() si todavía no existe. No contiene usuarios de ejemplo ni contraseñas. Un archivo inválido provoca un error para evitar sobrescribir los datos existentes.

Como en el proyecto anterior, el servidor crea un repositorio con la ruta del archivo y llama a cargar() una sola vez al iniciar:

```js
import { RepositorioUsuarios } from './src/services/RepositorioUsuarios.js';
import { Usuario } from './src/Usuario.js';
import path from 'node:path';

// directory es la carpeta del servidor, ya calculada en server.js.
const repositorioUsuarios = new RepositorioUsuarios(path.join(directory, 'data', 'usuarios.json'));
await repositorioUsuarios.cargar();

const usuario = new Usuario({ nombre: 'Ana', apellido: 'Ejemplo', email: 'ana@example.com' });
await repositorioUsuarios.agregarUsuario(usuario);
const guardado = repositorioUsuarios.buscarPorEmail('ana@example.com');
guardado.habilitarContribuyente();
await repositorioUsuarios.actualizarUsuario(guardado);
```

También ofrece `listar()` y `buscarPorId(id)`. Las búsquedas sin resultados devuelven `null`. Rechaza ids y emails duplicados; `actualizarUsuario` requiere un usuario existente. Recupera las instancias de Administrador con sus métodos. Mantiene un arreglo de usuarios en memoria. guardar() escribe ese arreglo en el archivo; agregarUsuario() y actualizarUsuario() llaman a guardar() automáticamente.

Este ejemplo todavía no está conectado a server.js. Usar una sola instancia y un solo proceso del servidor con este archivo JSON. Para varios procesos o servidores será necesario migrar a una base de datos. El registro, los hashes de contraseñas, las sesiones y los controles de autorización todavía deben integrarse; este repositorio no expone rutas HTTP ni decide quién puede administrar usuarios. El bloqueo independiente del estado de contribuyente también queda pendiente.


Requiere Node.js. Desde esta carpeta, instalar dependencias una vez con `npm install` y ejecutar `npm start`.

Abrir http://localhost:3000. Para detener el servidor, presionar Ctrl+C en su terminal.

Express sirve Inicio desde `public/` en `/` y la exportación de Unity desde `La-cochera-exportacion-web` en `/demo/`. El juego descarga aproximadamente 106 MB sólo al abrir la demo. El servidor sólo escucha en esta computadora.

Inicio sigue el wireframe del proyecto y se adapta a móvil y escritorio. Los botones de login y aportes muestran un aviso temporal; todavía no incluyen autenticación ni pagos. El enlace de prueba abre la demo públicamente: el bloqueo visual de Inicio no constituye control de acceso.

Los estilos compartidos están en `public/css/comun.css` y los exclusivos de Inicio en `public/css/inicio.css`. `public/img/demo-nidodo.png` es una captura de la exportación actual; `vehiculo-nidodo.png` proviene de Capturas/auto-pack-0.12.png del repositorio del juego. El icono fue aportado por el equipo.

## Cabecera y pie compartidos (#26)

Para usar la navegación en login o foro, incluir en el head:

```html
<link rel="stylesheet" href="/css/comun.css">
<script src="/js/componentes.js" defer></script>
```

Dentro del body, colocar `<cabecera-sitio></cabecera-sitio>` antes de `<main id="contenido">` y `<pie-sitio></pie-sitio>` después. Usar una sola instancia de cada componente por página. La cabecera incluye el salto al contenido y el pie incluye el diálogo temporal de ingreso. Los enlaces a Inicio funcionan también desde otras páginas. Se requiere JavaScript habilitado.
