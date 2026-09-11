import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  const misEnlaces = [{ text: "Iniciar sesión", href: "/login", icon: "bi-box-arrow-in-right" }];
  return (
    <>
      <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
      <Outlet />
    </>
  )
}
