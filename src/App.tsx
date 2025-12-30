import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { GameControls } from './components/GameControls';
import { GameOverlay } from './components/GameOverlay';

function App() {
  const { gameState, bestScore, move, undo, reset, canUndo } = useGame();

  useKeyboard({
    onMove: move,
    disabled: gameState.gameOver,
  });

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top, rgba(164, 144, 194, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at left, rgba(74, 78, 143, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at right, rgba(192, 132, 252, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)
        `,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: Math.random() * 600 + 300,
              height: Math.random() * 600 + 300,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(164, 144, 194, 0.25)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.25)' : 'rgba(192, 132, 252, 0.25)'
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Main Content Container - 居中 */}
      <div className="relative z-10 flex flex-col items-center">
        <Header />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 w-full max-w-2xl">
          <ScoreBoard score={gameState.score} bestScore={bestScore} />
          <GameControls onNewGame={reset} onUndo={undo} canUndo={canUndo} />
        </div>

        <div className="relative">
          <GameBoard board={gameState.board} onMove={move} disabled={gameState.gameOver} />
          <GameOverlay
            gameOver={gameState.gameOver}
            won={gameState.won}
            onNewGame={reset}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#a490c2' }}>
            合并相同数字的方块,达到 <span className="font-bold" style={{ color: '#c084fc' }}>2048</span> 即可获胜!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
