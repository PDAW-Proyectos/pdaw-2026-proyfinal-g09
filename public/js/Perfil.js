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
            window.location.replace('/Login.html');
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.detail ||
                datos.mensaje ||
                'No se pudo cargar el perfil'
            );
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

        const avatar = document.querySelector('.perfil-avatar');

        if (avatar && usuario.avatarUrl) {
            const foto = document.createElement('img');

            foto.src = usuario.avatarUrl;
            foto.alt = 'Foto de perfil de ' + usuario.username;
            foto.referrerPolicy = 'no-referrer';

            foto.style.cssText =
                'width:100%;height:100%;object-fit:cover;border-radius:inherit';

            foto.addEventListener('error', () => {
                avatar.textContent = usuario.username[0].toUpperCase();
            }, { once: true });

            avatar.replaceChildren(foto);

        } else if (avatar) {
            avatar.textContent = usuario.username[0].toUpperCase();
        }

        mensaje.textContent = '';

    } catch (error) {
        console.error('Error al cargar el perfil:', error);

        mensaje.textContent = error.message;
    }
}

const formCambiarPassword = document.getElementById(
    'form-cambiar-password'
);

const mensajePassword = document.getElementById(
    'password-mensaje'
);

formCambiarPassword?.addEventListener('submit', async evento => {
    evento.preventDefault();

    const inputPasswordActual = document.getElementById(
        'password-actual'
    );

    const inputPasswordNueva = document.getElementById(
        'password-nueva'
    );

    const passwordActual = inputPasswordActual.value;
    const passwordNueva = inputPasswordNueva.value;

    mensajePassword.textContent = '';

    if (!passwordActual || !passwordNueva) {
        mensajePassword.textContent =
            'Debés completar ambos campos.';
        return;
    }

    if (passwordNueva.length < 8 || passwordNueva.length > 20) {
        mensajePassword.textContent =
            'La nueva contraseña debe tener entre 8 y 20 caracteres.';
        return;
    }

    if (passwordActual === passwordNueva) {
        mensajePassword.textContent =
            'La nueva contraseña debe ser diferente de la actual.';
        return;
    }

    const botonEnviar = formCambiarPassword.querySelector(
        'button[type="submit"]'
    );

    botonEnviar.disabled = true;

    try {
        const respuesta = await fetch('/api/perfil/password', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passwordActual,
                passwordNueva
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.error ||
                datos.mensaje ||
                'No se pudo cambiar la contraseña.'
            );
        }

        formCambiarPassword.reset();

        mensajePassword.textContent =
            datos.mensaje || 'La contraseña se cambió correctamente.';

    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);

        mensajePassword.textContent = error.message;

    } finally {
        botonEnviar.disabled = false;
    }
});

cargarPerfil();
