# Exportación web completa — La cochera de Nidodo

Esta exportación utiliza main 9dd900d (incluye PR #24) y toda la campaña de siete noches. No está compilada con NIDODO_WEB_DEMO y no termina al completar la primera noche. Incluye investigaciones, reservas VIP, mejoras, capítulos y herramientas de prueba que también están en la versión de escritorio.

Abrir mediante un servidor HTTP/HTTPS; no abrir index.html con doble clic/file://. Para publicarla, subir index.html, Build/ y TemplateData/ juntos. Los archivos .unityweb están comprimidos con Gzip y el cargador incorpora descompresión de respaldo, por lo que no requieren cabeceras especiales Content-Encoding.

Usar un navegador de escritorio con WebGL 2 y teclado/mouse. Hacer clic dentro del juego para capturar el cursor y habilitar audio. El guardado reside en IndexedDB del navegador: conservar la misma dirección y ruta para continuar la partida; no se comparte automáticamente con Windows ni con otro navegador. El modo privado o borrar datos del sitio puede eliminarlo.

La comprobación técnica y las limitaciones de las pruebas se entregan por separado en VERIFICACION-WEB.md. Incluir siete noches no equivale a haber recorrido manualmente las siete de principio a fin.
