document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('#register-form');
  const loginForm = document.querySelector('#login-form');
  const roleSelect = document.querySelector('#role');
  const lawyerFields = document.querySelector('#lawyer-fields');

  if (roleSelect && lawyerFields) {
    roleSelect.addEventListener('change', () => {
      lawyerFields.hidden = roleSelect.value !== 'lawyer';
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(registerForm);
      const payload = Object.fromEntries(form.entries());
      try {
        await api('/auth/register', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
        alert('Registration successful. Please log in.');
        window.location.href = 'login.html';
      } catch (error) {
        document.querySelector('#auth-message').textContent = error.message;
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(loginForm);
      try {
        const data = await api('/auth/login', { method: 'POST', headers: authHeaders(), body: JSON.stringify(Object.fromEntries(form.entries())) });
        localStorage.setItem('nyaysetu_auth', JSON.stringify(data));
        window.location.href = data.user.role === 'admin' ? 'index.html' : 'lawyers.html';
      } catch (error) {
        document.querySelector('#auth-message').textContent = error.message;
      }
    });
  }
});
