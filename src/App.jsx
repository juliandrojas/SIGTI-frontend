import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EditRole from "./pages/admin/EditRole";
import Roles from "./pages/admin/Roles";
import Home from "./pages/public/Home";
import Recovery from "./pages/public/Recovery";
import RecoveryForm from "./pages/public/RecoveryForm";
import Register from "./pages/public/Register";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/recovery/:token" element={<RecoveryForm />} />
      </Route>

      <Route path="/login" element={<Login />} />

      {/* Rutas del Panel de Administración */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="roles" element={<Roles />} />
          <Route path="roles/edit/:id" element={<EditRole />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;