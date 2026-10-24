// Incluir con defer antes del JavaScript propio de cada pantalla.
class CabeceraSitio extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<a class="salto" href="#contenido">Saltar al contenido</a>
  <header class="cabecera">
    <a class="marca" href="/" aria-label="La cochera de Nidodo, inicio"><img src="/img/icono-nidodo.jpeg" alt="" width="44" height="44"><span>LA COCHERA<br>DE NIDODO</span></a>
    <nav aria-label="Navegación principal">
      <a href="/#juego">El juego</a><a href="/#imagenes">Imágenes</a><a href="/#demo">Demo</a><a href="/foro.html">Foro</a>
      <button class="boton secundario" type="button" data-aviso="cuentas">Iniciar sesión</button>
    </nav>
  </header>`;
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

// Los botones de ingreso funcionan también en otras pantallas.
document.addEventListener('click', evento => {
  if (!evento.target.closest('[data-aviso="cuentas"]')) return;
  document.querySelector('#aviso-texto').textContent = 'El ingreso y el registro estarán disponibles próximamente. Mientras tanto, podés abrir la demo de prueba desde Inicio.';
  document.querySelector('#aviso').showModal();
});
