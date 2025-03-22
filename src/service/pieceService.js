import { PIECES } from '../constants/pieces';

// Crear una pieza aleatoria
export const createPiece = () => {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
};

// Comprobar si hay colisión
export const collide = (board, player) => {
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
};

// Rotar matriz
export const rotate = (matrix) => {
  const newMatrix = matrix.map((_, i) => matrix.map(col => col[i]));
  // Invertir filas
  return newMatrix.map(row => [...row].reverse());
};

