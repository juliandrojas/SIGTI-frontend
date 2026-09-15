export default function FeedbackModal({ message, error, onClose }) {
  const text = message || error;
  if (!text) return null;
  const successful = Boolean(message);

  return <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" style={{ background: "rgba(15, 23, 42, .45)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content admin-action-modal">
        <div className="modal-header">
          <h2 className="modal-title h5" id="feedback-modal-title">{successful ? "Operación completada" : "No se pudo completar la operación"}</h2>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
        </div>
        <div className="modal-body"><p className="mb-0">{text}</p></div>
        <div className="modal-footer"><button type="button" className={`btn ${successful ? "btn-success" : "btn-primary"}`} onClick={onClose}>Entendido</button></div>
      </div>
    </div>
  </div>;
}
