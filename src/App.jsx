import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
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
      {/* Rutas públicas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/roles/edit/:id" element={<EditRole />} />
          <Route path="admin/inventory" element={<Inventory />} />
          <Route path="admin/register" element={<RegisterComponent />} />
          <Route path="admin/loans" element={<Loans />} />
        </Route>
      </Route>

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