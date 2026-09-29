import { Menu, BookOpen, Bug, Coins, Backpack, Map as MapIcon, Heart, Zap, Save, FolderOpen, ArrowLeft } from 'lucide-react';
import type { GameState } from '@/core/types';

interface GameHUDProps {
  state: GameState;
  bagCount: number;
  bagMax: number;
  nearbyIcon: string | null;
  onMenu: () => void;
  onBook: () => void;
  onLogs: () => void;
  onBackpack: () => void;
  onMinimap: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExit: () => void;
  onInteract: () => void;
  onShoot: () => void;
}

export function GameHUD({
  state,
  bagCount,
  bagMax,
  nearbyIcon,
  onMenu,
  onBook,
  onLogs,
  onBackpack,
  onMinimap,
  onSave,
  onLoad,
  onExit,
  onInteract,
  onShoot,
}: GameHUDProps) {
  const levelLabel =
    state.currentLevel === 'main'
      ? 'Hacienda La Amalia'
      : state.currentLevel === 'warehouse'
        ? 'Almacen'
        : 'Puerto (Platformer)';

  const iconLabel: Record<string, string> = {
    W: 'Pozo',
    H: 'Casa',
    S: 'Establo',
    P: 'Portal',
    A: 'Admin',
    s: 'Sembrar',
    w: 'Regar',
    g: 'Creciendo',
    C: 'Cosechar',
    X: 'Salir',
  };

  return (
    <>
      {/* Top header bar */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-2 z-50 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onExit}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <ArrowLeft className="w-3 h-3" /> Salir
          </button>
          <button
            onClick={onMenu}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <Menu className="w-3 h-3" /> Menu
          </button>
          <button
            onClick={onBook}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <BookOpen className="w-3 h-3" /> Libro
          </button>
          <button
            onClick={onLogs}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <Bug className="w-3 h-3" /> Logs
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border border-amber-600/50 text-amber-300 rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
            <Coins className="w-3 h-3" /> {state.attributes.money}
          </div>
          <div className="bg-slate-900/90 border border-red-500/50 text-red-300 rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
            <Heart className="w-3 h-3" /> {state.attributes.hp}
          </div>
          <div className="bg-slate-900/90 border border-yellow-500/50 text-yellow-300 rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
            <Zap className="w-3 h-3" /> {state.attributes.ammo}
          </div>
          <button
            onClick={onBackpack}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <Backpack className="w-3 h-3" /> {bagCount}/{bagMax}
          </button>
          <button
            onClick={onMinimap}
            className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
          >
            <MapIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sub-header: Act + Level */}
      <div className="absolute top-14 left-3 right-3 flex justify-center z-40 pointer-events-none">
        <div className="bg-slate-900/80 border border-emerald-500/50 px-3 py-1 rounded-xl backdrop-blur-md text-[10px] font-bold text-emerald-300 shadow-lg">
          Acto {state.act} - {levelLabel}
        </div>
      </div>

      {/* Save/Load controls */}
      <div className="absolute top-14 right-3 flex gap-1.5 z-50 pointer-events-auto">
        <button
          onClick={onSave}
          className="bg-slate-900/90 border border-emerald-700/50 text-emerald-300 rounded-lg px-2 py-1 text-[9px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
        >
          <Save className="w-3 h-3" />
        </button>
        <button
          onClick={onLoad}
          className="bg-slate-900/90 border border-blue-700/50 text-blue-300 rounded-lg px-2 py-1 text-[9px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 backdrop-blur-md"
        >
          <FolderOpen className="w-3 h-3" />
        </button>
      </div>

      {/* Touch controls - bottom */}
      <div className="absolute bottom-4 left-4 z-50 pointer-events-auto">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
          <p className="text-[8px] text-white/40">WASD</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 pointer-events-auto">
        {nearbyIcon && (
          <button
            onClick={onInteract}
            className="w-10 h-10 rounded-full bg-amber-600/50 border border-amber-400/50 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer backdrop-blur-sm transition"
            title={iconLabel[nearbyIcon] || 'Interact'}
          >
            <span className="text-[10px] font-bold text-amber-200">
              {iconLabel[nearbyIcon]?.[0] || 'I'}
            </span>
          </button>
        )}
        <button
          onClick={onShoot}
          className="w-10 h-10 rounded-full bg-red-600/40 border border-red-400/40 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer backdrop-blur-sm transition"
          title="Shoot"
        >
          <Zap className="w-4 h-4 text-red-300" />
        </button>
      </div>
    </>
  );
}
