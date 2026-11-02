class CabeceraSitio extends HTMLElement {
    connectedCallback() {

        const salto = document.createElement('a');
        salto.className = 'salto';
        salto.href = '#contenido';
        salto.textContent = 'Saltar al contenido';

        const header = document.createElement('header');
        header.className = 'cabecera';

        const marca = document.createElement('a');
        marca.className = 'marca';
        marca.href = '/';
        marca.setAttribute('aria-label', 'La cochera de Nidodo, inicio');

        const imagen = document.createElement('img');
        imagen.src = './img/icono-nidodo.jpeg';
        imagen.alt = '';
        imagen.width = 44;
        imagen.height = 44;

        const nombre = document.createElement('span');
        nombre.append('LA COCHERA', document.createElement('br'), 'DE NIDODO');

        marca.append(imagen, nombre);

        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Navegación principal');

        const enlaces = [
            { texto: 'El juego', href: '/#juego' },
            { texto: 'Imágenes', href: '/#imagenes' },
            { texto: 'Demo', href: '/#demo' },
            { texto: 'Foro', href: '/foro.html' }
        ];

        enlaces.forEach(({ texto, href }) => {
            const enlace = document.createElement('a');
            enlace.href = href;
            enlace.textContent = texto;
            nav.appendChild(enlace);
        });

        const accionesUsuario = document.createElement('div');
        accionesUsuario.id = 'accionesUsuario';

        header.append(marca, nav, accionesUsuario);
        this.append(salto, header);

        actualizarEstadoUsuario();
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.desplegable-contenido.mostrar')
        .forEach(menu => menu.classList.remove('mostrar'));
});

async function actualizarEstadoUsuario() {
    const contenedor = document.getElementById('accionesUsuario');

    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/login', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!respuesta.ok) {
            throw new Error('No se pudo consultar la sesión');
        }

        const datos = await respuesta.json();

        contenedor.replaceChildren();

        if (datos.usuario) {
            const menuPerfil = document.createElement('div');
            menuPerfil.className = 'perfil-dropdown';

            const fotoPerfil = document.createElement('img');

            fotoPerfil.src = datos.usuario.avatarUrl || './img/avatar-defecto.png';
            fotoPerfil.alt = `Perfil de ${datos.usuario.username}`;
            fotoPerfil.className = 'avatar-btn';
            fotoPerfil.width = 40;
            fotoPerfil.height = 40;

            const desplegable = document.createElement('div');
            desplegable.className = 'desplegable-contenido';

            const opcionPerfil = document.createElement('a');
            opcionPerfil.href = '/perfil.html';
            opcionPerfil.textContent = 'Mi perfil';

            const cerrarSesion = document.createElement('button');
            cerrarSesion.type = 'button';
            cerrarSesion.className = 'btn-logout';
            cerrarSesion.textContent = 'Cerrar sesión';
            cerrarSesion.addEventListener('click', cerrarSesionUsuario);

            desplegable.append(opcionPerfil, cerrarSesion);
            menuPerfil.append(fotoPerfil, desplegable);

            fotoPerfil.addEventListener('click', (e) => {
                e.stopPropagation();
                desplegable.classList.toggle('mostrar');
            });

            desplegable.addEventListener('click', (e) => {
              e.stopPropagation();
            });
            contenedor.append(menuPerfil);
        } else {
            const login = document.createElement('a');
            login.className = 'boton secundario';
            login.href = '/login.html';
            login.textContent = 'Iniciar sesión';

            const registro = document.createElement('a');
            registro.className = 'boton secundario';
            registro.href = '/registro.html';
            registro.textContent = 'Registrarse';

            contenedor.append(login, registro);
        }
    } catch (error) {
        console.error('Error al consultar la sesión:', error);
    }
}

async function cerrarSesionUsuario() {
    try {
        const respuesta = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.mensaje);
        }
        await actualizarEstadoUsuario();
        window.location.href = '/';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

class PieSitio extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer class="contenedor pie"><span>LA COCHERA DE NIDODO</span><span>Un proyecto independiente.</span><a href="/#juego">Volver arriba ↑</a></footer>
<dialog id="aviso" aria-labelledby="aviso-titulo" aria-describedby="aviso-texto">
    <p class="etiqueta">LA COCHERA DE NIDODO</p><h2 id="aviso-titulo">Próximamente</h2>
    <p id="aviso-texto"></p><form method="dialog"><button class="boton secundario">Volver</button></form>
  </dialog>`;
  }
}

customElements.define('cabecera-sitio', CabeceraSitio);
customElements.define('pie-sitio', PieSitio);