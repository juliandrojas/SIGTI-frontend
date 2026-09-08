import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
  const misEnlaces = [{ text: "Roles", href: "/admin/roles" }];
  return (
    <>
    <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
        <Outlet />
    </>
  )
}
