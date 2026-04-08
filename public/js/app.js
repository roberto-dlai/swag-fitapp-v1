(function () {
  if (!API.isLoggedIn()) {
    window.location.href = '/';
    return;
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    API.clearToken();
    window.location.href = '/';
  });

  // Initialize dashboard
  Dashboard.init();
})();
