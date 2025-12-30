export interface Position {
  row: number;
  col: number;
}

export interface Tile {
  id: number;
  value: number;
  position: Position;
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export interface GameState {
  board: (Tile | null)[][];
  score: number;
  gameOver: boolean;
  won: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface TileColor {
  bg: string;
  text: string;
}