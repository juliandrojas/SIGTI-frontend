import { Navigate, Route, Routes } from "react-router-dom";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
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
      {/* Rutas de Administrador (Rol 1) */}
      <Route element={<RoleProtectedRoute allowedRoles={[1]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="roles" element={<Roles />} />
          <Route path="roles/edit/:id" element={<EditRole />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="register" element={<RegisterComponent />} />
          <Route path="loans" element={<Loans />} />
        </Route>
      </Route>

      {/* Rutas de Sistemas (Rol 2) */}
      <Route element={<RoleProtectedRoute allowedRoles={[2]} />}>
        <Route path="/sistemas" element={<SistemasLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="register" element={<RegisterComponent />} />
          <Route path="loans" element={<Loans />} />
        </Route>
      </Route>

      {/* Rutas de Usuarios Externos (Rol 3) */}
      <Route element={<RoleProtectedRoute allowedRoles={[3]} />}>
        <Route path="/usuario" element={<UsuarioLayout />}>
          <Route index element={<Navigate to="loans" replace />} />
          <Route path="loans" element={<Loans />} />
        </Route>
      </Route>

      {/* Redirección global a login si entran a / */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/recovery/:token" element={<RecoveryForm />} />
      </Route>

      <Route path="/login" element={<Login />} />

    </Routes>
  );
}

export default App;