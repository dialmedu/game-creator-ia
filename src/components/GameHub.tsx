import { useState, useCallback } from 'react';
import { Coffee, Gamepad2, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import type { GameRecord } from '@/lib/gameApi';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/gameApi';
import { useEffect } from 'react';

interface GameHubProps {
  games: GameRecord[];
  loading: boolean;
  onSelectGame: (gameId: string) => void;
}

export function GameHub({ games, loading, onSelectGame }: GameHubProps) {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  useEffect(() => {
    games.forEach(async (game) => {
      const entries = await fetchLeaderboard(game.id, 3);
      setLeaderboards((prev) => ({ ...prev, [game.id]: entries }));
    });
  }, [games]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-emerald-400" />
            <h1 className="text-4xl font-bold tracking-tight">
              Gamer Platform
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A modular game system with a framework-agnostic core. Play games built with React, Vue, or vanilla JS — all sharing the same state engine.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-600/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-700/30 flex items-center justify-center">
                    <Coffee className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                    {game.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-2 group-hover:text-emerald-300 transition">
                  {game.title}
                </h2>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {game.framework}
                  </span>
                  {leaderboards[game.id]?.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Trophy className="w-3 h-3" />
                      <span className="text-[10px] font-bold">
                        Top: {leaderboards[game.id][0].score}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                  Play <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-slate-600 text-xs">
          <p>Modular Onion Architecture — Core / Managers / Infrastructure</p>
          <p className="mt-1">Route pattern: <code className="text-slate-500">#/gamer/&#123;gameId&#125;</code></p>
        </footer>
      </div>
    </div>
  );
}
