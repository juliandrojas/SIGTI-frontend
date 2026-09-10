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
      { text: "Inicio", href: "/sistemas/" },
      { text: "Registrar componente", href: "/sistemas/register" },
      { text: "Inventario", href: "/sistemas/inventory" },
      { text: "Historial de Préstamos", href: "/sistemas/loans" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
