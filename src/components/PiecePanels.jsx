const PiecePanels = ({ holdPieceRef, nextPieceRef }) => {
  return (
    <div className="card border-light mx-auto" style={{ maxWidth: "40%" }}>
      {/* Panel de siguiente pieza */}
      <div className="card-body p-2 p-md-3 text-center">
        <h5 className="card-title mb-0 fs-6 text-nowrap">Próx.</h5>
        <div className="d-flex justify-content-center align-items-center mt-2">
          <canvas
            ref={nextPieceRef}
            width={80}
            height={80}
            className="border border-dark"
            style={{ maxWidth: "100%", height: "auto" }}
          ></canvas>
        </div>
      </div>
            
      {/* Panel de hold */}
      <div className="card-body p-2 p-md-3 text-center">
        <h5 className="card-title mb-0 fs-6 text-nowrap">Guarda</h5>
        <div className="d-flex justify-content-center align-items-center mt-2">
          <canvas
            ref={holdPieceRef}
            width={80}
            height={80}
            className="border border-dark"
            style={{ maxWidth: "100%", height: "auto" }}
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default PiecePanels;
