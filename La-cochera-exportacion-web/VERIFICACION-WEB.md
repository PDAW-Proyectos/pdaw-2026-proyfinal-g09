# Verificación de exportación web completa

Fecha: 11 de noviembre de 2026. Base: main 9dd900d, PR #24.

## Compilación y contenido
- Unity 6000.6.5f1, WebGL, BuildOptions.None: Succeeded, 0 errores, 11 avisos.
- BuildReport: 26.094.922 bytes antes de documentación/ajuste del HTML.
- Scripts compilados para UNITY_WEBGL sin NIDODO_WEB_DEMO ni DEVELOPMENT_BUILD.
- Misma escena, recursos y lógica de las siete noches; se conservan investigaciones, reservas VIP, reputación, tienda y capítulos. Sin condición de fin tras la primera noche.
- Gzip con descompresión de respaldo, sin depender de cabeceras Content-Encoding del hosting.

## Pruebas efectuadas en Chrome / WebGL 2
- Carga del paquete real por HTTP: menú principal completo, no aparece “Demo noche 1”.
- Selector recorrido hasta noche 7; inicio real del noticiero, diario y turno 7. Evidencia 03-noche7.png y 06-turno7.png.
- Inicio normal de campaña en noche 1, diario, entrada al escenario, entrada por teclado y cámara, linterna y captura del mouse tras hacer clic en canvas.
- Escritura real de progreso y ajustes; segundo guardado crea respaldo. Archivos consultados en IndexedDB, no sólo en memoria.
- Recarga completa del navegador: partida preservada (misma semilla de clientes al volver a guardar tras inicialización).
- La primera pasada detectó promesas duplicadas de pointer lock; la integración web ahora reutiliza la petición pendiente y omite pedir un bloqueo ya activo. Repetición sin errores JavaScript ni errores de consola en el recorrido final.

## Límites de esta evidencia
- No se completó la campaña de siete noches de principio a fin. Iniciar la noche 7 mediante el selector de pruebas verifica acceso a contenido posterior, no valida toda la progresión normal ni todos los eventos.
- No se midió compatibilidad móvil, Safari o Firefox ni se validó perceptualmente toda la mezcla de audio.
- En la primera carga se observaron avisos WebGL de discrepancia entre textura/sampler y GL_INVALID_OPERATION en un muestreo; el escenario y la interfaz se dibujan. No se afirma ausencia total de advertencias gráficas ni equivalencia visual exacta con Windows.
- El servidor de revisión sólo escucha en 127.0.0.1:8765. El ZIP no es una publicación pública: debe subirse a un hosting HTTP/HTTPS.

La prueba usa un perfil de navegador aislado, sin tocar la partida de Windows. La instrumentación para consultar IndexedDB y llamar Save se aplicó sólo al navegador de prueba; no se incorpora al ZIP.
