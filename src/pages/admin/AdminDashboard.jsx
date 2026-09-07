import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const handlePress = () => {
    console.log("Cerrando sesión");
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Link to="/" onClick={handlePress} className="btn btn-primary">
        Cerrar sesión
      </Link>
    </div>
  );
}
