import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession, getStoredUser } from '../utils/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const misEnlaces = [{ text: "Roles", href: "/admin/roles" }];
  return (
    <>
    <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
        <div className="container d-flex justify-content-between align-items-center py-3">
          <span className="text-muted small">{user?.username}</span>
          <button type="button" onClick={handleLogout} className="btn btn-outline-secondary btn-sm">
            Cerrar sesión
          </button>
        </div>
        <Outlet />
    </>
  )
}
