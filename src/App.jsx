import { Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/public/Home";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout/>}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>
      {/* Rutas del Panel de Administración */}
      <Route path="/admin" element={<AdminLayout/>}>
        <Route index element={<AdminDashboard />} />
        {/* <Route path="tickets" element={} /> */}
      </Route>
    </Routes>

  );
}
export default App;