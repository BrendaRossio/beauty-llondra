// ---- WIDGET DE CHAT conectado a la IA (Gemini) ----
// Usa WHATSAPP_NUMBER, que ya está definido en main.js (por eso no lo repetimos aquí)

const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// Historial de la conversación (se envía completo a la IA en cada turno)
let historial = [];
// Datos que la IA va completando
let estadoReserva = { servicio: null, fecha: null, hora: null, nombre: null };
let reservaGuardada = false;

chatFab.addEventListener('click', () => {
  chatWindow.classList.add('chat-window--open');
  chatFab.classList.add('chat-fab--hidden');

  if (chatBody.children.length === 0) {
    iniciarConversacion();
  }
});

chatClose.addEventListener('click', () => {
  chatWindow.classList.remove('chat-window--open');
  chatFab.classList.remove('chat-fab--hidden');
});

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
  if (!texto || reservaGuardada) return;

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
    await confirmarReserva();
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

// Cuando la IA marca listo=true: guarda en Supabase + muestra botón de WhatsApp
async function confirmarReserva() {
  reservaGuardada = true;

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

  const mensaje =
`¡Hola! Quiero confirmar mi cita 💅 (reservada con Divina, tu asistente IA)

*Servicio:* ${estadoReserva.servicio}
*Fecha:* ${estadoReserva.fecha}
*Hora:* ${estadoReserva.hora}
*Nombre:* ${estadoReserva.nombre}

Quedo atenta al QR para la seña de Bs 50 🙌`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot';
  div.innerHTML = `
    <p style="margin-bottom:10px;">¡Todo listo! Confirma tu cita en WhatsApp 👇</p>
    <a href="${url}" target="_blank" class="chat-whatsapp-btn">Confirmar en WhatsApp</a>
  `;
  chatBody.appendChild(div);
  scrollAbajo();
}

// ---- Helpers de interfaz ----

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