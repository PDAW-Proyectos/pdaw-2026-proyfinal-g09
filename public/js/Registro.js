const formRegistro = document.getElementById('formRegistro');
const inputUsername = document.getElementById('username');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const inputConfirmPassword = document.getElementById('confirmPassword');
const errorUsername = document.getElementById('errorUsername');
const errorEmail = document.getElementById('errorEmail');
const errorPassword = document.getElementById('errorPassword');
const errorConfirmPassword = document.getElementById('errorConfirmPassword');
const btnRegistro = document.getElementById('BtnRegistro');

formRegistro.addEventListener('submit', function (event) {
    event.preventDefault();

    if (validarForm()) {
        crearUsuario()
            .then(() => {
                formRegistro.reset();
            })
            .catch((error) => {
                alert('Error al crear el usuario: ' + error.message);
            });
        }
});

function validarUsername() {
    const username = inputUsername.value.trim();
    if (username.length < 3 || username.length > 20) {
        errorUsername.textContent = 'El nombre de usuario debe tener entre 3 y 20 caracteres.';
        return false;
    } else {
        errorUsername.textContent = '';
        return true;
    }
}

function validarEmail() {
    const email = inputEmail.value.trim();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoEmail.test(email)) {
        errorEmail.textContent = 'Por favor, ingrese un correo electrónico válido.';
        return false;
    } else {
        errorEmail.textContent = '';
        return true;
    }
}

function validarPassword() {
    const password = inputPassword.value;
    if (password.length < 8 || password.length > 20) {
        errorPassword.textContent = 'La contraseña debe tener entre 8 y 20 caracteres.';
        return false;
    } else {
        errorPassword.textContent = '';
        return true;
    }
}

function validarConfirmPassword() {
    const password = inputPassword.value;
    if (password !== inputConfirmPassword.value.trim()) {
        errorConfirmPassword.textContent = 'Las contraseñas no coinciden.';
        return false;
    } else {
        errorConfirmPassword.textContent = '';
        return true;
    }
}

function validarForm() {
    const usernameValido = validarUsername();
    const passwordValida = validarPassword();
    const confirmPasswordValido = validarConfirmPassword();
    const emailValido = validarEmail();
     
    return usernameValido && emailValido && passwordValida && confirmPasswordValido;
}

async function crearUsuario() {
    const datosUsuario = {
        username: inputUsername.value.trim(),
        email: inputEmail.value.trim(),
        password: inputPassword.value
    };
    const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosUsuario)
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo crear el usuario");
    }
    window.location.href = "/login.html";
    return await respuesta.json();
}

