const API = {
  getToken() {
    return localStorage.getItem('fitcheck_token');
  },

  setToken(token) {
    localStorage.setItem('fitcheck_token', token);
  },

  clearToken() {
    localStorage.removeItem('fitcheck_token');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(path, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      const message = data.error || data.errors?.join(', ') || 'Something went wrong';
      throw new Error(message);
    }

    return data;
  },

  get(path) {
    return this.request(path);
  },

  post(path, body) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  },

  patch(path, body) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  },
};
