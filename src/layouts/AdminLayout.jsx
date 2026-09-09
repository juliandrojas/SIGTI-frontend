import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession } from '../utils/auth';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const misEnlaces = [
    { text: "Inicio", href: "/" },
    { text: "Registrar componente", href: "/admin/register" },
    { text: "Roles", href: "/admin/roles" },
    { text: "Inventario", href: "/admin/inventory" },
    { text: "Préstamos", href: "/admin/loans" },
  ];
  return (
    <>
        <Navbar brand="PETRO-SIGTI" links={misEnlaces} onLogout={handleLogout} />
        <Outlet />
    </>
  )
}
