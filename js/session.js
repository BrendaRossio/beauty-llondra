// ---- Maneja el estado de sesión en el header (todas las páginas) ----

async function renderHeaderSession() {
  const headerActions = document.getElementById('headerActions');
  if (!headerActions) return; // login.html/register.html no tienen header

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    headerActions.innerHTML = `<a href="login.html" class="btn btn--ghost">Ingresar</a>`;
    return;
  }

  // Traer el nombre desde la tabla perfiles
  const { data: perfil } = await supabaseClient
    .from('perfiles')
    .select('nombre')
    .eq('id', session.user.id)
    .single();

  const nombre = perfil?.nombre || session.user.email.split('@')[0];

  headerActions.innerHTML = `
    <div class="user-menu">
      <button class="user-menu__trigger" id="userMenuTrigger">
        <span class="user-menu__avatar">🌸</span>
        <span>${nombre}</span>
        <span>▾</span>
      </button>
      <div class="user-menu__dropdown" id="userMenuDropdown">
        <button id="logoutBtn">Cerrar sesión</button>
      </div>
    </div>
  `;

  const trigger = document.getElementById('userMenuTrigger');
  const dropdown = document.getElementById('userMenuDropdown');

  trigger.addEventListener('click', () => {
    dropdown.classList.toggle('user-menu__dropdown--open');
  });

  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('user-menu__dropdown--open');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });
}

renderHeaderSession();