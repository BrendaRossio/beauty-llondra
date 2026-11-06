// ---- WIDGET DE CHAT conectado a la IA (Gemini) ----
// Usa WHATSAPP_NUMBER, que ya está definido en main.js

const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

let historial = [];
let estadoReserva = { servicio: null, fecha: null, hora: null, nombre: null };
let conversacionTerminada = false; // la IA ya recopiló todo
let reservaGuardada = false;       // evita guardar dos veces en la base de datos

function abrirChat() {
  chatWindow.classList.add('chat-window--open');
  chatFab.classList.add('chat-fab--hidden');
  if (chatBody.children.length === 0) iniciarConversacion();
}

function cerrarChat() {
  chatWindow.classList.remove('chat-window--open');
  chatFab.classList.remove('chat-fab--hidden');
}

chatFab.addEventListener('click', abrirChat);
chatClose.addEventListener('click', cerrarChat);
chatSend.addEventListener('click', enviarMensaje);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') enviarMensaje();
});

async function iniciarConversacion() {
  mostrarTyping();
  const data = await llamarIA([{ role: "user", content: "Hola" }]);
  ocultarTyping();

  if (data) {
    historial.push({ role: "user", content: "Hola" });
    historial.push({ role: "assistant", content: JSON.stringify(data) });
    mostrarMensajeBot(data.respuesta);
    actualizarEstado(data);
  }
}

async function enviarMensaje() {
  const texto = chatInput.value.trim();
  if (!texto || conversacionTerminada) return;

  mostrarMensajeUsuario(texto);
  chatInput.value = '';
  historial.push({ role: "user", content: texto });

  mostrarTyping();
  const data = await llamarIA(historial);
  ocultarTyping();

  if (!data) return;

  historial.push({ role: "assistant", content: JSON.stringify(data) });
  mostrarMensajeBot(data.respuesta);
  actualizarEstado(data);

  if (data.listo) {
    conversacionTerminada = true;
    mostrarBotonesFinales();
  }
}

async function llamarIA(mensajes) {
  try {
    const res = await fetch(CHAT_IA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ mensajes })
    });

    if (res.status === 429) {
      mostrarMensajeBot('Estoy recibiendo muchas consultas en este momento 😅 Intenta de nuevo en un minuto.');
      return null;
    }
    if (!res.ok) throw new Error('Fallo en la respuesta');
    return await res.json();

  } catch (error) {
    console.error(error);
    ocultarTyping();
    mostrarMensajeBot('Ups, tuve un problema para responder 😥 Intenta de nuevo en un momento.');
    return null;
  }
}

function actualizarEstado(data) {
  if (data.servicio) estadoReserva.servicio = data.servicio;
  if (data.fecha) estadoReserva.fecha = data.fecha;
  if (data.hora) estadoReserva.hora = data.hora;
  if (data.nombre) estadoReserva.nombre = data.nombre;
}

// ---------- FINAL DE LA CONVERSACIÓN: dos botones ----------

function armarUrlWhatsApp() {
  const mensaje =
`¡Hola! Quiero confirmar mi cita 💅 (reservada con Divina, tu asistente IA)

*Servicio:* ${estadoReserva.servicio}
*Fecha:* ${estadoReserva.fecha}
*Hora:* ${estadoReserva.hora}
*Nombre:* ${estadoReserva.nombre}

Quedo atenta al QR para pagar la seña de Bs 50 y confirmar mi cita 🙌`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

function mostrarBotonesFinales() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot';
  div.innerHTML = `
    <p>¡Todo listo, ${estadoReserva.nombre}! ¿Cómo quieres continuar?</p>
    <div class="chat-actions">
      <button type="button" class="chat-action-btn" id="btnIrFormulario">Revisar y confirmar mi reserva</button>
      <a href="${armarUrlWhatsApp()}" target="_blank" class="chat-action-btn chat-whatsapp-btn" id="btnWhatsappDirecto">Confirmar directo por WhatsApp</a>
    </div>
  `;
  chatBody.appendChild(div);
  scrollAbajo();

  document.getElementById('btnIrFormulario').addEventListener('click', prellenarFormulario);
  document.getElementById('btnWhatsappDirecto').addEventListener('click', guardarReservaChat);
}

// Opción 1: rellena el formulario de reservas y lleva a la clienta hasta ahí
function prellenarFormulario() {
  const campos = {
    servicio: estadoReserva.servicio,
    fecha: estadoReserva.fecha,
    hora: estadoReserva.hora,
    nombre: estadoReserva.nombre
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el && valor) {
      el.value = valor;
      el.classList.add('booking-form__field--highlight');
      setTimeout(() => el.classList.remove('booking-form__field--highlight'), 2500);
    }
  });

  // main.js lee esto para guardar la reserva con origen "chat_ia"
  window.reservaDesdeChat = true;

  cerrarChat();
  document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });
}

// Opción 2: guarda la reserva (una sola vez) mientras se abre WhatsApp
async function guardarReservaChat() {
  if (reservaGuardada) return;
  reservaGuardada = true;

  try {
    const { data: servicioData } = await supabaseClient
      .from('servicios')
      .select('id')
      .eq('nombre', estadoReserva.servicio)
      .single();

    const { data: { session } } = await supabaseClient.auth.getSession();

    await supabaseClient.from('reservas').insert({
      usuario_id: session?.user?.id ?? null,
      nombre_cliente: estadoReserva.nombre,
      servicio_id: servicioData?.id ?? null,
      fecha: estadoReserva.fecha,
      hora: estadoReserva.hora,
      origen: 'chat_ia'
    });
  } catch (error) {
    console.error('No se pudo guardar la reserva:', error);
  }
}

// ---------- Helpers de interfaz ----------

function mostrarMensajeBot(texto) {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot';
  div.textContent = texto;
  chatBody.appendChild(div);
  scrollAbajo();
}

function mostrarMensajeUsuario(texto) {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--user';
  div.textContent = texto;
  chatBody.appendChild(div);
  scrollAbajo();
}

function mostrarTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot chat-typing';
  div.id = 'typingIndicator';
  div.innerHTML = `<span></span><span></span><span></span>`;
  chatBody.appendChild(div);
  scrollAbajo();
}

function ocultarTyping() {
  document.getElementById('typingIndicator')?.remove();
}

function scrollAbajo() {
  chatBody.scrollTop = chatBody.scrollHeight;
}