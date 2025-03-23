import React from 'react';

const TactileButtons = ({ 
    playerMove, 
    playerRotate, 
    playerDrop, 
    playerDropToBottom, 
    holdPiece, 
    setupButtonTouch 
}) => {
    return (
        /* Controles táctiles - solo visibles en móvil */
        <div className="row d-md-none">
            <div className="col-12">
                <div className="row g-2 mb-2">
                    <div className="col-4">
                        <button
                            {...setupButtonTouch(() => playerMove(-1))}
                            className="btn btn-primary w-100 py-3 fs-4"
                            aria-label="Mover izquierda"
                        >
                            ←
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            {...setupButtonTouch(() => playerRotate())}
                            className="btn btn-primary w-100 py-3 fs-6"
                        >
                            Rotar
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            {...setupButtonTouch(() => playerMove(1))}
                            className="btn btn-primary w-100 py-3 fs-4"
                            aria-label="Mover derecha"
                        >
                            →
                        </button>
                    </div>
                </div>
                <div className="row g-2 mb-2">
                    <div className="col-8">
                        <button
                            {...setupButtonTouch(() => playerDrop())}
                            className="btn btn-primary w-100 py-3 fs-4"
                            aria-label="Bajar"
                        >
                            ↓
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            {...setupButtonTouch(() => playerDropToBottom())}
                            className="btn btn-primary w-100 py-3 fs-4"
                            aria-label="Soltar hasta abajo"
                        >
                            ⤓
                        </button>
                    </div>
                </div>
                <div className="row g-2">
                    <div className="col-12">
                        <button
                            {...setupButtonTouch(() => holdPiece())}
                            className="btn btn-info w-100 py-3 fs-6"
                            aria-label="Guardar pieza"
                        >
                            Hold
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TactileButtons;