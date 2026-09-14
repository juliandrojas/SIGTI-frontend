# Instrucciones para agentes: SIGTI Frontend

Lee primero `../server/docs/PROJECT_GUIDE.md` cuando trabajes en el espacio de trabajo completo. Este repositorio contiene la aplicación React/Vite.

- Las rutas protegidas se definen en `src/App.jsx` y los permisos visuales no sustituyen la autorización del servidor.
- Centraliza peticiones HTTP en `src/api/axios.js` y preserva el envío automático del JWT.
- Para cambios de API, confirma antes el contrato documentado por el backend.
- No incluyas secretos en `VITE_*`; cualquier variable Vite se expone al navegador.
- Ejecuta `npm run lint` y `npm run build` antes de entregar cambios.
- Respeta cambios no relacionados presentes en el árbol de trabajo.
