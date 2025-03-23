import React, { useState } from "react";
import { BiCog } from "react-icons/bi"; // Importamos los iconos
import { BiInfoCircle } from "react-icons/bi";

const NavBar = ({ toggleHelpModal, handleResetHighScore }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSettingsClick = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  return (
    <nav className="d-flex justify-content-between align-items-center p-1 text-white">
      {/* Botón de Ayuda */}
      <button onClick={toggleHelpModal} className="btn btn-outline-light">
        <BiInfoCircle size={18} />
      </button>

      {/* Título o Logo */}
      <div className="text-center">
        <img
          src="/logo.PNG"
          alt="Tetris"
          style={{ maxWidth: "75px" }}
          className="img-fluid"
        />
      </div>

      {/* Botón de Ajustes */}
      <button className="btn btn-outline-light" onClick={handleSettingsClick}>
        <BiCog size={18} />
      </button>

      {/* Modal de Ajustes */}
      {showSettingsModal && (
        <div
          className="modal"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ajustes</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleSettingsClick}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <button
                  onClick={() => {
                    handleResetHighScore();
                    setShowSettingsModal(false);
                  }}
                  className="btn btn-outline-warning w-100 py-1 fs-6"
                >
                  Reiniciar Récord
                </button>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSettingsClick}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
