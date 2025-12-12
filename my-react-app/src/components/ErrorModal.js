import React from "react";
import "./ErrorModal.css";

function ErrorModal({ open, title = "Error", message, onClose }) {
  if (!open) return null;

  const handleReload = () => {
    // full page reload
    window.location.reload();
  };

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-header">
          <h3>{title}</h3>
          <button
            className="error-modal-x"
            onClick={onClose}
            aria-label="close"
          >
            ✖
          </button>
        </div>

        <div className="error-modal-body">
          <p>{message || "Something went wrong. Please reload the page."}</p>
        </div>

        <div className="error-modal-actions">
          <button className="error-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="error-btn-reload" onClick={handleReload}>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
