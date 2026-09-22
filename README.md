# SIGTI — interfaz web

Interfaz React/Vite de **Gestión de Activos TI**. El frontend presenta solicitudes de colaboradores y las vistas de inventario, préstamos y mantenimiento para Sistemas; la lógica de negocio y los permisos se validan en la API del repositorio `SIGTI-backend`.

## Desarrollo

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

`VITE_API_URL` indica la URL del backend. Sin esa variable, `src/api/axios.js` utiliza la URL de producción definida allí; el frontend local **no** inicia una API local automáticamente. No coloques secretos en variables `VITE_*`: se incluyen en la compilación del navegador.

## Verificación y compilación

```powershell
npm run lint
npm run build
```

`vercel.json` redirige las rutas de la aplicación de una sola página a `index.html`. Antes de publicar, confirma que `VITE_API_URL` del entorno de despliegue apunta a la API autorizada.

La documentación de entrega (manual de usuario, guía técnica y migración a PostgreSQL propio) se mantiene en el repositorio de backend, en `docs/company/`. Los contratos de API se mantienen en `docs/api/` del mismo repositorio.
