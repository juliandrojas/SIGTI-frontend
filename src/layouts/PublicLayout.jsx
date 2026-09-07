import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  const misEnlaces = [{ text: "Login", href: "/login" }];
  return (
    <>
    <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
    <h1 className="text-center">Public Layout</h1>
    <Outlet />
    </>
  )
}
