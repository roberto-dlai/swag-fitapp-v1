const http = require('node:http');

/**
 * Minimal HTTP request helper for integration tests.
 * Returns a Promise that resolves to { status, body } where body is JSON when possible.
 */
function requestFactory(baseUrl) {
  return function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const body = options.body ? JSON.stringify(options.body) : null;
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { requestFactory, authHeader };
