# Verificación de la documentación

Revisión del 24 de noviembre de 2026 sobre el código de main `052a410`, con cambios de documentación en una rama independiente.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Jest / Supertest: `npm test` | 5 suites y 58 pruebas aprobadas. |
| `npm run lint` | Sin errores; seis advertencias de complejidad existentes. |
| `npm run format:check` | Aprobado para el conjunto de archivos configurado. |
| Diagramas | Se generaron y revisaron imágenes PNG con fuentes SVG y DOT. |
| Guía de uso | Captura real de Inicio desde el servidor local, sin datos de cuentas. |
| Contrato | Contrastado con las rutas, sus permisos y representaciones. |
| Enlaces internos | Comprobación de destinos locales de los Markdown nuevos y el README. |

Las pruebas automáticas no verifican todo el sistema: Google se simula y faltan suites específicas para noticias, endpoints administrativos y cambio de contraseña. No se ejecutó una auditoría nueva de Lighthouse ni una campaña completa del juego. No se declara un despliegue público comprobado.

## Problemas conocidos observados

- En `server.js`, los imports de Admin y Noticias no coinciden en mayúsculas con los nombres versionados. Además, el login local redirige a `/admin.html` y el archivo es `Admin.html`. Esto puede fallar en Linux.
- El servidor escucha en `127.0.0.1`; hay que adaptar la exposición para el hosting elegido.
- `/demo` no aplica la condición de contribuyente; los pagos no están activos.
- Las sesiones están en memoria y los datos en JSON local.
- Coexisten respuestas problem+json y respuestas con campo error.
- Diagramas y verificación anteriores se conservan como antecedentes, sin tratarlos como validación actual.

## Revisión pendiente del equipo

Confirmar las herramientas y usos de IA de cada integrante, revisar decisiones y retrospectiva, y ensayar la defensa y modificación individual sin asistencia. Esta rama no publica credenciales de prueba, usuarios locales ni datos de noticias usados durante la práctica.
