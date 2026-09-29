import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useI18n } from '@/i18n';
import { getGame } from '@/registry/gameRegistry';
import { GameRunner } from './GameRunner';
import { DukubariRunner } from './DukubariRunner';

interface GamePageProps {
  gameId: string;
  onBack: () => void;
}

export function GamePage({ gameId, onBack }: GamePageProps) {
  const { t } = useI18n();
  const gameDef = getGame(gameId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!gameDef) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="text-slate-400">{t.gamePage.notFound}: {gameId}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t.gamePage.back}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      {/* Top bar with back button - shown briefly then fades */}
      <div className="absolute top-0 left-0 right-0 z-[80] flex items-center justify-between p-3 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer pointer-events-auto backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> {t.gamePage.back}
        </button>
        <span className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold pointer-events-auto backdrop-blur-md">
          {gameDef.title}
        </span>
      </div>

      {mounted && (gameId === 'dukubari' ? <DukubariRunner onExit={onBack} /> : <GameRunner gameId={gameId} onExit={onBack} />)}
    </div>
  );
}
