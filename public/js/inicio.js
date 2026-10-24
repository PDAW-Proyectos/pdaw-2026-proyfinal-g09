const aviso = document.querySelector('#aviso');
const texto = document.querySelector('#aviso-texto');
const mensajes = {
  aportes: 'Los aportes todavía no están habilitados. Podés conocer el juego con la demo de prueba, sin realizar ningún pago.'
};

document.querySelectorAll('[data-aviso="aportes"]').forEach(boton => {
  boton.addEventListener('click', () => {
    texto.textContent = mensajes[boton.dataset.aviso];
    aviso.showModal();
  });
});
