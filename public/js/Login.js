
const formLogin = document.getElementById('formLogin');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const errorEmail = document.getElementById('errorEmail');
const errorPassword = document.getElementById('errorPassword');
const btnLogin = document.getElementById('BtnLogin');
const errorLogin = document.getElementById('errorLogin');

formLogin.addEventListener('submit', function (event) {
    event.preventDefault();

    errorLogin.textContent = '';

    if (validarForm()) {
        iniciarSesion()
            .then(() => {
                formLogin.reset();
                window.location.href = "/";
            })
            .catch((error) => {
                errorLogin.textContent = error.message;
                errorLogin.focus();
            });
    } else {
        formLogin.querySelector('[aria-invalid="true"]')?.focus();
    }
});

function validarEmail() {
    const email = inputEmail.value.trim();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        errorEmail.textContent = 'Por favor, ingrese un correo electrónico válido.';
        inputEmail.setAttribute('aria-invalid', 'true');
        return false;
    } else {
        errorEmail.textContent = '';
        inputEmail.setAttribute('aria-invalid', 'false');
        return true;
    }
}

function validarPassword() {
    const password = inputPassword.value;

    if (password.length < 8 || password.length > 20) {
        errorPassword.textContent = 'La contraseña invalida.';
        inputPassword.setAttribute('aria-invalid', 'true');
        return false;
    } else {
        errorPassword.textContent = '';
        inputPassword.setAttribute('aria-invalid', 'false');
        return true;
    }
}

function validarForm() {
    const emailValido = validarEmail();
    const passwordValida = validarPassword();

    return emailValido && passwordValida;
}

async function iniciarSesion() {
    btnLogin.disabled = true;

    try {
        const datosUsuario = {
            email: inputEmail.value.trim(),
            password: inputPassword.value
        };

        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(datosUsuario)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No se pudo iniciar sesión');
        }

        return datos;

    } finally {
        btnLogin.disabled = false;
    }
}
