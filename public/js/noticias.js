
const contenedorNoticias = document.getElementById('contenedor-noticias');
const paginacion = document.getElementById('paginacion-noticias');
const botonAnterior = document.getElementById('pagina-anterior');
const botonSiguiente = document.getElementById('pagina-siguiente');
const estadoPaginacion = document.getElementById('estado-paginacion');

const noticiasPorPagina = 6;
let paginaActual = 1;
let totalPaginas = 0;

botonAnterior.addEventListener('click', () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarNoticias();
    }
});

botonSiguiente.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarNoticias();
    }
});

async function cargarNoticias() {
    contenedorNoticias.setAttribute('aria-busy', 'true');
    botonAnterior.disabled = true;
    botonSiguiente.disabled = true;

    try {
        const parametros = new URLSearchParams({
            pagina: paginaActual,
            limite: noticiasPorPagina
        });

        const respuesta = await fetch(`/api/noticias?${parametros}`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos.noticias)) {
            throw new Error('Formato de respuesta inválido');
        }

        totalPaginas = datos.totalPaginas;
        contenedorNoticias.replaceChildren();

        if (datos.noticias.length === 0) {
            mostrarEstado('Todavía no hay noticias publicadas.');
            paginacion.hidden = true;
            return;
        }

        datos.noticias.forEach(noticia => {
            contenedorNoticias.appendChild(crearTarjetaNoticia(noticia));
        });

        paginacion.hidden = totalPaginas <= 1;
        estadoPaginacion.textContent =
            `Página ${datos.pagina} de ${totalPaginas}`;

        botonAnterior.disabled = datos.pagina <= 1;
        botonSiguiente.disabled = datos.pagina >= totalPaginas;

    } catch (error) {
        console.error('Error al cargar noticias:', error);

        contenedorNoticias.replaceChildren();
        mostrarEstado(
            'No se pudieron cargar las noticias. Intentá nuevamente más tarde.'
        );
        paginacion.hidden = true;
    } finally {
        contenedorNoticias.setAttribute('aria-busy', 'false');
    }
}

function crearTarjetaNoticia(noticia) {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('tarjeta-noticia');

    const cuerpo = document.createElement('div');
    cuerpo.classList.add('contenido-tarjeta');

    const titulo = document.createElement('h3');
    titulo.textContent = noticia.titulo || 'Noticia sin título';

    const descripcion = document.createElement('p');
    descripcion.classList.add('descripcion-noticia');
    descripcion.textContent = noticia.contenido || 'Sin descripción disponible.';

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

   metadatos.append(fecha);

    const enlace = document.createElement('a');
    enlace.classList.add('enlace-noticia');
    enlace.href = `/noticia.html?id=${encodeURIComponent(noticia.id)}`;
    enlace.textContent = 'Leer noticia';

    cuerpo.append(titulo, descripcion, metadatos, enlace);
    tarjeta.append(cuerpo);

    return tarjeta;
}

function mostrarEstado(mensaje) {
    const estado = document.createElement('p');

    estado.classList.add('estado-noticias');
    estado.textContent = mensaje;

    contenedorNoticias.appendChild(estado);
}

cargarNoticias();
