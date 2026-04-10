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

    // Attempt to parse JSON, but tolerate non-JSON responses (e.g. HTML
    // error pages from the proxy, rate limiter, or bad gateway).
    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      // Drain the body so the connection can be reused.
      try { await response.text(); } catch { /* ignore */ }
    }

    if (!response.ok) {
      const message = (data && (data.error || data.errors?.join(', '))) || `Request failed (${response.status})`;
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
