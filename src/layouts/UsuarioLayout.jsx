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
      { text: "Hacer una solicitud", href: "/usuario/requests", icon: "bi-send-plus", button: true },
      { text: "Mis solicitudes", href: "/usuario/requests/history", icon: "bi-list-check" },
    ];
  };

  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={getLinksForRole()} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
