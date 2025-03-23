import React from "react";

const HelpModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Controles de Juego</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h6 className="fw-bold">Teclado:</h6>
            <div className="row">
              <div className="col-6">
                <p className="mb-1"><span className="fw-bold">←/→:</span> Mover izquierda/derecha</p>
                <p className="mb-1"><span className="fw-bold">↑:</span> Rotar pieza</p>
                <p className="mb-1"><span className="fw-bold">↓:</span> Bajar más rápido</p>
              </div>
              <div className="col-6">
                <p className="mb-1"><span className="fw-bold">Espacio:</span> Soltar hasta abajo</p>
                <p className="mb-1"><span className="fw-bold">C:</span> Guardar pieza (Hold)</p>
                <p className="mb-1"><span className="fw-bold">P:</span> Pausar juego</p>
              </div>
            </div>
            
            <hr />
            
            <h6 className="fw-bold mt-3">Puntuación:</h6>
            <div className="row">
              <div className="col-12">
                <p className="mb-1"><span className="fw-bold">1 línea:</span> 40 × nivel</p>
                <p className="mb-1"><span className="fw-bold">2 líneas:</span> 100 × nivel</p>
                <p className="mb-1"><span className="fw-bold">3 líneas:</span> 300 × nivel</p>
                <p className="mb-1"><span className="fw-bold">4 líneas:</span> 1200 × nivel</p>
              </div>
            </div>
            
            <hr />
            
            <h6 className="fw-bold mt-3">Consejos:</h6>
            <ul>
              <li>Mantén el tablero lo más bajo posible</li>
              <li>Usa la función "Hold" para guardar piezas estratégicas</li>
              <li>Planifica con anticipación mirando la pieza siguiente</li>
              <li>Crea espacios para las piezas I (largas) para tetris completos</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;