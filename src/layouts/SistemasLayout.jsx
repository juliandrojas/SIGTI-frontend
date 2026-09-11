import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession } from '../utils/auth';

export default function SistemasLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const getLinksForRole = () => {
    return [
      { text: "Inicio", href: "/sistemas", icon: "bi-house" },
      { text: "Registrar componente", href: "/sistemas/register", icon: "bi-plus-square" },
      { text: "Inventario", href: "/sistemas/inventory", icon: "bi-boxes" },
      { text: "Préstamos", href: "/sistemas/loans", icon: "bi-arrow-left-right" },
      { text: "Roles", href: "/sistemas/roles", icon: "bi-shield-check" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
