import React from "react";
import { BiInfoCircle, BiCog } from "react-icons/bi"; // Importamos los iconos

const NavBar = ({ toggleHelpModal }) => {
  const handleSettingsClick = () => {
    console.log("Ajustes");
  };

  return (
    <nav className="d-flex justify-content-between align-items-center p-1 text-white">
      {/* Botón de Información */}
      <button className="btn btn-outline-light" onClick={toggleHelpModal}>
        <BiInfoCircle size={18} />
      </button>

      {/* Título o Logo */}
      <div className="text-center">
        <img
          src="/logo.PNG"
          alt="Tetris"
          style={{ maxWidth: "100px" }}
          className="img-fluid"
        />
      </div>

      {/* Botón de Ajustes */}
      <button className="btn btn-outline-light" onClick={handleSettingsClick}>
        <BiCog size={18} />
      </button>
    </nav>
  );
};

export default NavBar;
