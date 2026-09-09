import axios from 'axios';
import { clearSession, getToken } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, headers: {
        'Content-Type': 'application/json',
    }
});
// Opcional: Interceptor para enviar el token JWT automáticamente si existe
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;