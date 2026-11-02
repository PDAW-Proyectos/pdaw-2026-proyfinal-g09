import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import session from 'express-session';
import crearRouterRegistro from "./routes/Registro.routes.js";
import { RepositorioUsuarios } from "./src/services/RepositorioUsuarios.js";
import crearRouterLogin from './routes/Login.routes.js';

const app = express();
const directory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

const repositorioUsuarios = new RepositorioUsuarios(
    path.join(directory, "data", "usuarios.json")
);

await repositorioUsuarios.cargar();
app.disable('x-powered-by');
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));
app.use(express.static(path.join(directory, 'public')));
app.use('/demo', express.static(path.join(directory, 'La-cochera-exportacion-web'), {
  setHeaders(response, filePath) {
    if (filePath.endsWith('.wasm')) response.type('application/wasm');
    if (filePath.endsWith('.data')) response.type('application/octet-stream');
  }
}));

app.use("/api/registro", crearRouterRegistro(repositorioUsuarios));
app.use("/api/login", crearRouterLogin(repositorioUsuarios));

app.listen(port, '127.0.0.1', () => {
  console.log(`La cochera de Nidodo: http://localhost:${port}`);
}).on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Cerrá el servidor anterior o elegí otro PORT.`
    : error.message);
  process.exitCode = 1;
});
