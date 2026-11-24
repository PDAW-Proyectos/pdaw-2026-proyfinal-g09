# ADR 002: repositorios con persistencia en JSON

Estado: implementada; justificación documentada retrospectivamente el 24/11/2026.

## Contexto

El proyecto académico necesita recuperar cuentas y noticias al reiniciar, separar archivos privados de los recursos públicos y trabajar con clases de dominio comprensibles por el equipo.

## Decisión

Centralizar el acceso en RepositorioUsuarios y RepositorioNoticias. Cargan archivos JSON en colecciones en memoria, reconstruyen entidades y guardan los cambios en disco. Usuarios se guardan con paraPersistir(); las respuestas usan toJSON() para omitir credenciales. JSON es el formato de almacenamiento y el repositorio es el código que lo utiliza: no son alternativas excluyentes.

## Alternativas y criterio

Un arreglo sin archivo perdería todo al cerrar el proceso. Una base de datos aportaría consultas y mejores herramientas de concurrencia, pero requiere configuración y operaciones adicionales. Esta comparación explica la decisión actual; no documenta un experimento con una base de datos que no se realizó.

## Consecuencias

Instalación sencilla y datos inspeccionables. Las cuentas y noticias sobreviven si se conservan los archivos; las sesiones no. Hay limitaciones ante escrituras concurrentes, fallos de disco y despliegues con disco efímero. Los repositorios actuales no proporcionan transacciones ni rollback uniforme. Para crecer habría que revisar la persistencia y conservar el contrato que usan las rutas.

## Evidencia

`src/services/RepositorioUsuarios.js`, `RepositorioNoticias.js`, `src/Usuario.js` y `tests/repositorioUsuarios.test.js`. Las pruebas usan carpetas temporales y comprueban la recuperación de usuarios después de reconstruir el repositorio. `data` no se expone con express.static; esa separación, y no el nombre JSON, protege su entrega HTTP.
