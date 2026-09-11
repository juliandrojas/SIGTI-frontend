import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession } from '../utils/auth';

export default function UsuarioLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const getLinksForRole = () => {
    return [
      { text: "Solicitud de Préstamo", href: "/usuario/loans", icon: "bi-arrow-left-right" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
