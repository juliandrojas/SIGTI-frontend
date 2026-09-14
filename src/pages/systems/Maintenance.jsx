export default function Maintenance() {
  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5 text-center">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3" style={{ width: "56px", height: "56px" }}>
            <i className="bi bi-tools fs-4" aria-hidden="true" />
          </span>
          <p className="text-primary text-uppercase small fw-semibold mb-2">Área de Sistemas</p>
          <h1 className="h3 fw-bold">Mantenimiento</h1>
          <p className="text-secondary mb-0">Esta sección está lista para las herramientas y procesos de mantenimiento.</p>
        </div>
      </div>
    </div>
  );
}
