// Crear una matriz con dimensiones específicas
export const createMatrix = (w, h) => {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  };
  
// Fusionar la pieza del jugador con el tablero
export const merge = (board, player) => {
  const newBoard = [...board];
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        newBoard[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
  return newBoard;
};
