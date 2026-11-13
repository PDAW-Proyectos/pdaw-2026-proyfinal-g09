import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import session from 'express-session';
import { randomBytes } from 'node:crypto';
import 'dotenv/config';
import crearRouterRegistro from "./routes/Registro.routes.js";
import { RepositorioUsuarios } from "./src/services/RepositorioUsuarios.js";
import crearRouterLogin from './routes/Login.routes.js';
import crearRouterLogout from './routes/Logout.routes.js';
import crearRouterPerfil from './routes/Perfil.routes.js';

import crearRouterGoogle from './routes/Google.routes.js';

const app = express();
const directory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === 'production';
if (production && !process.env.SESSION_SECRET) {
  throw new Error('Falta configurar SESSION_SECRET para producción');
}
const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

const repositorioUsuarios = new RepositorioUsuarios(
    path.join(directory, "data", "usuarios.json")
);

await repositorioUsuarios.cargar();
app.disable('x-powered-by');
app.use(express.json());
app.use(session({
    name: 'clase08.sid',
    secret: sessionSecret, // firma la cookie
    resave: false,
    saveUninitialized: false, // sin sesiones para anónimos
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: production, // HTTPS en producción
        maxAge: 60 * 60 * 1000, // 1 hora
    },
}));
// En producción, detrás del proxy HTTPS de la plataforma:
app.set('trust proxy', 1);

app.use(express.static(path.join(directory, 'public')));
app.use('/demo', express.static(path.join(directory, 'La-cochera-exportacion-web'), {
  setHeaders(response, filePath) {
    if (filePath.endsWith('.wasm')) response.type('application/wasm');
    if (filePath.endsWith('.data')) response.type('application/octet-stream');
  }
}));

app.use("/api/registro", crearRouterRegistro(repositorioUsuarios));
app.use("/api/login", crearRouterLogin(repositorioUsuarios));
app.use("/api/logout", crearRouterLogout());
app.use("/api/perfil", crearRouterLogin(repositorioUsuarios))


app.use('/api/login/google', crearRouterGoogle(repositorioUsuarios, {
  clientId: process.env.GOOGLE_CLIENT_ID || '538180077146-j3ttn8c6lfsvla99u1e9jclsoakj80ce.apps.googleusercontent.com',
  appUrl: process.env.APP_URL || 'http://localhost:' + port
}));

app.listen(port, '127.0.0.1', () => {
  console.log(`La cochera de Nidodo: http://localhost:${port}`);
}).on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Cerrá el servidor anterior o elegí otro PORT.`
    : error.message);
  process.exitCode = 1;
});
