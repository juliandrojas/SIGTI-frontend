import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
  const misEnlaces = [{ text: "Login", href: "/login" },
    
  ];
  return (
    <>
    <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
        <h1 className="text-center">Admin Layout</h1>
        <Outlet />
    </>
  )
}
