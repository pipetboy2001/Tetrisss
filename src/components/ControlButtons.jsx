const ControlButtons = ({ handleStartButton, gameOver, paused, handleResetHighScore, }) => (
  <>
    {/* Botón de iniciar/pausar/reanudar */}
    <div className="row m-2">
      <div className="col-12">
        <button
          onClick={handleStartButton}
          className="btn btn-primary w-100 py-2 fs-6 fs-md-5"
        >
          {gameOver ? "Iniciar Juego" : paused ? "Reanudar" : "Pausar"}
        </button>
      </div>
    </div>

    {/* Botón para reiniciar récord */}
    <div className="row m-2">
      <div className="col-12">
        <button
          onClick={handleResetHighScore}
          className="btn btn-outline-warning w-100 py-1 fs-6 fs-md-5"
        >
          Reiniciar Récord
        </button>
      </div>
    </div>
  </>
);

export default ControlButtons;
