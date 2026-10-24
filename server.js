import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const directory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.static(path.join(directory, 'public')));
app.use('/demo', express.static(path.join(directory, 'La-cochera-exportacion-web'), {
  setHeaders(response, filePath) {
    if (filePath.endsWith('.wasm')) response.type('application/wasm');
    if (filePath.endsWith('.data')) response.type('application/octet-stream');
  }
}));

app.listen(port, '127.0.0.1', () => {
  console.log(`La cochera de Nidodo: http://localhost:${port}`);
}).on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Cerrá el servidor anterior o elegí otro PORT.`
    : error.message);
  process.exitCode = 1;
});
