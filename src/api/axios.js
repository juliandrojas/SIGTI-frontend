import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://sigti-backend.vercel.app';

const api = axios.create({
  baseURL: apiBaseUrl, headers: {
        'Content-Type': 'application/json',
    }
});
// Opcional: Interceptor para enviar el token JWT automáticamente si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;