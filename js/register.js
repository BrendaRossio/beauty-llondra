const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerSubmit = document.getElementById('registerSubmit');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  registerSubmit.disabled = true;
  registerSubmit.textContent = 'Creando cuenta...';

  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { nombre, telefono } }
  });

  registerSubmit.disabled = false;
  registerSubmit.textContent = 'Crear cuenta';

  if (error) {
    registerError.textContent = traducirError(error.message);
    return;
  }

  window.location.href = 'index.html';
});

function traducirError(msg) {
  if (msg.includes('already registered')) return 'Este correo ya está registrado.';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.';
  return 'Ocurrió un error. Intenta de nuevo.';
}