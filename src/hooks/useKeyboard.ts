// Keyboard controls hook for 2048 game
import { useEffect, useRef } from 'react';
import { Direction } from '../types/game';

interface KeyboardControls {
  onMove: (direction: Direction) => void;
  disabled?: boolean;
}

export const useKeyboard = ({ onMove, disabled = false }: KeyboardControls): void => {
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const key = event.key;

      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        event.preventDefault();
        onMoveRef.current('up');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        event.preventDefault();
        onMoveRef.current('down');
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        event.preventDefault();
        onMoveRef.current('left');
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        event.preventDefault();
        onMoveRef.current('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled]);
};
