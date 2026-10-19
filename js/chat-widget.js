// ---- WIDGET DE CHAT: apertura/cierre + render de mensajes ----

const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// Abrir chat
chatFab.addEventListener('click', () => {
  chatWindow.classList.add('chat-window--open');
  chatFab.classList.add('chat-fab--hidden');

  // Mensaje de bienvenida solo la primera vez que se abre
  if (chatBody.children.length === 0) {
    mostrarMensajeBot('¡Hola! Soy Divina, tu asistente IA ✨ ¿En qué servicio estás interesada?');
    mostrarChips(['Manicure', 'Pedicure', 'Alisado', 'Maquillaje', 'Limpieza facial']);
  }
});

// Cerrar chat
chatClose.addEventListener('click', () => {
  chatWindow.classList.remove('chat-window--open');
  chatFab.classList.remove('chat-fab--hidden');
});

// Enviar mensaje con botón o Enter
chatSend.addEventListener('click', enviarMensaje);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') enviarMensaje();
});

function enviarMensaje() {
  const texto = chatInput.value.trim();
  if (!texto) return;

  mostrarMensajeUsuario(texto);
  chatInput.value = '';

  // Por ahora, respuesta simulada (en el Paso 6 la conectamos a la IA real)
  setTimeout(() => {
    mostrarMensajeBot('Estoy en construcción 🛠️ — pronto podré ayudarte a reservar de verdad.');
  }, 600);
}

// ---- Helpers para pintar mensajes ----

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

function mostrarChips(opciones) {
  const container = document.createElement('div');
  container.className = 'chat-chips';

  opciones.forEach(opcion => {
    const chip = document.createElement('button');
    chip.className = 'chat-chip';
    chip.textContent = opcion;
    chip.addEventListener('click', () => {
      mostrarMensajeUsuario(opcion);
      container.remove(); // ocultamos los chips una vez elegidos
      setTimeout(() => {
        mostrarMensajeBot(`Perfecto, elegiste ${opcion}. En el próximo paso ya podré ayudarte a agendar la fecha y hora 📅`);
      }, 600);
    });
    container.appendChild(chip);
  });

  chatBody.appendChild(container);
  scrollAbajo();
}

function scrollAbajo() {
  chatBody.scrollTop = chatBody.scrollHeight;
}