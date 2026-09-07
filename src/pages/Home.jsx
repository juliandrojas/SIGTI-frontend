import Navbar from "../components/Navbar";

export default function Home() {
  const misEnlaces = [
    { text: 'Tickets', href: '#tickets', active: true },
    { text: 'Usuarios', href: '#usuarios' },
    { text: 'Roles', href: '#roles' },
    { text: 'Ingresar', href: '/login' },
  ];
  return (
    <>
        <Navbar brand="PETRO-SIGTI" links={misEnlaces} />
        <h1 className="text-center">Estadísticas</h1>
    </>
  )
}
