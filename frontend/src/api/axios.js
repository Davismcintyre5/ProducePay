import axios from 'axios';

const baseURL = '/api/v1';

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshing = null;
const queue = [];

function queueRequest(config) {
  return new Promise((resolve, reject) => {
    queue.push({ config, resolve, reject });
  });
}

function flushQueue(token) {
  while (queue.length) {
    const { config, resolve, reject } = queue.shift();
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      api(config).then(resolve).catch(reject);
    } else {
      reject(new Error('Session expired'));
    }
  }
}

api.interceptors.request.use((config) => {
  if (!config.headers['X-Request-Id']) {
    config.headers['X-Request-Id'] = crypto.randomUUID();
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status !== 401 || original.__isRetry) {
      return Promise.reject(error);
    }

    const url = original.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (refreshing) {
      return queueRequest(original);
    }

    original.__isRetry = true;

    refreshing = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.accessToken;
        if (!token) throw new Error('No access token returned');
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        flushQueue(token);
        return token;
      })
      .catch((err) => {
        flushQueue(null);
        delete api.defaults.headers.common.Authorization;
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login')
        ) {
          window.location.href = '/login';
        }
        throw err;
      })
      .finally(() => {
        refreshing = null;
      });

    try {
      const token = await refreshing;
      original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
      return api(original);
    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export default api;