import { useCallback, useRef } from 'react';
import { Menu, BookOpen, Bug, Coins, Backpack, Map as MapIcon, Heart, Zap, Save, FolderOpen, ArrowLeft } from 'lucide-react';
import type { GameState } from '@/core/types';
import type { PlayerDir } from '@/managers/ControlManager';

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
  onMove: (dir: PlayerDir) => void;
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
  onMove,
}: GameHUDProps) {
  const joystickRef = useRef<HTMLDivElement>(null);

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    const joystick = joystickRef.current;
    if (!joystick) return;

    const rect = joystick.getBoundingClientRect();
    const radius = rect.width / 2;
    const deltaX = clientX - (rect.left + radius);
    const deltaY = clientY - (rect.top + radius);
    const distance = Math.min(Math.hypot(deltaX, deltaY), radius);

    if (distance === 0) {
      onMove({ x: 0, y: 0 });
      return;
    }

    onMove({
      x: (deltaX / distance) * (distance / radius),
      y: (deltaY / distance) * (distance / radius),
    });
  }, [onMove]);

  const resetJoystick = useCallback(() => onMove({ x: 0, y: 0 }), [onMove]);

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
        </div>
      </div>

      {/* Sub-header: Act + Level */}
      <div className="absolute top-14 left-3 right-3 flex justify-center z-40 pointer-events-none">
        <div className="bg-slate-900/80 border border-emerald-500/50 px-3 py-1 rounded-xl backdrop-blur-md text-[10px] font-bold text-emerald-300 shadow-lg">
          Acto {state.act} - {levelLabel}
        </div>
      </div>

      {/* Minimap control: independent so it remains visible on small screens */}
      <button
        onClick={onMinimap}
        aria-label="Abrir minimapa"
        className="absolute top-24 right-3 z-50 pointer-events-auto bg-slate-900/95 border border-cyan-500/70 text-cyan-200 rounded-xl px-3 py-2 text-[10px] font-bold hover:bg-slate-800 active:scale-95 transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 backdrop-blur-md"
      >
        <MapIcon className="w-4 h-4" />
        <span>MAPA</span>
      </button>

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

      {/* Desktop controls */}
      <div className="hidden md:flex absolute bottom-4 left-4 z-50 items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-[10px] text-slate-300 backdrop-blur-md pointer-events-none">
        <span className="font-bold text-emerald-300">WASD</span>
        <span>mover</span>
        <span className="text-slate-600">|</span>
        <span className="font-bold text-amber-300">ENTER</span>
        <span>interactuar</span>
      </div>

      {/* Mobile joystick */}
      <div
        ref={joystickRef}
        className="md:hidden absolute bottom-5 left-5 z-50 w-28 h-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center touch-none select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateJoystick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            updateJoystick(event.clientX, event.clientY);
          }
        }}
        onPointerUp={resetJoystick}
        onPointerCancel={resetJoystick}
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/60 border border-emerald-300/50 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">MOVER</span>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 z-50 flex items-center gap-2 pointer-events-auto">
        {nearbyIcon && (
          <button
            onClick={onInteract}
            className="md:hidden w-12 h-12 rounded-full bg-amber-600/60 border border-amber-300/60 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer backdrop-blur-sm transition"
            title={iconLabel[nearbyIcon] || 'Interactuar'}
          >
            <span className="text-[10px] font-bold text-amber-100">ENTER</span>
          </button>
        )}
        <button
          onClick={onShoot}
          className="w-12 h-12 rounded-full bg-red-600/50 border border-red-400/50 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer backdrop-blur-sm transition"
          title="Disparar"
        >
          <Zap className="w-4 h-4 text-red-200" />
        </button>
      </div>
    </>
  );
}
