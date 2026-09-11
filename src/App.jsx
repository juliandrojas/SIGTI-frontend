import { Navigate, Route, Routes } from "react-router-dom";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SistemasLayout from "./layouts/SistemasLayout";
import UsuarioLayout from "./layouts/UsuarioLayout";
import PublicLayout from "./layouts/PublicLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EditRole from "./pages/admin/EditRole";
import Inventory from "./pages/admin/Inventory";
import Roles from "./pages/admin/Roles";
import Recovery from "./pages/public/Recovery";
import RecoveryForm from "./pages/public/RecoveryForm";
import Register from "./pages/public/Register";
import RegisterComponent from "./pages/admin/RegisterComponent";
import Loans from "./pages/admin/Loans";

function App() {
  return (
    <Routes>
      {/* ─── 1. Rutas de SISTEMAS (Rol 1 - Administrador técnico) ─── */}
      <Route element={<RoleProtectedRoute allowedRoles={[1]} />}>
        <Route path="/sistemas" element={<SistemasLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="loans" element={<Loans />} />
          <Route path="register" element={<RegisterComponent />} />
          <Route path="roles" element={<Roles />} />
          <Route path="roles/edit/:id" element={<EditRole />} />
        </Route>
      </Route>

      {/* ─── 2. Rutas de USUARIO (Rol 2 - Colaboradores generales) ─── */}
      <Route element={<RoleProtectedRoute allowedRoles={[2]} />}>
        <Route path="/usuario" element={<UsuarioLayout />}>
          <Route index element={<Navigate to="loans" replace />} />
          <Route path="loans" element={<Loans />} />
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