# Lecciones aprendidas

Retrospectiva técnica basada en el historial disponible y el código actual. No sustituye la reflexión personal de cada integrante.

| Situación | Aprendizaje | Acción futura |
| --- | --- | --- |
| Cambios simultáneos en login y dependencias. | Revisar la versión del compañero y acordar responsabilidades evita duplicar trabajo. | Integrar mediante ramas y PR revisados; no sobrescribir main con una copia anterior. |
| Google y cuentas locales comparten modelo. | Método de autenticación y rol son conceptos distintos; Google ID debe ser opcional para cuentas locales. | Mantener pruebas de coexistencia y no vincular por email sin un flujo explícito. |
| Errores de integración y esperas externas. | Recibir una respuesta HTTP no significa éxito; la UI debe mostrar carga, fallo y reintento. | Conservar timeout y traducción de errores sin exponer credenciales. |
| Fallos al instalar dependencias en Drive. | El código compartido no reemplaza una instalación reproducible local. | Trabajar fuera de Drive, usar npm ci y mantener package-lock. |
| Juego dentro de iframe presentó problemas. | Carga visual, interacción y campaña completa son verificaciones diferentes. | Abrir en otra pestaña y registrar pruebas reales de controles, audio y guardado. |
| API y README evolucionaron a ritmos distintos. | Una propuesta de donaciones no equivale a una integración activa; los diagramas deben corresponder al código. | Revisar documentación en cada PR funcional. |
| Sesiones y usuarios tienen almacenamiento distinto. | Un reinicio elimina sesiones en memoria, no cuentas persistidas. | Explicar la limitación y preparar almacenamiento adecuado antes de producción. |
| Formato y permisos no están uniformados en todas las rutas. | Las mejoras parciales requieren describir su alcance real. | Unificar errores y agregar pruebas de rutas nuevas, sin afirmar cobertura completa. |

## Si empezáramos de nuevo

Definiríamos antes el alcance mínimo y el contrato de la API; revisaríamos nombres exactos de archivos para Linux y ensayaríamos el despliegue temprano. Mantendríamos cambios pequeños, pruebas de reglas críticas y documentación junto con cada funcionalidad. Pagos y protección de archivos se abordarían como un recorrido completo y verificable, separado del login.

## Revisión del equipo

Antes de entregar, Leandro y Alexis deben agregar o confirmar qué decisiones y dificultades consideran propias y qué cambiarían. No se inventan estimaciones de velocidad, métricas de Scrum ni opiniones personales no registradas.
