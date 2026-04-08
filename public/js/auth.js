(function () {
  if (API.isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const authError = document.getElementById('auth-error');

  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    authError.classList.add('hidden');
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authError.classList.add('hidden');
  });

  function showError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await API.post('/api/auth/login', { email, password });
      API.setToken(data.token);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showError(err.message);
    }
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const data = await API.post('/api/auth/signup', { name, email, password });
      API.setToken(data.token);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showError(err.message);
    }
  });
})();
