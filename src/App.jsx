import React, { useState, useEffect, useRef, useCallback } from 'react';
import {BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, COLORS, PIECES} from './constants/pieces';
const TetrisGame = () => {

  const tetrisRef = useRef(null);
  const nextPieceRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dropInterval, setDropInterval] = useState(1000);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Estado del juego
  const [board, setBoard] = useState(() => createMatrix(BOARD_WIDTH, BOARD_HEIGHT));
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    matrix: null,
    nextPiece: null
  });
  
  // Crear una matriz con dimensiones específicas
  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }
  
  // Crear una pieza aleatoria
  const createPiece = useCallback(() => {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
  }, [PIECES]);
  
  // Comprobar si hay colisión
  const collide = useCallback((board, player) => {
    const matrix = player.matrix;
    const pos = player.pos;
    
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] !== 0 &&
            (board[y + pos.y] === undefined ||
             board[y + pos.y][x + pos.x] === undefined ||
             board[y + pos.y][x + pos.x] !== 0)) {
          return true;
        }
      }
    }
    
    return false;
  }, []);
  
  // Fusionar la pieza del jugador con el tablero
  const merge = useCallback((board, player) => {
    const newBoard = [...board];
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
    return newBoard;
  }, []);
  
  // Inicializar el juego
  const initGame = useCallback(() => {
    const newBoard = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
    const nextPiece = createPiece();
    
    setBoard(newBoard);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setDropInterval(1000);
    setPlayer(prev => ({
      ...prev,
      nextPiece
    }));
    
    resetPlayer(newBoard, nextPiece);
    
  }, [createPiece]);
  
  // Reiniciar posición del jugador
  const resetPlayer = useCallback((currentBoard, nextPiece) => {
    const matrix = nextPiece;
    const newNextPiece = createPiece();
    
    const newPlayer = {
      pos: {
        y: 0,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(matrix[0].length / 2)
      },
      matrix: matrix,
      nextPiece: newNextPiece
    };
    
    setPlayer(newPlayer);
    
    // Comprobar si la posición inicial es inválida (juego terminado)
    if (collide(currentBoard, newPlayer)) {
      setGameOver(true);
    }
    
    drawNextPiece(newNextPiece);
  }, [createPiece, collide]);
  
  // Limpiar filas completas
  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = [...board];
    
    outer: for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (newBoard[y][x] === 0) {
          continue outer;
        }
      }
      
      // Eliminar la fila completa
      const row = newBoard.splice(y, 1)[0].fill(0);
      newBoard.unshift(row);
      y++;
      linesCleared++;
    }
    
    if (linesCleared > 0) {
      // Actualizar puntuación según las líneas eliminadas
      const lineScores = [40, 100, 300, 1200];
      const newScore = score + lineScores[linesCleared - 1] * level;
      const newLines = lines + linesCleared;
      
      setScore(newScore);
      setLines(newLines);
      setBoard(newBoard);
      
      // Actualizar nivel
      const newLevel = Math.floor(newLines / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setDropInterval(Math.max(100, 1000 - (newLevel - 1) * 50));
      }
    }
  }, [board, level, score, lines]);
  
  // Dibujar la matriz (pieza o tablero)
  const drawMatrix = useCallback((ctx, matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = 'black';
          ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }, [BLOCK_SIZE, COLORS]);
  
  // Dibujar la siguiente pieza
  const drawNextPiece = useCallback((nextPiece) => {
    if (!nextPieceRef.current) return;
    
    const nextPieceCtx = nextPieceRef.current.getContext('2d');
    const canvas = nextPieceRef.current;
    nextPieceCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const xOffset = (canvas.width - nextPiece[0].length * BLOCK_SIZE) / 2;
    const yOffset = (canvas.height - nextPiece.length * BLOCK_SIZE) / 2;
    
    nextPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextPieceCtx.fillStyle = COLORS[value];
          nextPieceCtx.fillRect(
            xOffset + x * BLOCK_SIZE,
            yOffset + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
          nextPieceCtx.strokeStyle = 'black';
          nextPieceCtx.strokeRect(
            xOffset + x * BLOCK_SIZE,
            yOffset + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }, [BLOCK_SIZE, COLORS]);
  
  // Dibujar el juego
  const draw = useCallback(() => {
    if (!tetrisRef.current) return;
    
    const ctx = tetrisRef.current.getContext('2d');
    ctx.clearRect(0, 0, tetrisRef.current.width, tetrisRef.current.height);
    
    // Dibujar tablero
    drawMatrix(ctx, board, {x: 0, y: 0});
    
    // Dibujar pieza actual
    if (!gameOver && player.matrix) {
      drawMatrix(ctx, player.matrix, player.pos);
    }
    
    // Dibujar "Game Over" si es necesario
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, tetrisRef.current.width, tetrisRef.current.height);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', tetrisRef.current.width / 2, tetrisRef.current.height / 2);
    }
    
    // Dibujar "Pausa" si es necesario
    if (paused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, tetrisRef.current.width, tetrisRef.current.height);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', tetrisRef.current.width / 2, tetrisRef.current.height / 2);
    }
  }, [board, drawMatrix, gameOver, paused, player]);
  
  // Mover la pieza del jugador
  const playerMove = useCallback((dir) => {
    const newPos = { ...player.pos, x: player.pos.x + dir };
    const newPlayer = { ...player, pos: newPos };
    
    if (!collide(board, newPlayer)) {
      setPlayer(newPlayer);
    }
  }, [player, board, collide]);
  
  // Rotar matriz
  const rotate = useCallback((matrix) => {
    const newMatrix = matrix.map((_, i) => matrix.map(col => col[i]));
    // Invertir filas
    return newMatrix.map(row => [...row].reverse());
  }, []);
  
  // Rotar la pieza del jugador
  const playerRotate = useCallback(() => {
    const pos = player.pos.x;
    let offset = 1;
    const newPlayer = { ...player };
    newPlayer.matrix = rotate(newPlayer.matrix);
    
    // Gestionar colisiones después de la rotación
    while (collide(board, newPlayer)) {
      newPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      
      // Si el desplazamiento es demasiado grande, deshacer la rotación
      if (offset > newPlayer.matrix[0].length) {
        newPlayer.matrix = rotate(rotate(rotate(newPlayer.matrix)));
        newPlayer.pos.x = pos;
        break;
      }
    }
    
    setPlayer(newPlayer);
  }, [player, board, collide, rotate]);
  
  // Mover la pieza hacia abajo
  const playerDrop = useCallback(() => {
    const newPos = { ...player.pos, y: player.pos.y + 1 };
    const newPlayer = { ...player, pos: newPos };
    
    if (!collide(board, newPlayer)) {
      setPlayer(newPlayer);
    } else {
      // Si hay colisión, fusionar la pieza con el tablero
      const newBoard = merge(board, player);
      setBoard(newBoard);
      
      // Limpiar líneas completas y reiniciar el jugador
      resetPlayer(newBoard, player.nextPiece);
      clearLines();
    }
    
    dropCounterRef.current = 0;
  }, [player, board, collide, merge, resetPlayer, clearLines]);
  
  // Caída rápida
  const playerDropToBottom = useCallback(() => {
    let newPos = { ...player.pos };
    
    while (!collide(board, { ...player, pos: { ...newPos, y: newPos.y + 1 } })) {
      newPos.y++;
    }
    
    const newPlayer = { ...player, pos: newPos };
    setPlayer(newPlayer);
    
    // Fusionar la pieza con el tablero
    const newBoard = merge(board, newPlayer);
    setBoard(newBoard);
    
    // Limpiar líneas completas y reiniciar el jugador
    resetPlayer(newBoard, player.nextPiece);
    clearLines();
    
    dropCounterRef.current = 0;
  }, [player, board, collide, merge, resetPlayer, clearLines]);
  
  // Actualizar el juego
  const update = useCallback((time = 0) => {
    if (!gameOver && !paused) {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      dropCounterRef.current += deltaTime;
      if (dropCounterRef.current > dropInterval) {
        playerDrop();
      }
    }
    
    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameOver, paused, dropInterval, playerDrop, draw]);
  
  // Función para manejar el redimensionamiento de la ventana
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);
  
  // Control del tamaño de canvas basado en el tamaño de la ventana
  useEffect(() => {
    if (tetrisRef.current) {
      const isMobile = windowSize.width < 768;
      const headerHeight = isMobile ? 200 : 150; // Espacio para puntuación y controles
      const maxHeight = windowSize.height - headerHeight;
      const blockScale = Math.min(
        Math.floor(maxHeight / BOARD_HEIGHT),
        Math.floor((windowSize.width * 0.8) / BOARD_WIDTH)
      );
      
      const canvasWidth = BOARD_WIDTH * blockScale;
      const canvasHeight = BOARD_HEIGHT * blockScale;
      
      tetrisRef.current.width = canvasWidth;
      tetrisRef.current.height = canvasHeight;
      
      // Ajustar el tamaño de bloque
      const ctx = tetrisRef.current.getContext('2d');
      ctx.scale(blockScale / BLOCK_SIZE, blockScale / BLOCK_SIZE);
    }
  }, [windowSize, BOARD_WIDTH, BOARD_HEIGHT]);
  
  // Configurar event listeners y iniciar el juego
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Eventos del teclado
    const handleKeyDown = (event) => {
      if (gameOver || paused) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          playerMove(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          playerMove(1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          playerDrop();
          break;
        case 'ArrowUp':
          event.preventDefault();
          playerRotate();
          break;
        case ' ':
          event.preventDefault();
          playerDropToBottom();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Iniciar bucle de animación
    requestRef.current = requestAnimationFrame(update);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(requestRef.current);
    };
  }, [handleResize, playerMove, playerDrop, playerRotate, playerDropToBottom, update, gameOver, paused]);
  
  // Iniciar juego
  useEffect(() => {
    if (player.matrix === null && player.nextPiece === null) {
      const nextPiece = createPiece();
      const initialMatrix = createPiece();
      
      setPlayer({
        pos: {
          y: 0,
          x: Math.floor(BOARD_WIDTH / 2) - Math.floor(initialMatrix[0].length / 2)
        },
        matrix: initialMatrix,
        nextPiece: nextPiece
      });
      
      if (nextPieceRef.current) {
        drawNextPiece(nextPiece);
      }
    }
  }, [player, createPiece, drawNextPiece]);
  
  // Configurar botones táctiles
  const setupButtonTouch = (action) => {
    return {
      onTouchStart: (e) => {
        e.preventDefault();
        if (!gameOver && !paused) action();
      },
      onMouseDown: () => {
        if (!gameOver && !paused) action();
      }
    };
  };
  
  // Función para el botón de iniciar/reiniciar
  const handleStartButton = () => {
    if (gameOver) {
      initGame();
    } else {
      setPaused(!paused);
      if (paused) {
        lastTimeRef.current = performance.now();
      }
    }
  };
  
  return (
    <div className="container-fluid min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <h1 className="text-center fw-bold mb-4">Tetris</h1>
            
            <div className="row mb-4">
              <div className="col-md-8 mb-3 mb-md-0">
                <div className="card border-dark h-100">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <h5 className="fw-bold">Puntuación:</h5>
                        <p className="fs-5">{score}</p>
                      </div>
                      <div className="col-4">
                        <h5 className="fw-bold">Nivel:</h5>
                        <p className="fs-5">{level}</p>
                      </div>
                      <div className="col-4">
                        <h5 className="fw-bold">Líneas:</h5>
                        <p className="fs-5">{lines}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-dark h-100">
                  <div className="card-body text-center">
                    <h5 className="fw-bold">Siguiente</h5>
                    <div className="d-flex justify-content-center">
                      <canvas ref={nextPieceRef} width={80} height={80}></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row justify-content-center mb-4">
              <div className="col-12 text-center">
                <canvas 
                  ref={tetrisRef} 
                  style={{ backgroundColor: '#111', maxWidth: '100%' }} 
                  className="border border-dark"
                ></canvas>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-12">
                <button 
                  onClick={handleStartButton}
                  className="btn btn-primary w-100 py-2 fs-5"
                >
                  {gameOver ? "Iniciar Juego" : (paused ? "Reanudar" : "Pausar")}
                </button>
              </div>
            </div>
            
            <div className="row d-md-none">
              <div className="col-12">
                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <button 
                      {...setupButtonTouch(() => playerMove(-1))}
                      className="btn btn-primary w-100 py-2 fs-5"
                    >
                      ←
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      {...setupButtonTouch(() => playerRotate())}
                      className="btn btn-primary w-100 py-2 fs-5"
                    >
                      Rotar
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      {...setupButtonTouch(() => playerMove(1))}
                      className="btn btn-primary w-100 py-2 fs-5"
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-8">
                    <button 
                      {...setupButtonTouch(() => playerDrop())}
                      className="btn btn-primary w-100 py-2 fs-5"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      {...setupButtonTouch(() => playerDropToBottom())}
                      className="btn btn-primary w-100 py-2 fs-5"
                    >
                      ⤓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TetrisGame;