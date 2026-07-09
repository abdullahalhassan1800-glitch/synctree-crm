import axios from 'axios';

function buildUrlEncoded(data, prefix) {
  const params = [];
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const value = data[key];
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          const k = `${fullKey}[${i}]`;
          params.push(...(item !== null && typeof item === 'object' ? buildUrlEncoded(item, k) : [`${encodeURIComponent(k)}=${encodeURIComponent(item)}`]));
        });
      } else {
        params.push(...buildUrlEncoded(value, fullKey));
      }
    } else {
      params.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value ?? '')}`);
    }
  }
  return params;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  transformRequest: [(data) => {
    if (data && typeof data === 'object') {
      return buildUrlEncoded(data).join('&');
    }
    return data;
  }],
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
