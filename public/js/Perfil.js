const botonesSecciones = document.querySelectorAll('.perfil-opcion');
const seccionesPerfil = document.querySelectorAll('.perfil-seccion');

botonesSecciones.forEach(boton => {
    boton.addEventListener('click', () => {
        const seccionSeleccionada = boton.dataset.seccion;

        seccionesPerfil.forEach(seccion => {
            seccion.hidden = true;
        });

        const seccion = document.getElementById(
            `seccion-${seccionSeleccionada}`
        );

        if (seccion) {
            seccion.hidden = false;
        }

        botonesSecciones.forEach(opcion => {
            opcion.classList.remove('activa');
            opcion.removeAttribute('aria-current');
        });

        boton.classList.add('activa');
        boton.setAttribute('aria-current', 'page');
    });
});


async function cargarPerfil() {
    const mensaje = document.getElementById('perfil-mensaje');
    try {
        const respuesta = await fetch('/api/perfil', {
            method: 'GET',
            credentials: 'same-origin'
        });
        if (respuesta.status === 401) {
            window.location.replace('/login.html');
            return;
        }
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No se pudo cargar el perfil');
        }
        const usuario = datos.usuario;
        if (!usuario) {
            throw new Error('No se encontraron los datos del usuario');
        }
        document.getElementById('perfil-username').textContent =
            usuario.username;
        document.getElementById('perfil-username-menu').textContent =
            usuario.username;
        document.getElementById('perfil-email').textContent =
            usuario.email;
    } catch (error) {
        console.error('Error al cargar el perfil:', error);

        mensaje.textContent = error.message;
    }
}


cargarPerfil();
