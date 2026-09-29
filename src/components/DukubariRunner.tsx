import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Compass, Eye, Flag, Heart, MapPin, Sparkles } from 'lucide-react';

interface DukubariRunnerProps { onExit: () => void; }
type Point = { x: number; y: number };
type Modal = { title: string; body: string; icon: string; choices?: { label: string; result: string }[] } | null;
type Stage = { id: string; title: string; icon: string; target: string; x: number; y: number; prompt: string; choices: { label: string; result: string }[] };

const stages: Stage[] = [
  { id: 'identity', title: 'Conseguir una identidad', icon: '🪪', target: 'Funcionario', x: 18, y: 36, prompt: 'El funcionario necesita registrar tu identidad.', choices: [{ label: 'Aceptar una identidad oficial', result: 'El sistema te registra como ANOMALÍA: alguien que acepta demasiado.' }, { label: 'Rechazar la identidad', result: 'El sistema te asigna automáticamente: Ciudadano Perfecto.' }] },
  { id: 'pet', title: 'Resolver la mascota', icon: '🐾', target: 'Centro de mascotas', x: 78, y: 35, prompt: 'Dukubari exige que decidas si tendrás una mascota.', choices: [{ label: 'Adoptar una mascota', result: 'La mascota desaparece del registro. Para el sistema nunca existió.' }, { label: 'No adoptar una mascota', result: 'Aparece una mascota no solicitada y te sigue a todas partes.' }] },
  { id: 'schedule', title: 'Elegir horario de trabajo', icon: '🕒', target: 'Oficina de horarios', x: 78, y: 68, prompt: 'Elige cuándo quieres trabajar.', choices: [{ label: 'Trabajar de día', result: 'El cielo se vuelve noche. El sistema dice que tu día acaba de comenzar.' }, { label: 'Trabajar de noche', result: 'Sale el sol a medianoche. Todos celebran tu productividad.' }] },
  { id: 'study', title: 'Estudiar', icon: '🎓', target: 'Centro de educación', x: 18, y: 70, prompt: 'La ciudad quiere decidir si mereces aprender.', choices: [{ label: 'Estudiar', result: 'Aprendes mucho, pero el título dice que no sabes nada.' }, { label: 'No estudiar', result: 'El sistema te gradúa con honores por no hacer preguntas.' }] },
  { id: 'marriage', title: 'Decidir sobre el matrimonio', icon: '💍', target: 'Oficina de vínculos', x: 50, y: 78, prompt: 'Una pantalla te pregunta qué tipo de vida deseas.', choices: [{ label: 'Casarse', result: 'Tu pareja desaparece del registro civil.' }, { label: 'Permanecer soltero', result: 'El sistema te asigna una pareja que nunca pediste.' }] },
  { id: 'work', title: 'Conseguir trabajo', icon: '💼', target: 'Distrito laboral', x: 25, y: 52, prompt: 'Debes elegir cómo sostener tu vida.', choices: [{ label: 'Trabajar', result: 'El sistema te declara desempleado por exceso de productividad.' }, { label: 'No trabajar', result: 'Recibes un cargo de máxima responsabilidad.' }] },
  { id: 'car', title: 'Decidir sobre el auto', icon: '🚗', target: 'Concesionario', x: 72, y: 52, prompt: 'La ciudad dice que la libertad necesita un vehículo.', choices: [{ label: 'Comprar un auto', result: 'Recibes un auto que no puede conducirse.' }, { label: 'No comprar un auto', result: 'Aparece un vehículo asignado con tu nombre.' }] },
  { id: 'final', title: 'Llegar al centro del Orden', icon: '🏛️', target: 'El Orden', x: 50, y: 22, prompt: 'Has sobrevivido a las decisiones cotidianas. Decide qué hacer con la verdad.', choices: [{ label: 'Obedecer al sistema', result: 'Te conviertes en el ciudadano perfecto.' }, { label: 'Rebelarte', result: 'El sistema se apaga, pero nadie sabe qué hacer después.' }, { label: 'Abrir la verdad', result: 'Los archivos se liberan. Ahora la ciudad debe decidir.' }] },
];

