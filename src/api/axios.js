import axios from 'axios';
import { clearSession, getToken } from '../utils/auth';

// El frontend puede ejecutarse localmente sin levantar otra instancia del backend.
// Para desarrollo local usamos producción salvo que se defina explícitamente VITE_API_URL.
const productionApiUrl = import.meta.env.VITE_API_URL_PROD || 'https://sigti-backend.vercel.app/';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || productionApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
let redirectingToLogin = false;
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
    const hasExpiredSession = error.response?.status === 401
      && Boolean(getToken())
      && window.location.pathname !== '/login';

    if (redirectingToLogin || hasExpiredSession) {
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        clearSession();
        window.location.replace('/login');
      }

      // Evita que los catch de la vista alcancen a mostrar un modal mientras
      // el navegador reemplaza la ruta protegida por el inicio de sesión.
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default api;
