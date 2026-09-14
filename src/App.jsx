import { Navigate, Route, Routes } from "react-router-dom";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SistemasLayout from "./layouts/SistemasLayout";
import UsuarioLayout from "./layouts/UsuarioLayout";
import PublicLayout from "./layouts/PublicLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Inventory from "./pages/admin/Inventory";
import Maintenance from "./pages/systems/Maintenance";
import Recovery from "./pages/public/Recovery";
import RecoveryForm from "./pages/public/RecoveryForm";
import Register from "./pages/public/Register";
import Loans from "./pages/admin/Loans";
import Requests from "./pages/Requests";

function App() {
  return (
    <Routes>
      {/* ─── 1. Rutas de SISTEMAS (Rol 1 - Administrador técnico) ─── */}
      <Route element={<RoleProtectedRoute allowedRoles={[1]} />}>
        <Route path="/sistemas" element={<SistemasLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="loans" element={<Loans />} />
          <Route path="register" element={<Navigate to="/sistemas/inventory" replace />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="requests" element={<Requests />} />
        </Route>
      </Route>

      {/* ─── 2. Rutas de USUARIO (Rol 2 - Colaboradores generales) ─── */}
      <Route element={<RoleProtectedRoute allowedRoles={[2]} />}>
        <Route path="/usuario" element={<UsuarioLayout />}>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<Requests />} />
          <Route path="loans" element={<Navigate to="requests" replace />} />
        </Route>
      </Route>

      {/* ─── 3. Rutas públicas ─── */}
      <Route element={<PublicLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/recovery/:token" element={<RecoveryForm />} />
      </Route>

      <Route path="/login" element={<Login />} />

      {/* Redirección por defecto a login si no coincide ninguna ruta */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
