import { Gamepad2, Keyboard, MousePointer2 } from 'lucide-react';

interface GameStartModalProps {
  gameTitle: string;
  onStart: () => void;
}

export function GameStartModal({ gameTitle, onStart }: GameStartModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/15 p-3 text-3xl">🎮</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Preparado para jugar</p>
            <h1 className="text-2xl font-black">{gameTitle}</h1>
          </div>
        </div>
        <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="text-sm font-bold text-amber-200">No necesitas iniciar sesión.</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">El juego funciona directamente en tu navegador. Tu progreso local se guarda en este dispositivo.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-800 p-3"><Keyboard className="mb-2 h-5 w-5 text-emerald-300" /><p className="font-bold">PC</p><p className="text-xs text-slate-400">WASD o flechas: moverte</p><p className="text-xs text-slate-400">ENTER: interactuar</p><p className="text-xs text-slate-400">ESPACIO: observar/disparar</p></div>
          <div className="rounded-xl bg-slate-800 p-3"><MousePointer2 className="mb-2 h-5 w-5 text-cyan-300" /><p className="font-bold">Móvil</p><p className="text-xs text-slate-400">Joystick o controles táctiles: moverte</p><p className="text-xs text-slate-400">Botón ámbar: interactuar</p><p className="text-xs text-slate-400">Botón rojo: acción especial</p></div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-800/70 p-3 text-xs text-slate-300"><Gamepad2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Acércate a los objetos con iconos. El objetivo actual siempre aparece en pantalla.</span></div>
        <button onClick={onStart} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"><span>Iniciar juego</span><span>→</span></button>
      </div>
    </div>
  );
}
