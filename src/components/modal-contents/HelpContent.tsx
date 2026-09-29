import { Gamepad2, Keyboard, MousePointer2 } from 'lucide-react';

export function HelpContent() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3">
        <p className="text-sm font-bold text-emerald-200">Ya estás dentro del juego. No necesitas iniciar sesión.</p>
        <p className="mt-1 text-xs text-slate-300">Explora la hacienda, acércate a los lugares con etiqueta y usa la acción indicada.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800 p-3"><Keyboard className="w-5 h-5 text-emerald-300 mb-2" /><p className="font-bold text-white">Moverse</p><p className="text-xs text-slate-400">Usa W, A, S y D.</p></div>
        <div className="rounded-xl bg-slate-800 p-3"><span className="text-xl text-amber-300">↵</span><p className="font-bold text-white">Interactuar</p><p className="text-xs text-slate-400">Acércate y pulsa ENTER o el botón ámbar.</p></div>
        <div className="rounded-xl bg-slate-800 p-3"><span className="text-xl text-red-300">●</span><p className="font-bold text-white">Disparar</p><p className="text-xs text-slate-400">Pulsa ESPACIO o el botón rojo.</p></div>
        <div className="rounded-xl bg-slate-800 p-3"><MousePointer2 className="w-5 h-5 text-cyan-300 mb-2" /><p className="font-bold text-white">Móvil</p><p className="text-xs text-slate-400">Usa el joystick y los botones de acción.</p></div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-300"><Gamepad2 className="w-4 h-4 text-emerald-400" /> Las casas y zonas interactivas muestran su nombre sobre el escenario.</div>
    </div>
  );
}
