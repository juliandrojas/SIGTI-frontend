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
      { text: "Inventario", href: "/sistemas/inventory", icon: "bi-boxes" },
      { text: "Préstamos", href: "/sistemas/loans", icon: "bi-arrow-left-right" },
      { text: "Solicitudes", href: "/sistemas/requests", icon: "bi-clipboard-check" },
      { text: "Mantenimiento", href: "/sistemas/maintenance", icon: "bi-tools" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
