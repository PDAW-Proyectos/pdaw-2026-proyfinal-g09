const aviso = document.querySelector('#aviso');
const texto = document.querySelector('#aviso-texto');
const mensajes = {
  cuentas: 'El ingreso y el registro estarán disponibles próximamente. Mientras tanto, podés abrir la demo de prueba desde Inicio.',
  aportes: 'Los aportes todavía no están habilitados. Podés conocer el juego con la demo de prueba, sin realizar ningún pago.'
};

document.querySelectorAll('[data-aviso]').forEach(boton => {
  boton.addEventListener('click', () => {
    texto.textContent = mensajes[boton.dataset.aviso];
    aviso.showModal();
  });
});
