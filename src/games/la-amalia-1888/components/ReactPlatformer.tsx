import { useState, useEffect, useCallback } from 'react';

interface PlatformerProps {
  onExit: () => void;
  onScore: (score: number) => void;
}

export function ReactPlatformer({ onExit, onScore }: PlatformerProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(250);
  const [playerX] = useState(50);
  const [barrelX, setBarrelX] = useState(400);
  const [barrelSpeed, setBarrelSpeed] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameOver) {
        setBarrelX((prev) => {
          if (prev < -20) {
            setScore((s) => s + 10);
            setBarrelSpeed((sp) => Math.min(sp + 0.5, 18));
            return 450;
          }
          return prev - barrelSpeed;
        });
      }
    }, 30);
    return () => clearInterval(timer);
  }, [gameOver, barrelSpeed]);

  useEffect(() => {
    if (Math.abs(playerX - barrelX) < 30 && playerY > 220) {
      setGameOver(true);
    }
  }, [playerX, barrelX, playerY]);

  useEffect(() => {
    if (gameOver) {
      onScore(score);
    }
  }, [gameOver, score, onScore]);

  const jump = useCallback(() => {
    if (playerY >= 250 && !gameOver) {
      setPlayerY(150);
      setTimeout(() => setPlayerY(250), 400);
    }
  }, [playerY, gameOver]);

  const reset = () => {
    setScore(0);
    setGameOver(false);
    setPlayerY(250);
    setBarrelX(400);
    setBarrelSpeed(8);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-white p-4">
      <h2 className="text-xl font-bold text-amber-400">
        Acto II: Plataformas React (Estilo Donkey Kong)
      </h2>
      <p className="text-xs text-slate-300">
        Puntuacion de Exportacion: {score}
      </p>
      <div
        className="w-[450px] h-[320px] max-w-full bg-slate-950 border-2 border-amber-500/60 relative overflow-hidden rounded-2xl flex items-end cursor-pointer"
        onClick={jump}
      >
        <div
          className="absolute w-8 h-8 bg-blue-500 rounded-lg transition-all duration-75 flex items-center justify-center text-sm"
          style={{ left: `${playerX}px`, bottom: `${320 - playerY - 32}px` }}
        >
          P
        </div>
        <div
          className="absolute w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] transition-all"
          style={{ left: `${barrelX}px`, bottom: '20px' }}
        >
          O
        </div>
        <div className="absolute bottom-0 w-full h-5 bg-amber-900 border-t border-amber-700" />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
            <p className="text-red-400 font-bold text-lg mb-2">
              Impacto de Barril!
            </p>
            <p className="text-amber-400 text-sm mb-3">Score: {score}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={jump}
          className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Saltar
        </button>
        <button
          onClick={onExit}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Volver a La Amalia
        </button>
      </div>
    </div>
  );
}
