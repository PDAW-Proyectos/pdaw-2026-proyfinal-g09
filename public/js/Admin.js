const botonesSecciones = document.querySelectorAll('.perfil-opcion');
const secciones = document.querySelectorAll('.perfil-seccion');

const listaUsuarios = document.getElementById('lista-usuarios');
const listaNoticias = document.getElementById('lista-noticias');

const formNoticia = document.getElementById('form-noticia');
const inputTitulo = document.getElementById('noticia-titulo');
const inputContenido = document.getElementById('noticia-contenido');

const tituloFormNoticia = document.getElementById('titulo-form-noticia');
const descripcionFormNoticia = document.getElementById('descripcion-form-noticia');
const botonGuardarNoticia = document.getElementById('boton-guardar-noticia');
const botonCancelarEdicion = document.getElementById('cancelar-edicion');

const botonCerrarSesion = document.getElementById('admin-cerrar-sesion');
const nombreAdministrador = document.getElementById('admin-username-menu');

const resumenUsuarios = document.getElementById('resumen-usuarios');
const resumenNoticias = document.getElementById('resumen-noticias');

const toastElemento = document.getElementById('admin-toast');
const toastTitulo = document.getElementById('admin-toast-titulo');
const toastMensaje = document.getElementById('admin-toast-mensaje');

let noticiaEditando = null;

/* ------------------------------
   FUNCIONES GENERALES
------------------------------ */

// Realiza peticiones al servidor.
async function realizarPeticion(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        credentials: 'include',
        headers: {
            ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
            ...opciones.headers
        }
    });

    const tipoContenido = respuesta.headers.get('content-type') || '';

    let datos = {};

    if (tipoContenido.includes('application/json')) {
        datos = await respuesta.json();
    }

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            datos.error ||
            `Error en la petición (${respuesta.status}).`
        );
    }

    return datos;
}

// Muestra mensajes mediante Bootstrap Toast.
function mostrarMensaje(mensaje, tipo = 'error') {
    if (!toastElemento || !mensaje) return;

    toastTitulo.textContent =
        tipo === 'error' ? 'Error' :
        tipo === 'exito' ? 'Operación exitosa' :
        'Administración';

    toastMensaje.textContent = mensaje;

    toastElemento.classList.remove(
        'text-bg-danger',
        'text-bg-success',
        'text-bg-info'
    );

    if (tipo === 'error') {
        toastElemento.classList.add('text-bg-danger');
    } else if (tipo === 'exito') {
        toastElemento.classList.add('text-bg-success');
    } else {
        toastElemento.classList.add('text-bg-info');
    }

    const toast = bootstrap.Toast.getOrCreateInstance(toastElemento, {
        delay: 4000,
        autohide: true
    });

    toast.show();
}

// Crea un elemento de texto.
function crearTexto(texto, clases = '') {
    const elemento = document.createElement('p');

    elemento.textContent = texto ?? '';
    elemento.className = clases;

    return elemento;
}

// Crea un botón.
function crearBoton(texto, clases, accion) {
    const boton = document.createElement('button');

    boton.type = 'button';
    boton.textContent = texto;
    boton.className = clases;

    boton.addEventListener('click', accion);

    return boton;
}

// Obtiene una lista desde distintas estructuras de respuesta.
function obtenerLista(datos, propiedad) {
    if (Array.isArray(datos)) return datos;

    if (Array.isArray(datos[propiedad])) {
        return datos[propiedad];
    }

    if (Array.isArray(datos.datos)) {
        return datos.datos;
    }

    return [];
}

/* ------------------------------
   NAVEGACIÓN
------------------------------ */

function cambiarSeccion(nombre) {
    secciones.forEach(seccion => {
        seccion.hidden = seccion.id !== `seccion-${nombre}`;
    });

    botonesSecciones.forEach(boton => {
        const seleccionada = boton.dataset.seccion === nombre;

        boton.classList.toggle('activo', seleccionada);
    });

    if (nombre === 'usuarios') {
        cargarUsuarios();
    }

    if (nombre === 'gestionar-noticias') {
        cargarNoticias();
    }
}

botonesSecciones.forEach(boton => {
    boton.addEventListener('click', () => {
        cambiarSeccion(boton.dataset.seccion);
    });
});

// Acciones rápidas del resumen.
document.querySelectorAll('[data-ir-seccion]').forEach(boton => {
    boton.addEventListener('click', () => {
        cambiarSeccion(boton.dataset.irSeccion);
    });
});

