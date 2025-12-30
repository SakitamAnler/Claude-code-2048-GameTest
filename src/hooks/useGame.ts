import { useState, useCallback, useEffect } from 'react';
import { GameState, Direction } from '../types/game';
import { initializeGame, moveGame } from '../utils/gameLogic';
import { useLocalStorage } from './useLocalStorage';
import { BEST_SCORE_KEY } from '../utils/constants';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [bestScore, setBestScore] = useLocalStorage<number>(BEST_SCORE_KEY, 0);

  useEffect(() => {
    if (gameState.score > bestScore) {
      setBestScore(gameState.score);
    }
  }, [gameState.score, bestScore, setBestScore]);

  const move = useCallback((direction: Direction) => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = moveGame(prevState, direction);

      // Check if the board actually changed (moveGame already handles this)
      const boardChanged = newState !== prevState;

      if (boardChanged) {
        setHistory((prev) => [...prev.slice(-10), prevState]);
      }

      return newState;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setGameState(previousState);
    }
  }, [history]);

  const reset = useCallback(() => {
    setGameState(initializeGame());
    setHistory([]);
  }, []);

  return {
    gameState,
    bestScore,
    move,
    undo,
    reset,
    canUndo: history.length > 0,
  };
};