export function DukubariRunner({ onExit }: DukubariRunnerProps) {
  const [player, setPlayer] = useState<Point>({ x: 50, y: 55 });
  const [stageIndex, setStageIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [consciousness, setConsciousness] = useState(0);
  const [worldMode, setWorldMode] = useState<'day' | 'night'>('day');
  const [modal, setModal] = useState<Modal>(null);
  const [nearby, setNearby] = useState(false);
  const stage = stages[stageIndex];

  const updateNearby = useCallback((position: Point) => {
    setNearby(Math.hypot(stage.x - position.x, stage.y - position.y) < 13);
  }, [stage]);

  const choose = useCallback((choice: { label: string; result: string }) => {
    if (stage.id === 'schedule') setWorldMode(choice.label.includes('día') ? 'night' : 'day');
    setConsciousness((value) => value + 1);
    setCompleted((items) => [...new Set([...items, stage.id])]);
    setModal({ title: `${stage.icon} Resultado invertido`, icon: '🔄', body: choice.result });
  }, [stage]);

  const interact = useCallback(() => {
    if (!nearby) return;
    setModal({ title: `${stage.icon} ${stage.title}`, icon: stage.icon, body: stage.prompt, choices: stage.choices });
  }, [nearby, stage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'enter') { event.preventDefault(); interact(); return; }
      if (key === ' ' || event.code === 'Space') { event.preventDefault(); setModal({ title: '👁️ Observación', icon: '👁️', body: nearby ? `${stage.target}: el mundo parece normal, pero todo tiene una consecuencia contraria.` : 'Acércate al objetivo resaltado para observarlo.' }); return; }
      const direction: Record<string, Point> = { w: { x: 0, y: -1 }, a: { x: -1, y: 0 }, s: { x: 0, y: 1 }, d: { x: 1, y: 0 }, arrowup: { x: 0, y: -1 }, arrowleft: { x: -1, y: 0 }, arrowdown: { x: 0, y: 1 }, arrowright: { x: 1, y: 0 } };
      if (!direction[key]) return;
      event.preventDefault();
      setPlayer((current) => { const next = { x: Math.max(8, Math.min(92, current.x + direction[key].x * 2)), y: Math.max(14, Math.min(86, current.y + direction[key].y * 2)) }; updateNearby(next); return next; });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interact, nearby, stage, updateNearby]);

  const advance = () => { setModal(null); if (stageIndex < stages.length - 1) { setStageIndex((value) => value + 1); setPlayer({ x: 50, y: 55 }); setNearby(false); } else { setModal({ title: '🏁 Dukubari completado', icon: '🎬', body: 'Has llegado al final. En Dukubari no existe una decisión correcta: existe la decisión que te permite comprender las reglas.' }); } };
  const progress = Math.round((completed.length / stages.length) * 100);
  const objectiveText = completed.includes(stage.id) ? 'Lee el resultado invertido y continúa.' : `Ve hacia ${stage.icon} ${stage.target} y pulsa ENTER.`;
  const directionText = useMemo(() => stage.x < player.x - 8 ? '← Ve hacia la izquierda' : stage.x > player.x + 8 ? '→ Ve hacia la derecha' : stage.y < player.y - 8 ? '↑ Ve hacia arriba' : stage.y > player.y + 8 ? '↓ Ve hacia abajo' : 'Estás en el objetivo · pulsa ENTER', [player, stage]);

  return (
    <div className={`fixed inset-0 overflow-hidden text-slate-900 transition-colors duration-700 ${worldMode === 'night' ? 'bg-[#111b3a]' : 'bg-[#e8f4f1]'}`}>
      <div className={`absolute inset-0 transition-opacity duration-700 ${worldMode === 'night' ? 'bg-[radial-gradient(circle_at_50%_15%,#334477_0%,#111b3a_60%,#080d20_100%)]' : 'bg-[radial-gradient(circle_at_50%_15%,#ffffff_0%,#d5ebe5_45%,#9fcfc4_100%)]'}`} />
      <div className={`absolute inset-x-0 bottom-0 h-[38%] border-t-8 ${worldMode === 'night' ? 'border-indigo-900 bg-[#172449]' : 'border-[#79b5a4] bg-[#bdded2]'}`} />

      <header className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">🏙️ DUKUBARI · ACTO I</p>
          <h1 className="text-lg font-black md:text-2xl">Sobrevive a las reglas</h1>
          <p className="text-xs text-slate-500">Progreso: {progress}% · {worldMode === 'night' ? '🌙 noche invertida' : '☀️ día oficial'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-slate-950/90 px-3 py-2 text-xs font-bold text-white shadow-lg">💡 Conciencia: {consciousness}</div>
          <button onClick={onExit} className="rounded-2xl border border-slate-300 bg-white/90 px-3 py-2 text-xs font-bold shadow-lg hover:bg-white">Salir</button>
        </div>
      </header>

      <aside className="absolute left-3 top-32 z-20 w-72 rounded-2xl bg-slate-950/90 p-4 text-white shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">🎯 Objetivo actual</p>
        <p className="mt-1 text-sm font-black">{stage.icon} {stage.title}</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">{objectiveText}</p>
        <div className="mt-3 rounded-xl bg-amber-400/15 p-2 text-xs font-bold text-amber-200">{directionText}</div>
        <div className="mt-3 border-t border-white/10 pt-3 text-[10px] text-slate-400">REGLA: el resultado será contrario a tu elección.</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
      </aside>

      <main className="absolute inset-0 z-10" aria-label="Mundo de Dukubari">
        <div className="absolute left-[37%] top-[23%] rounded-xl border-4 border-slate-700 bg-slate-900 px-4 py-2 text-center text-white shadow-xl md:left-[42%]">
          <p className="text-2xl">📺</p><p className="text-[10px] font-black tracking-widest">TODO FUNCIONA COMO DEBE</p><p className="text-[9px] text-amber-300">SIEMPRE QUE OBEDEZCAS</p>
        </div>
        {stages.map((item) => (
          <div key={item.id} className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition-all ${item.id === stage.id ? 'scale-110' : 'opacity-70'}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 text-3xl shadow-xl ${item.id === stage.id ? 'border-amber-400 bg-amber-100 ring-4 ring-amber-300/50' : completed.includes(item.id) ? 'border-emerald-500 bg-emerald-100' : 'border-white bg-white'}`}>{completed.includes(item.id) ? '✅' : item.icon}</div>
            <div className="mt-2 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold shadow">{item.target}</div>
            {item.id === stage.id && <div className="mt-1 text-[9px] font-black text-amber-700">OBJETIVO</div>}
          </div>
        ))}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100" style={{ left: `${player.x}%`, top: `${player.y}%` }}><div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-2xl shadow-xl">🧑</div><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[9px] font-bold text-white">DESCONOCIDO</span></div>
      </main>

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-center shadow-xl"><p className="text-xs font-black text-slate-800">{nearby ? `${stage.icon} ${stage.target} · ENTER` : 'Sigue el objetivo resaltado'}</p><p className="mt-1 text-[10px] text-slate-500">WASD mover · ENTER decidir · ESPACIO observar</p></div>
      {nearby && <button onClick={interact} className="absolute bottom-24 right-5 z-30 rounded-full bg-amber-500 px-5 py-4 text-xs font-black text-slate-950 shadow-xl hover:bg-amber-400">{stage.icon} ENTER</button>}
      <button onClick={() => setModal({ title: '👁️ Observación', icon: '👁️', body: nearby ? `${stage.target}: las reglas parecen normales, pero el resultado siempre se invierte.` : 'Acércate al objetivo resaltado para observarlo.' })} className="absolute bottom-24 right-28 z-30 rounded-full bg-slate-900 px-5 py-4 text-xs font-black text-white shadow-xl hover:bg-slate-700">👁️</button>

      {modal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setModal(null)}><div className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-950 p-6 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-4xl">{modal.icon}</p><h2 className="mt-2 text-2xl font-black">{modal.title}</h2></div><button onClick={() => setModal(null)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20">Cerrar</button></div><p className="mt-5 text-sm leading-7 text-slate-200">{modal.body}</p>{modal.choices ? <div className="mt-5 grid gap-2">{modal.choices.map((choice) => <button key={choice.label} onClick={() => choose(choice)} className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-left text-sm font-bold text-emerald-100 hover:bg-emerald-500/30">{choice.label}</button>)}</div> : <button onClick={() => { if (completed.includes(stage.id) && modal.title.includes('Resultado')) advance(); else setModal(null); }} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400">{completed.includes(stage.id) && modal.title.includes('Resultado') ? 'Siguiente objetivo →' : 'Continuar'}</button>}</div></div>}
    </div>
  );
}
