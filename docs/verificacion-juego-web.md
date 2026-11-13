# Actualización del juego web

Se reemplaza la exportación anterior por la versión completa de main 9dd900d, entregada el 11/11/2026. Incluye siete noches; no significa que se hayan probado de principio a fin.

La página principal abre /demo/ en otra pestaña. Se retiró el iframe experimental. El juego conserva el diseño sin márgenes y añade un botón para entrar y salir de pantalla completa. Mantiene el ajuste de captura del mouse y la sincronización del guardado de la exportación.

Verificación local:
- HTML y los cuatro archivos Build responden HTTP 200 desde Express.
- Carga hasta el menú principal.
- Botón de pantalla completa: entrada y salida comprobadas en navegador.
- Las 27 pruebas existentes pasaron durante la integración; no validan gameplay.
- En la prueba previa con iframe se llegó al escenario y respondió Escape. Al probar movimiento hubo una alerta UnknownError de Chromium. Causa no determinada; no se afirma que abrir otra pestaña resuelva el error interno del navegador.

Pendiente: repetir manualmente movimiento, mouse, sonido, guardado y progresión en Chrome. No se recorrieron las siete noches. Los informes originales de la exportación están junto al juego y corresponden a su PC de origen.
