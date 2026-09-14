import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession } from '../utils/auth';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const getLinksForRole = () => {
    return [
      { text: "Inicio", href: "/admin/" },
      { text: "Registrar componente", href: "/admin/register" },
      { text: "Inventario", href: "/admin/inventory" },
      { text: "Historial de Préstamos", href: "/admin/loans" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
