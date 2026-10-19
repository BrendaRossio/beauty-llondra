const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('.nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('nav--open');
});

// ---- RESERVA: guarda en Supabase + abre WhatsApp ----
const WHATSAPP_NUMBER = "59169582276";

const bookingForm = document.getElementById('bookingForm');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const servicio = document.getElementById('servicio').value;
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const nombre = document.getElementById('nombre').value;

  const submitBtn = bookingForm.querySelector('.booking-form__submit');
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  // 1. Buscar el id del servicio elegido
  const { data: servicioData } = await supabaseClient
    .from('servicios')
    .select('id')
    .eq('nombre', servicio)
    .single();

  // 2. Guardar la reserva
  const { error } = await supabaseClient.from('reservas').insert({
    nombre_cliente: nombre,
    servicio_id: servicioData?.id ?? null,
    fecha: fecha,
    hora: hora,
    origen: 'formulario'
  });

  submitBtn.disabled = false;
  submitBtn.textContent = "Reservar por WhatsApp";

  if (error) {
    console.error(error);
    alert("Hubo un problema guardando tu reserva, pero igual te llevamos a WhatsApp.");
  }

  // 3. Armar mensaje y abrir WhatsApp
  const mensaje =
`¡Hola! Quiero reservar una cita 💅

*Servicio:* ${servicio}
*Fecha:* ${fecha}
*Hora:* ${hora}
*Nombre:* ${nombre}

Quedo atenta al QR para la reserva de Bs 50 y confirmar mi cita 🙌`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
});

// ---- Botón "Reservar" de cada servicio: pre-selecciona y desplaza al formulario ----
document.querySelectorAll('.btn--reservar').forEach(btn => {
  btn.addEventListener('click', () => {
    const servicioElegido = btn.dataset.servicio;
    const selectServicio = document.getElementById('servicio');

    selectServicio.value = servicioElegido;

    // resalta brevemente el campo para que la clienta note que ya se seleccionó
    selectServicio.classList.add('booking-form__field--highlight');
    setTimeout(() => {
      selectServicio.classList.remove('booking-form__field--highlight');
    }, 1500);

    document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });
  });
});