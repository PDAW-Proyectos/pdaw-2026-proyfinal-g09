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
        const estadoCuenta = document.createElement('p');
        estadoCuenta.id = 'estado-cuenta';
        estadoCuenta.setAttribute('role', 'status');
        estadoCuenta.setAttribute('aria-live', 'polite');

        header.append(marca, nav, accionesUsuario);
        this.append(salto, header);

        actualizarEstadoUsuario();
    }
}

function cerrarMenusPerfil() {
    document.querySelectorAll('.perfil-dropdown').forEach(contenedor => {
        contenedor.querySelector('.desplegable-contenido')?.classList.remove('mostrar');
        contenedor.querySelector('.perfil-toggle')?.setAttribute('aria-expanded', 'false');
    });
}
document.addEventListener('click', cerrarMenusPerfil);

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
            fotoPerfil.referrerPolicy = 'no-referrer';
            fotoPerfil.addEventListener('error', () => { fotoPerfil.src = '/img/avatar-defecto.png'; }, { once: true });
            fotoPerfil.alt = '';
            fotoPerfil.className = 'avatar-btn';
            fotoPerfil.width = 40;
            fotoPerfil.height = 40;

            const botonPerfil = document.createElement('button');
            botonPerfil.type = 'button';
            botonPerfil.className = 'perfil-toggle';
            botonPerfil.setAttribute('aria-label', 'Opciones de la cuenta de ' + datos.usuario.username);
            botonPerfil.setAttribute('aria-expanded', 'false');
            botonPerfil.setAttribute('aria-controls', 'opciones-cuenta');
            botonPerfil.append(fotoPerfil);

            const desplegable = document.createElement('div');
            desplegable.id = 'opciones-cuenta';
            desplegable.className = 'desplegable-contenido';

            const opcionPerfil = document.createElement('a');
            opcionPerfil.href = '/Perfil.html';
            opcionPerfil.textContent = 'Mi perfil';

            const cerrarSesion = document.createElement('button');
            cerrarSesion.type = 'button';
            cerrarSesion.className = 'btn-logout';
            cerrarSesion.textContent = 'Cerrar sesión';
            cerrarSesion.addEventListener('click', cerrarSesionUsuario);

            desplegable.append(opcionPerfil, cerrarSesion);
            menuPerfil.append(botonPerfil, desplegable);

            botonPerfil.addEventListener('click', (e) => {
                e.stopPropagation();
                const abierto = desplegable.classList.toggle('mostrar');
                botonPerfil.setAttribute('aria-expanded', String(abierto));
            });

            desplegable.addEventListener('click', (e) => {
              e.stopPropagation();
            });
            menuPerfil.addEventListener('keydown', evento => {
                if (evento.key !== 'Escape') return;
                cerrarMenusPerfil();
                botonPerfil.focus();
            });
            menuPerfil.addEventListener('focusout', evento => {
                if (!menuPerfil.contains(evento.relatedTarget)) cerrarMenusPerfil();
            });
            contenedor.append(menuPerfil);
        } else {
            const login = document.createElement('a');
            login.className = 'boton secundario';
            login.href = '/Login.html';
            login.textContent = 'Iniciar sesión';

            const registro = document.createElement('a');
            registro.className = 'boton secundario';
            registro.href = '/Registro.html';
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
        const footer = document.createElement('footer');
        footer.classList.add('contenedor', 'pie');

        const nombre = document.createElement('span');
        nombre.textContent = 'LA COCHERA DE NIDODO';

        const descripcion = document.createElement('span');
        descripcion.textContent = 'Un proyecto independiente.';

        const volverArriba = document.createElement('a');
        volverArriba.href = '/#juego';
        volverArriba.textContent = 'Volver arriba ↑';

        footer.append(nombre, descripcion, volverArriba);

        const dialog = document.createElement('dialog');
        dialog.id = 'aviso';
        dialog.setAttribute('aria-labelledby', 'aviso-titulo');
        dialog.setAttribute('aria-describedby', 'aviso-texto');

        const etiqueta = document.createElement('p');
        etiqueta.classList.add('etiqueta');
        etiqueta.textContent = 'LA COCHERA DE NIDODO';

        const titulo = document.createElement('h2');
        titulo.id = 'aviso-titulo';
        titulo.textContent = 'Próximamente';

        const texto = document.createElement('p');
        texto.id = 'aviso-texto';

        const formulario = document.createElement('form');
        formulario.method = 'dialog';

        const boton = document.createElement('button');
        boton.classList.add('boton', 'secundario');
        boton.textContent = 'Volver';

        formulario.appendChild(boton);
        dialog.append(etiqueta, titulo, texto, formulario);

        this.append(footer, dialog);
    }
}

customElements.define('cabecera-sitio', CabeceraSitio);
customElements.define('pie-sitio', PieSitio);