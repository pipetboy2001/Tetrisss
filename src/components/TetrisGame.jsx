import React, { useState, useEffect, useRef, useCallback } from 'react';
import {BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, COLORS, PIECES} from './../constants/pieces';
import {createMatrix, merge} from './../service/boardService';
import {createPiece, collide, rotate} from './../service/pieceService';
import {drawMatrix} from './../helpers/renderHelpers';
import ScorePanel from './ScorePanel';
import PiecePanels from './PiecePanels';
import HelpModal from './HelpModal';
import ControlButtons from './ControlButtons';
import NavBar from './NavBar';
import TactileButtons from './TactileButtons';

const TetrisGame = () => {

  const tetrisRef = useRef(null);
  const nextPieceRef = useRef(null);
  const holdPieceRef = useRef(null); // Referencia para el canvas de la pieza guardada
  const requestRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dropInterval, setDropInterval] = useState(1000);
  const [newRecord, setNewRecord] = useState(false);
  const [holdUsed, setHoldUsed] = useState(false); // Estado para controlar si ya se usó hold en esta pieza

  // Añadir este estado para controlar la visibilidad del modal
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [gameTime, setGameTime] = useState(0);
  const [gameTimeInterval, setGameTimeInterval] = useState(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Función para abrir/cerrar el modal
  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };
  
  // Estado del juego
  const [board, setBoard] = useState(() => createMatrix(BOARD_WIDTH, BOARD_HEIGHT));
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    matrix: null,
    nextPiece: null,
    holdPiece: null  // Añadido para guardar la pieza en hold
  });
  
  // Cargar récord del localStorage al inicio
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Controlar el temporizador de juego
    useEffect(() => {
      if (!gameOver && !paused) {
        const interval = setInterval(() => {
          setGameTime(prevTime => prevTime + 1);
        }, 1000);
        setGameTimeInterval(interval);
        return () => clearInterval(interval);
      } else if (gameTimeInterval) {
        clearInterval(gameTimeInterval);
      }
    }, [gameOver, paused]);
    
    // Formatear tiempo de juego
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
  
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
    setNewRecord(false);
    setGameTime(0);
    setHoldUsed(false); // Reiniciar el estado de hold al iniciar un nuevo juego
    setPlayer(prev => ({
      ...prev,
      nextPiece,
      holdPiece: null // Reiniciar la pieza guardada
    }));
    
    resetPlayer(newBoard, nextPiece);
    
  }, []);
  
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
      nextPiece: newNextPiece,
      holdPiece: player.holdPiece // Mantener la pieza guardada
    };
    
    setPlayer(newPlayer);
    
    // Comprobar si la posición inicial es inválida (juego terminado)
    if (collide(currentBoard, newPlayer)) {
      setGameOver(true);
      
      // Comprobar si se ha batido el récord cuando termina el juego
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('tetrisHighScore', score.toString());
        setNewRecord(true);
      }
    }
    
    drawNextPiece(newNextPiece);
    if (newPlayer.holdPiece) {
      drawHoldPiece(newPlayer.holdPiece);
    }
    
    // Restablecer el estado de hold con cada nueva pieza
    setHoldUsed(false);
  }, [collide, highScore, score, player.holdPiece]);
  
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
      
      // Comprobar si se ha batido el récord durante el juego
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('tetrisHighScore', newScore.toString());
        setNewRecord(true);
      }
      
      // Actualizar nivel
      const newLevel = Math.floor(newLines / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setDropInterval(Math.max(100, 1000 - (newLevel - 1) * 50));
      }
    }
  }, [board, level, score, lines, highScore]);
  
  // Función para guardar pieza (hold)
  const holdPiece = useCallback(() => {
    // Si ya se usó hold para esta pieza, ignorar
    if (holdUsed || gameOver || paused) return;
    
    const newPlayer = { ...player };
    
    if (newPlayer.holdPiece === null) {
      // Si no hay pieza guardada, guardar la actual y obtener la siguiente
      newPlayer.holdPiece = newPlayer.matrix;
      newPlayer.matrix = newPlayer.nextPiece;
      newPlayer.nextPiece = createPiece();
      
      // Reiniciar posición
      newPlayer.pos = {
        y: 0,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPlayer.matrix[0].length / 2)
      };
      
      drawNextPiece(newPlayer.nextPiece);
    } else {
      // Si ya hay una pieza guardada, intercambiar
      const temp = newPlayer.holdPiece;
      newPlayer.holdPiece = newPlayer.matrix;
      newPlayer.matrix = temp;
      
      // Reiniciar posición
      newPlayer.pos = {
        y: 0,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPlayer.matrix[0].length / 2)
      };
    }
    
    // Dibujar pieza guardada
    drawHoldPiece(newPlayer.holdPiece);
    
    // Marcar que se ha usado hold para esta pieza
    setHoldUsed(true);
    
    setPlayer(newPlayer);
  }, [player, holdUsed, gameOver, paused]);
  
  // Dibujar la pieza guardada
  const drawHoldPiece = useCallback((holdPiece) => {
    if (!holdPieceRef.current) return;
    
    const holdPieceCtx = holdPieceRef.current.getContext('2d');
    const canvas = holdPieceRef.current;
    holdPieceCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const xOffset = (canvas.width - holdPiece[0].length * BLOCK_SIZE) / 2;
    const yOffset = (canvas.height - holdPiece.length * BLOCK_SIZE) / 2;
    
    holdPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          holdPieceCtx.fillStyle = COLORS[value];
          holdPieceCtx.fillRect(
            xOffset + x * BLOCK_SIZE,
            yOffset + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
          holdPieceCtx.strokeStyle = 'black';
          holdPieceCtx.strokeRect(
            xOffset + x * BLOCK_SIZE,
            yOffset + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }, []);
  
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
  }, []);
  
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
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', tetrisRef.current.width / 2, tetrisRef.current.height / 2);
      
      // Mostrar mensaje de nuevo récord si corresponde
      if (newRecord) {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('¡NUEVO RÉCORD!', tetrisRef.current.width / 2, tetrisRef.current.height / 2 + 30);
      }
      // Mostrar puntuación final
      ctx.font = '18px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Puntuación: ${score}`, tetrisRef.current.width / 2, tetrisRef.current.height / 2 + 60);
  }
    
    // Dibujar "Pausa" si es necesario
    if (paused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, tetrisRef.current.width, tetrisRef.current.height);
      
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', tetrisRef.current.width / 2, tetrisRef.current.height / 2);
    }
  }, [board, gameOver, paused, player, newRecord, score]);
  
  // Mover la pieza del jugador
  const playerMove = useCallback((dir) => {
    const newPos = { ...player.pos, x: player.pos.x + dir };
    const newPlayer = { ...player, pos: newPos };
    
    if (!collide(board, newPlayer)) {
      setPlayer(newPlayer);
    }
  }, [player, board]);
  
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
  }, [player, board]);
  
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
  }, [player, board, clearLines, resetPlayer]);
  
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
  }, [player, board, clearLines, resetPlayer]);
  
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
  }, [windowSize]);
  
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
        case 'p':
          event.preventDefault();
          setPaused(!paused);
          break;
        case ' ':
          event.preventDefault();
          playerDropToBottom();
          break;
        case 'c':
        case 'C':
          event.preventDefault();
          holdPiece();
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
  }, [handleResize, playerMove, playerDrop, playerRotate, playerDropToBottom, holdPiece, update, gameOver, paused]);
  
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
        nextPiece: nextPiece,
        holdPiece: null
      });
      
      if (nextPieceRef.current) {
        drawNextPiece(nextPiece);
      }
    }
  }, [player, drawNextPiece]);
  
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
  
  // Función para reiniciar el récord
  const handleResetHighScore = () => {
    localStorage.removeItem('tetrisHighScore');
    setHighScore(0);
    setNewRecord(false);
  };

  return (
    <div
      className="container-fluidd-flex flex-column justify-content-center align-items-center "
      style={{
        textAlign: "left",
        backgroundImage:
          "linear-gradient(to bottom, rgb(5, 50, 123), rgb(64, 80, 95))",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NavBar 
      toggleHelpModal={toggleHelpModal} 
      handleResetHighScore={handleResetHighScore}
    />
    {/* Añadir el modal de ayuda aquí */}
    <HelpModal 
      show={showHelpModal} 
      onClose={toggleHelpModal} 
    />


      <div className="container">
        <div className="row justify-content-center">
          <div className="col-8">
            

            <div className="row justify-content-center flex-nowrap">
              {/* Panel de puntuación */}
              < ScorePanel
                score = {score}
                highScore = {highScore}
                level = {level}
                lines = {lines}
                linesToNextLevel = {10 - (lines % 10)}
                gameTime = {gameTime}
                />
            
              

              {/* Tablero de juego */}
              <div className="col-8 d-flex justify-content-center">
                <canvas
                  ref={tetrisRef}
                  className="border border-dark"
                  style={{
                    backgroundColor: "#111",
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio: "1/2",
                  }}
                ></canvas>
              </div>

                <PiecePanels
                  holdPieceRef={holdPieceRef}
                  nextPieceRef={nextPieceRef}
                />
              
            </div>
              
            {/* Controles de juego */}
            <ControlButtons
              handleStartButton={handleStartButton}
              gameOver={gameOver}
              paused={paused}
              
            />
            
            {/* Controles táctiles - solo visibles en móvil */}
            <TactileButtons
              playerMove={playerMove}
              playerRotate={playerRotate}
              playerDrop={playerDrop}
              playerDropToBottom={playerDropToBottom}
              holdPiece={holdPiece}
              setupButtonTouch={setupButtonTouch}
            />

            

          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;