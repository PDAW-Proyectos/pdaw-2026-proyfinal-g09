const contenedorGoogle = document.querySelector('#boton-google');
const estadoGoogle = document.querySelector('#estado-google');
const reintentarGoogle = document.querySelector('#reintentar-google');
let verificandoGoogle = false;

function cargarBibliotecaGoogle() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const espera = setTimeout(() => {
      script.onload = null;
      script.remove();
      reject(new Error('Google está tardando en cargar. Revisá la conexión y volvé a intentar'));
    }, 12000);
    script.onload = () => { clearTimeout(espera); resolve(); };
    script.onerror = () => {
      clearTimeout(espera);
      reject(new Error('No se pudo cargar Google. Revisá la conexión o los bloqueadores del navegador'));
    };
    document.head.append(script);
  });
}

function mostrarErrorGoogle(mensaje) {
  contenedorGoogle.classList.remove('d-flex');
  contenedorGoogle.hidden = true;
  estadoGoogle.textContent = mensaje;
  reintentarGoogle.hidden = false;
}

async function recibirCredencialGoogle(respuestaGoogle) {
  if (verificandoGoogle) return;
  verificandoGoogle = true;
  contenedorGoogle.classList.remove('d-flex');
  contenedorGoogle.hidden = true;
  estadoGoogle.textContent = 'Verificando tu cuenta con el servidor…';
  try {
    const respuesta = await fetch('/api/login/google', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: respuestaGoogle.credential }),
      signal: AbortSignal.timeout(20000)
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || 'No se pudo iniciar sesión con Google');
    estadoGoogle.textContent = 'Sesión iniciada. Volviendo al inicio…';
    location.assign('/');
  } catch (error) {
    mostrarErrorGoogle(error.name === 'TimeoutError' || error instanceof TypeError
      ? 'No se pudo confirmar la sesión. Volvé a cargar la página para comprobarla e intentar de nuevo'
      : error.message);
  }
}

async function prepararGoogle() {
  try {
    await cargarBibliotecaGoogle();
    const respuesta = await fetch('/api/login/google/config', {
      credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000)
    });
    const config = await respuesta.json();
    if (!respuesta.ok) throw new Error(config.mensaje || 'No se pudo preparar el ingreso con Google');
    google.accounts.id.initialize({
      client_id: config.clientId, nonce: config.nonce,
      callback: recibirCredencialGoogle, auto_select: false
    });
    google.accounts.id.renderButton(contenedorGoogle, {
      type: 'standard', theme: 'filled_black', shape: 'rectangular', size: 'large', text: 'continue_with',
      locale: 'es', width: Math.min(400, Math.max(200, contenedorGoogle.clientWidth))
    });
    estadoGoogle.textContent = 'Elegí tu cuenta de Google para continuar.';
  } catch (error) {
    mostrarErrorGoogle(error.name === 'TimeoutError' || error instanceof TypeError
      ? 'No se pudo preparar Google. Revisá la conexión y volvé a cargar la página'
      : error.message);
  }
}

reintentarGoogle.addEventListener('click', () => location.reload());
prepararGoogle();
