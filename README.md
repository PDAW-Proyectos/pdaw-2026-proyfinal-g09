# La cochera de Nidodo en el navegador

Requiere Node.js. Desde esta carpeta, instalar dependencias una vez con `npm install` y ejecutar `npm start`.

Abrir http://localhost:3000. Para detener el servidor, presionar Ctrl+C en su terminal.

Express sirve Inicio desde `public/` en `/` y la exportación de Unity desde `La-cochera-exportacion-web` en `/demo/`. El juego descarga aproximadamente 106 MB sólo al abrir la demo. El servidor sólo escucha en esta computadora.

Inicio sigue el wireframe del proyecto y se adapta a móvil y escritorio. Los botones de login y aportes muestran un aviso temporal; todavía no incluyen autenticación ni pagos. El enlace de prueba abre la demo públicamente: el bloqueo visual de Inicio no constituye control de acceso.

Los estilos de Inicio están aislados en `public/css/inicio.css` para permitir trabajar en login por separado. `public/img/demo-nidodo.png` es una captura de la exportación actual; `vehiculo-nidodo.png` proviene de Capturas/auto-pack-0.12.png del repositorio del juego. El icono fue aportado por el equipo.
