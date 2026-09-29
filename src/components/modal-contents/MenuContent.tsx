import type { GameState } from '@/core/types';

interface MenuContentProps {
  state: GameState;
  onToggleMinimap: (enabled: boolean) => void;
}

export function MenuContent({ state, onToggleMinimap }: MenuContentProps) {
  const levelLabel =
    state.currentLevel === 'main'
      ? 'Hacienda La Amalia'
      : state.currentLevel === 'warehouse'
        ? 'Almacen de Suministros'
        : 'Puerto (React Platformer)';

  return (
    <div className="space-y-3">
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
        <span className="text-slate-300">Mostrar Minimapa:</span>
        <input
          type="checkbox"
          checked={state.minimapEnabled}
          onChange={(e) => onToggleMinimap(e.target.checked)}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
        <p className="text-amber-400 font-bold">Acto Actual: Acto {state.act}</p>
        <p className="text-slate-400">Nivel: {levelLabel}</p>
        <p className="text-slate-400">Municion: {state.attributes.ammo} balas</p>
        <p className="text-slate-400">Vida: {state.attributes.hp} HP</p>
        <p className="text-slate-400">Dinero: {state.attributes.money}</p>
        <p className="text-slate-400">Velocidad: {state.attributes.speed}</p>
      </div>
    </div>
  );
}