/* ------------------------------
   VERIFICACIÓN DEL ADMINISTRADOR
------------------------------ */

async function verificarAdministrador() {
    try {
        const datos = await realizarPeticion('/api/perfil');

        const usuario = datos.usuario || datos;

        if (!usuario || usuario.rol !== 'admin') {
            window.location.href = '/';
            return false;
        }

        if (nombreAdministrador) {
            nombreAdministrador.textContent =
                usuario.username || usuario.nombre || 'Administrador';
        }

        return true;

    } catch (error) {
        window.location.href = '/Login.html';
        return false;
    }
}

/* ------------------------------
   CARGAR USUARIOS
------------------------------ */

async function cargarUsuarios() {
    if (!listaUsuarios) return;

    listaUsuarios.replaceChildren(
        crearTexto('Cargando usuarios...')
    );

    try {
        const datos = await realizarPeticion('/api/admin/usuarios');
        const usuarios = obtenerLista(datos, 'usuarios');

        listaUsuarios.replaceChildren();

        if (usuarios.length === 0) {
            listaUsuarios.appendChild(
                crearTexto('Todavía no hay usuarios registrados.')
            );
            return;
        }

        usuarios.forEach(usuario => {
            const contenedor = document.createElement('div');
            contenedor.className = 'card p-3 mb-3';

            const nombre = document.createElement('h3');
            nombre.className = 'h5';
            nombre.textContent = usuario.username || usuario.nombre || 'Sin nombre';

            const email = crearTexto(
                `Correo: ${usuario.email || 'No disponible'}`
            );

            const rol = crearTexto(
                `Rol: ${usuario.rol || 'Usuario'}`
            );

            contenedor.append(nombre, email, rol);
            listaUsuarios.appendChild(contenedor);
        });

    } catch (error) {
        listaUsuarios.replaceChildren(
            crearTexto('No se pudieron cargar los usuarios.')
        );

        mostrarMensaje(error.message);
    }
}

/* ------------------------------
   CARGAR NOTICIAS
------------------------------ */

async function cargarNoticias() {
    if (!listaNoticias) return;

    listaNoticias.replaceChildren(
        crearTexto('Cargando noticias...')
    );

    try {
        const datos = await realizarPeticion('/api/admin/noticias');
        const noticias = obtenerLista(datos, 'noticias');

        listaNoticias.replaceChildren();

        if (noticias.length === 0) {
            listaNoticias.appendChild(
                crearTexto('Todavía no hay noticias publicadas.')
            );
            return;
        }

        noticias.forEach(noticia => {
            const contenedor = document.createElement('article');
            contenedor.className = 'card p-3 mb-3';

            const titulo = document.createElement('h3');
            titulo.className = 'h5';
            titulo.textContent = noticia.titulo || 'Sin título';

            const contenido = crearTexto(
                noticia.contenido || 'Sin contenido.'
            );

            const botones = document.createElement('div');
            botones.className = 'd-flex gap-2 mt-2';

            const botonEditar = crearBoton(
                'Modificar',
                'btn btn-primary btn-sm',
                () => editarNoticia(noticia)
            );

            const botonEliminar = crearBoton(
                'Eliminar',
                'btn btn-danger btn-sm',
                () => eliminarNoticia(noticia)
            );

            botones.append(botonEditar, botonEliminar);
            contenedor.append(titulo, contenido, botones);

            listaNoticias.appendChild(contenedor);
        });

    } catch (error) {
        listaNoticias.replaceChildren(
            crearTexto('No se pudieron cargar las noticias.')
        );

        mostrarMensaje(error.message);
    }
}

/* ------------------------------
   RESUMEN
------------------------------ */

async function cargarResumen() {
    try {
        const [datosUsuarios, datosNoticias] = await Promise.all([
            realizarPeticion('/api/admin/usuarios'),
            realizarPeticion('/api/admin/noticias')
        ]);

        const usuarios = obtenerLista(datosUsuarios, 'usuarios');
        const noticias = obtenerLista(datosNoticias, 'noticias');

        if (resumenUsuarios) {
            resumenUsuarios.textContent = usuarios.length;
        }

        if (resumenNoticias) {
            resumenNoticias.textContent = noticias.length;
        }

    } catch (error) {
        mostrarMensaje('No se pudo actualizar el resumen.');
    }
}

