const contenedorNoticia = document.getElementById('contenido-noticia');

function obtenerIdNoticia() {
    const parametros = new URLSearchParams(window.location.search);

    return parametros.get('id');
}


async function cargarNoticia() {
    contenedorNoticia.setAttribute('aria-busy', 'true');

    try {
        const id = obtenerIdNoticia();

        if (!id) {
            throw new Error('No se proporcionó el identificador de la noticia.');
        }

        const respuesta = await fetch(
            `/api/noticias/${encodeURIComponent(id)}`
        );

        if (respuesta.status === 404) {
            throw new Error('La noticia solicitada no existe.');
        }

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar la noticia.');
        }

        const noticia = await respuesta.json();

        mostrarNoticia(noticia);

    } catch (error) {
        console.error('Error al cargar la noticia:', error);

        mostrarEstado(error.message);

    } finally {
        contenedorNoticia.setAttribute('aria-busy', 'false');
    }
}



/**
 * Construye la presentación de la noticia.
 */
function mostrarNoticia(noticia) {
    contenedorNoticia.replaceChildren();

    // Título.
    const titulo = document.createElement('h1');
    titulo.id = 'titulo-noticia';
    titulo.textContent = noticia.titulo || 'Noticia sin título';

    const metadatos = document.createElement('div');
    metadatos.classList.add('metadatos-noticia');

    const fecha = document.createElement('time');
    const fechaNoticia = new Date(noticia.fecha);

    if (!Number.isNaN(fechaNoticia.getTime())) {
        fecha.dateTime = fechaNoticia.toISOString();

        fecha.textContent = fechaNoticia.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } else {
        fecha.textContent = 'Fecha no disponible';
    }

    metadatos.appendChild(fecha);

    const contenido = document.createElement('div');
    contenido.classList.add('texto-noticia');
    contenido.textContent = noticia.contenido || 'Sin contenido disponible.';

    contenedorNoticia.append(titulo, metadatos, contenido);
}



function mostrarEstado(mensaje) {
    contenedorNoticia.replaceChildren();

    const estado = document.createElement('p');
    estado.classList.add('estado-noticias');
    estado.textContent = mensaje;

    contenedorNoticia.appendChild(estado);
}

cargarNoticia();
