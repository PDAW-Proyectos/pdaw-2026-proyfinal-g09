
const contenedorNoticias = document.getElementById('contenedor-noticias');

/**
 * Carga las noticias desde la API.
 */
async function cargarNoticias() {
    contenedorNoticias.setAttribute('aria-busy', 'true');

    try {
        const respuesta = await fetch('/api/noticias');

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // La API puede devolver un array o un objeto paginado.
        const noticias = Array.isArray(datos)
            ? datos
            : datos.noticias;

        if (!Array.isArray(noticias)) {
            throw new Error('Formato de respuesta inválido');
        }

        contenedorNoticias.replaceChildren();

        if (noticias.length === 0) {
            mostrarEstado('Todavía no hay noticias publicadas.');
            return;
        }

        noticias.forEach(noticia => {
            const tarjeta = crearTarjetaNoticia(noticia);
            contenedorNoticias.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error al cargar noticias:', error);

        contenedorNoticias.replaceChildren();

        mostrarEstado(
            'No se pudieron cargar las noticias. Intentá nuevamente más tarde.'
        );
    } finally {
        contenedorNoticias.setAttribute('aria-busy', 'false');
    }
}

/**
 * Construye una tarjeta individual.
 */
function crearTarjetaNoticia(noticia) {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('tarjeta-noticia');

    // Imagen de portada.
    const portada = document.createElement('div');
    portada.classList.add('portada-tarjeta');

    const imagenUrl = obtenerImagen(noticia);

    if (imagenUrl) {
        const imagen = document.createElement('img');

        imagen.src = imagenUrl;
        imagen.alt = noticia.titulo
            ? `Imagen de ${noticia.titulo}`
            : 'Imagen de la noticia';

        imagen.loading = 'lazy';
        imagen.decoding = 'async';

        imagen.addEventListener('error', () => {
            portada.classList.add('sin-imagen');
            imagen.remove();
        });

        portada.appendChild(imagen);
    } else {
        portada.classList.add('sin-imagen');
    }

    // Categoría.
    const categoria = document.createElement('span');
    categoria.classList.add('categoria-noticia');
    categoria.textContent = noticia.categoria || 'NOVEDAD';

    portada.appendChild(categoria);

    // Contenido de la tarjeta.
    const cuerpo = document.createElement('div');
    cuerpo.classList.add('contenido-tarjeta');

    const titulo = document.createElement('h3');
    titulo.textContent = noticia.titulo || 'Noticia sin título';

    const descripcion = document.createElement('p');
    descripcion.classList.add('descripcion-noticia');
    descripcion.textContent = noticia.contenido || 'Sin descripción disponible.';

    // Metadatos.
    const metadatos = document.createElement('div');
    metadatos.classList.add('metadatos-noticia');

    const fecha = document.createElement('time');
    const fechaNoticia = new Date(noticia.fecha);

    if (!Number.isNaN(fechaNoticia.getTime())) {
        fecha.dateTime = fechaNoticia.toISOString();

        fecha.textContent = fechaNoticia.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } else {
        fecha.textContent = 'Fecha no disponible';
    }

    const autor = document.createElement('span');
    autor.textContent = noticia.autor
        ? `Por ${noticia.autor}`
        : 'La cochera de Nidodo';

    metadatos.append(fecha, autor);

    cuerpo.append(titulo, descripcion, metadatos);
    tarjeta.append(portada, cuerpo);

    return tarjeta;
}

/**
 * Obtiene una URL de imagen si la noticia tiene una.
 * Admite diferentes nombres habituales de propiedades.
 */
function obtenerImagen(noticia) {
    const url = noticia.imagen || noticia.imagenUrl || noticia.portada;

    if (typeof url !== 'string' || !url.trim()) {
        return null;
    }

    try {
        const urlValidada = new URL(url, window.location.origin);

        if (
            urlValidada.protocol !== 'http:' &&
            urlValidada.protocol !== 'https:'
        ) {
            return null;
        }

        return urlValidada.href;
    } catch {
        return null;
    }
}

/**
 * Muestra mensajes de carga, error o ausencia de noticias.
 */
function mostrarEstado(mensaje) {
    const estado = document.createElement('p');

    estado.classList.add('estado-noticias');
    estado.textContent = mensaje;

    contenedorNoticias.appendChild(estado);
}

cargarNoticias();
