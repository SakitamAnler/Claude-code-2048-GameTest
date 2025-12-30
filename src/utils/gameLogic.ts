import { GameState, Tile, Direction, Position } from '../types/game';
import { GRID_SIZE, WIN_VALUE } from './constants';

let tileIdCounter = 0;

const generateId = (): number => {
  return tileIdCounter++;
};

export const createTile = (value: number, position: Position): Tile => {
  return {
    id: generateId(),
    value,
    position,
    isNew: true,
  };
};

export const initializeBoard = (): (Tile | null)[][] => {
  const board: (Tile | null)[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = null;
    }
  }
  return board;
};

export const addRandomTile = (board: (Tile | null)[][]): (Tile | null)[][] => {
  const emptyCells: Position[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === null) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return board;

  const randomPosition = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map(row => [...row]);
  newBoard[randomPosition.row][randomPosition.col] = createTile(value, randomPosition);

  return newBoard;
};

export const initializeGame = (): GameState => {
  tileIdCounter = 0;

  let board = initializeBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);

  return {
    board,
    score: 0,
    gameOver: false,
    won: false,
  };
};

// 向左移动并合并一行
const moveAndMergeRow = (row: (Tile | null)[]): { newRow: (Tile | null)[]; score: number } => {
  // 1. 移除所有null,向左靠拢
  const tiles = row.filter(tile => tile !== null);

  // 2. 合并相同的相邻方块
  const merged: (Tile | null)[] = [];
  let score = 0;
  let i = 0;

  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i]!.value === tiles[i + 1]!.value) {
      // 合并两个相同的方块
      const newValue = tiles[i]!.value * 2;
      const mergedTile: Tile = {
        id: generateId(),
        value: newValue,
        position: tiles[i]!.position,
        mergedFrom: [tiles[i]!, tiles[i + 1]!],
        isNew: false,
      };
      merged.push(mergedTile);
      score += newValue;
      i += 2;
    } else {
      // 不合并,保持原样
      merged.push({
        ...tiles[i]!,
        mergedFrom: undefined,
        isNew: false,
      });
      i += 1;
    }
  }

  // 3. 用null填充到长度为4
  while (merged.length < GRID_SIZE) {
    merged.push(null);
  }

  return { newRow: merged, score };
};

const updateTilePositions = (board: (Tile | null)[][]): (Tile | null)[][] => {
  return board.map((row, rowIndex) =>
    row.map((tile, colIndex) => {
      if (tile === null) return null;
      return {
        ...tile,
        position: { row: rowIndex, col: colIndex },
      };
    })
  );
};

// 旋转棋盘90度(顺时针)
const rotateBoard = (board: (Tile | null)[][]): (Tile | null)[][] => {
  const newBoard: (Tile | null)[][] = initializeBoard();

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newBoard[col][GRID_SIZE - 1 - row] = board[row][col];
    }
  }

  return newBoard;
};

const move = (board: (Tile | null)[][], direction: Direction): { newBoard: (Tile | null)[][]; score: number } => {
  let workingBoard = board.map(row => [...row]);
  let rotations = 0;

  // 根据方向确定旋转次数
  switch (direction) {
    case 'left':
      rotations = 0;
      break;
    case 'right':
      rotations = 2;
      break;
    case 'up':
      rotations = 3;
      break;
    case 'down':
      rotations = 1;
      break;
  }

  // 旋转到正确的方向
  for (let i = 0; i < rotations; i++) {
    workingBoard = rotateBoard(workingBoard);
  }

  // 向左移动每一行
  let newBoard: (Tile | null)[][] = [];
  let totalScore = 0;

  for (let row = 0; row < GRID_SIZE; row++) {
    const { newRow, score } = moveAndMergeRow(workingBoard[row]);
    newBoard.push(newRow);
    totalScore += score;
  }

  // 旋转回原来的方向
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    newBoard = rotateBoard(newBoard);
  }

  // 更新所有方块的position
  newBoard = updateTilePositions(newBoard);

  return { newBoard, score: totalScore };
};

export const hasMovesAvailable = (board: (Tile | null)[][]): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === null) return true;
    }
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = board[row][col];
      if (current) {
        const right = board[row][col + 1];
        const down = board[row + 1]?.[col];

        if ((right && right.value === current.value) || (down && down.value === current.value)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const checkWin = (board: (Tile | null)[][]): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = board[row][col];
      if (tile && tile.value >= WIN_VALUE) {
        return true;
      }
    }
  }
  return false;
};

export const moveGame = (gameState: GameState, direction: Direction): GameState => {
  if (gameState.gameOver) return gameState;

  const { newBoard, score } = move(gameState.board, direction);

  // 检查棋盘是否改变
  const isBoardChanged = newBoard.some((row, rowIndex) =>
    row.some((tile, colIndex) => {
      const oldTile = gameState.board[rowIndex][colIndex];
      if (!tile && !oldTile) return false;
      if (!tile || !oldTile) return true;
      return tile.value !== oldTile.value || tile.id !== oldTile.id;
    })
  );

  if (!isBoardChanged) return gameState;

  let boardWithRandom = addRandomTile(newBoard);
  const won = checkWin(boardWithRandom);
  const gameOver = !hasMovesAvailable(boardWithRandom);

  return {
    board: boardWithRandom,
    score: gameState.score + score,
    gameOver,
    won,
  };
};