/* ------------------------------
   PUBLICAR Y MODIFICAR NOTICIAS
------------------------------ */

// Prepara el formulario para crear una noticia.
function prepararNuevaNoticia() {
    noticiaEditando = null;

    formNoticia.reset();

    tituloFormNoticia.textContent = 'Publicar noticia';

    descripcionFormNoticia.textContent =
        'Completá los datos para publicar una noticia.';

    botonGuardarNoticia.textContent = 'Publicar noticia';

    botonCancelarEdicion.hidden = true;
}

// Prepara el formulario para modificar una noticia.
function editarNoticia(noticia) {
    if (!noticia.id) {
        mostrarMensaje('La noticia no tiene un identificador válido.');
        return;
    }

    noticiaEditando = noticia.id;

    inputTitulo.value = noticia.titulo || '';
    inputContenido.value = noticia.contenido || '';

    tituloFormNoticia.textContent = 'Modificar noticia';

    descripcionFormNoticia.textContent =
        'Modificá los datos de la noticia seleccionada.';

    botonGuardarNoticia.textContent = 'Guardar cambios';

    botonCancelarEdicion.hidden = false;

    cambiarSeccion('subir-noticia');
}

// Valida los campos manualmente.
function validarNoticia() {
    const titulo = inputTitulo.value.trim();
    const contenido = inputContenido.value.trim();

    if (!titulo || !contenido) {
        mostrarMensaje('Completá todos los campos.');
        return false;
    }

    if (titulo.length < 5 || titulo.length > 100) {
        mostrarMensaje('El título debe tener entre 5 y 100 caracteres.');
        return false;
    }

    if (contenido.length < 10 || contenido.length > 2000) {
        mostrarMensaje('El contenido debe tener entre 10 y 2000 caracteres.');
        return false;
    }

    return true;
}

// Envía el formulario.
formNoticia.addEventListener('submit', async evento => {
    evento.preventDefault();

    if (!validarNoticia()) return;

    const noticia = {
        titulo: inputTitulo.value.trim(),
        contenido: inputContenido.value.trim()
    };

    const editando = noticiaEditando !== null;

    const url = editando
        ? `/api/admin/noticias/${encodeURIComponent(noticiaEditando)}`
        : '/api/admin/noticias';

    const metodo = editando ? 'PUT' : 'POST';

    botonGuardarNoticia.disabled = true;

    try {
        await realizarPeticion(url, {
            method: metodo,
            body: JSON.stringify(noticia)
        });

        mostrarMensaje(
            editando
                ? 'La noticia se modificó correctamente.'
                : 'La noticia se publicó correctamente.',
            'exito'
        );

        prepararNuevaNoticia();

        await cargarNoticias();
        await cargarResumen();

        cambiarSeccion('gestionar-noticias');

    } catch (error) {
        mostrarMensaje(error.message);

    } finally {
        botonGuardarNoticia.disabled = false;
    }
});

// Cancela la modificación.
botonCancelarEdicion.addEventListener('click', () => {
    prepararNuevaNoticia();
});

/* ------------------------------
   ELIMINAR NOTICIAS
------------------------------ */

async function eliminarNoticia(noticia) {
    if (!noticia.id) {
        mostrarMensaje('La noticia no tiene un identificador válido.');
        return;
    }

    const confirmar = window.confirm(
        `¿Estás seguro de que querés eliminar "${noticia.titulo}"?`
    );

    if (!confirmar) return;

    try {
        await realizarPeticion(
            `/api/admin/noticias/${encodeURIComponent(noticia.id)}`,
            {
                method: 'DELETE'
            }
        );

        mostrarMensaje('La noticia se eliminó correctamente.', 'exito');

        await cargarNoticias();
        await cargarResumen();

    } catch (error) {
        mostrarMensaje(error.message);
    }
}

/* ------------------------------
   CERRAR SESIÓN
------------------------------ */

botonCerrarSesion.addEventListener('click', async () => {
    try {
        await realizarPeticion('/api/logout', {
            method: 'POST'
        });

        window.location.href = '/Login.html';

    } catch (error) {
        mostrarMensaje('No se pudo cerrar la sesión.');
    }
});


async function iniciarPanelAdmin() {
    const esAdministrador = await verificarAdministrador();

    if (!esAdministrador) return;

    cambiarSeccion('resumen');

    await cargarResumen();
}

iniciarPanelAdmin();