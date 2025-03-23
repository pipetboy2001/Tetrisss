import React from "react";
import {
  FaTrophy,
  FaLayerGroup,
  FaArrowCircleDown,
  FaChartLine,
  FaClock,
} from "react-icons/fa";

const ScorePanel = ({
  score,
  level,
  lines,
  gameTime,
  highScore,
  newRecord,
}) => {
  const linesToNextLevel = 10 - (lines % 10);

  const convertToMinutes = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  console.log("ScorePanel render");
  console.log('newRecord', newRecord);

  return (
    <div
      className="card border-light shadow-sm mx-auto"
      style={{ maxWidth: "40%" }}
    >
      <div className="text-center">
        <h5 className="card-title mb-0 fs-6">Datos</h5>
      </div>

      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          <ScoreItem
            icon={<FaTrophy className="text-warning me-2" />}
            label="Puntos"
            value={score}
            stacked
          />
          <ScoreItem
            icon={<FaLayerGroup className="text-primary me-2" />}
            label="Nivel"
            value={level}
            stacked
          />
          <ScoreItem
            icon={<FaChartLine className="text-success me-2" />}
            label="Líneas"
            value={lines}
            stacked
          />

          <ScoreItem
            icon={<FaArrowCircleDown className="text-info me-2" />}
            label="Faltan"
            value={`${linesToNextLevel} líneas`}
            stacked
          />

          <ScoreItem
            icon={<FaClock className="text-danger me-2" />}
            label="Tiempo"
            value={convertToMinutes(gameTime)}
            stacked
          />

          <ScoreItem
            icon={<FaTrophy className="text-warning me-2" />}
            label="Record"
            value={highScore}
            stacked
          />
          {newRecord && (
            <span
              className="ms-1 badge bg-success p-1"
              style={{ fontSize: "0.65rem" }}
            >
              ¡Nuevo!
            </span>
          )}
        </ul>
      </div>
    </div>
  );
};

const ScoreItem = ({ icon, label, value, stacked }) => {
  return (
    <li className=" d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        {icon}
        {stacked ? (
          <div className="d-flex flex-column">
            <small className="fw-medium">{label}</small>
            <span className="fw-bold small">{value}</span>
          </div>
        ) : (
          <small className="fw-medium">{label}</small>
        )}
      </div>
      {!stacked && <span className="fw-bold small">{value}</span>}
    </li>
  );
};

export default ScorePanel;
