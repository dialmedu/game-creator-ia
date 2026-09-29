import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DukubariCityManager, CITY_TARGETS, type CityTarget } from '@/games/dukubari/DukubariCityManager';

type Choice = { label: string; result: string };
type Modal = { kind: 'mission' | 'result' | 'victory'; title: string; body: string; icon: string; choices?: Choice[] } | null;

const decisions: Record<string, { prompt: string; choices: Choice[] }> = {
  identity: { prompt: 'Registra tu nombre, profesión y opinión. En Dukubari no tener opinión es una anomalía.', choices: [{ label: 'Aceptar una identidad oficial', result: 'El sistema te registra como ANOMALÍA por aceptar demasiado.' }, { label: 'Rechazar la identidad', result: 'El sistema te asigna automáticamente el perfil Ciudadano Perfecto.' }] },
  pet: { prompt: 'Declara si quieres una mascota. Tu respuesta será interpretada al revés.', choices: [{ label: 'Adoptar una mascota', result: 'La mascota desaparece del registro. Para el sistema nunca existió.' }, { label: 'No adoptar una mascota', result: 'Aparece una mascota no solicitada y te sigue a todas partes.' }] },
  schedule: { prompt: 'Elige cuándo trabajar para poder continuar tu vida en la ciudad.', choices: [{ label: 'Trabajar de día', result: 'El cielo se vuelve de noche porque tu día acaba de comenzar.' }, { label: 'Trabajar de noche', result: 'Sale el sol a medianoche para celebrar tu productividad.' }] },
  study: { prompt: 'El sistema quiere saber si deseas aprender.', choices: [{ label: 'Estudiar', result: 'Aprendes mucho, pero tu título dice que no sabes nada.' }, { label: 'No estudiar', result: 'El sistema te gradúa con honores por no hacer preguntas.' }] },
  marriage: { prompt: 'Decide qué tipo de vida deseas compartir.', choices: [{ label: 'Casarse', result: 'Tu pareja desaparece del registro civil.' }, { label: 'Permanecer soltero', result: 'El sistema te asigna una pareja que nunca pediste.' }] },
  work: { prompt: 'Elige cómo sostener tu vida en Dukubari.', choices: [{ label: 'Trabajar', result: 'El sistema te declara desempleado por exceso de productividad.' }, { label: 'No trabajar', result: 'Recibes un cargo de máxima responsabilidad.' }] },
  car: { prompt: 'La ciudad dice que la libertad necesita un vehículo.', choices: [{ label: 'Comprar un auto', result: 'Recibes un auto que no puede conducirse.' }, { label: 'No comprar un auto', result: 'Aparece un vehículo asignado con tu nombre.' }] },
  exit: { prompt: 'Has cruzado las decisiones cotidianas. Decide qué hacer con la verdad.', choices: [{ label: 'Abrir todos los archivos', result: 'La verdad queda libre. La ciudad tendrá que decidir por sí misma.' }, { label: 'Apagar el sistema', result: 'El Orden se apaga. Nadie vuelve a decirte qué debes querer.' }, { label: 'Aceptar el Orden', result: 'Te conviertes en el nuevo Director. Ahora tú defines las reglas.' }] },
};

interface DukubariRunnerProps { onExit: () => void; }

export function DukubariRunner({ onExit }: DukubariRunnerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<DukubariCityManager | null>(null);
  const [targetIndex, setTargetIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [nearby, setNearby] = useState<CityTarget | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [consciousness, setConsciousness] = useState(0);
  const target = CITY_TARGETS[targetIndex];

  const openMission = useCallback((currentTarget: CityTarget = target) => {
    const decision = decisions[currentTarget.id];
    if (!decision) return;
    setModal({ kind: 'mission', title: `${currentTarget.icon} ${currentTarget.title}`, icon: currentTarget.icon, body: decision.prompt, choices: decision.choices });
  }, [target]);

  const choose = useCallback((choice: Choice) => {
    if (target.id === 'schedule') {
      const nextMode = choice.label.includes('día') ? 'night' : 'day';
      setMode(nextMode);
      cityRef.current?.setMode(nextMode);
    }
    setConsciousness((value) => value + 1);
    setCompleted((items) => [...new Set([...items, target.id])]);
    setModal({ kind: 'result', title: '🔄 Consecuencia invertida', icon: '🔄', body: choice.result });
  }, [target]);

  const advance = () => {
    if (targetIndex >= CITY_TARGETS.length - 1) {
      setModal({ kind: 'victory', title: '🏆 Has sobrevivido a Dukubari', icon: '🏆', body: `Has salido del mundo al revés. Conciencia: ${consciousness}. Ahora puedes elegir qué reglas crear.` });
      return;
    }
    const next = targetIndex + 1;
    setTargetIndex(next);
    cityRef.current?.setTargetIndex(next);
    setNearby(null);
    setModal(null);
  };

  useEffect(() => {
    if (!canvasRef.current || cityRef.current) return;
    const city = new DukubariCityManager({ root: canvasRef.current, onTargetEnter: (currentTarget) => { setNearby(currentTarget); }, onPositionChange: () => undefined });
    cityRef.current = city;
    city.start().catch((error) => console.error('No se pudo iniciar Dukubari:', error));
    return () => { city.stop(); cityRef.current = null; };
  }, []);

  const direction = useMemo(() => {
    if (!nearby) return `Ve hacia ${target.icon} ${target.title}`;
    return `📍 ${nearby.title} alcanzado · ENTER`;
  }, [nearby, target]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      <header className="absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-emerald-300/40 bg-slate-950/90 px-4 py-3 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">🏙️ DUKUBARI · CIUDAD KABOOM</p><h1 className="text-lg font-black md:text-2xl">Elige. Sobrevive. Descubre.</h1><p className="text-xs text-slate-300">{mode === 'night' ? '🌙 modo noche invertido' : '☀️ modo día'} · 💡 Conciencia: {consciousness}</p></div>
        <button onClick={onExit} className="rounded-xl bg-slate-950/90 px-4 py-2 text-xs font-bold text-white shadow-xl">Salir</button>
      </header>
      <section className="absolute left-3 right-3 top-28 z-20 rounded-2xl border border-white/20 bg-slate-950/90 p-3 text-white shadow-xl"><div className="mb-2 flex justify-between text-xs font-bold"><span>🧭 Ruta de supervivencia</span><span>{completed.length}/{CITY_TARGETS.length}</span></div><div className="flex gap-1">{CITY_TARGETS.map((item, index) => <div key={item.id} className={`h-2 flex-1 rounded-full ${completed.includes(item.id) ? 'bg-emerald-400' : index === targetIndex ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`} />)}</div><p className="mt-2 text-xs text-amber-200">⬇️ Objetivo: {target.icon} {target.title} · {direction}</p></section>
      <aside className="absolute bottom-4 left-3 z-20 w-72 rounded-2xl bg-slate-950/90 p-4 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">🎯 Misión activa</p><p className="mt-1 text-sm font-black">{target.icon} {target.title}</p><p className="mt-2 text-xs text-slate-300">{direction}</p><p className="mt-2 text-[10px] text-slate-400">WASD mover · ENTER interactuar</p></aside>
      <div className="absolute bottom-5 right-4 z-30 flex gap-2">{nearby && <button onClick={() => openMission(nearby)} className="rounded-full bg-amber-400 px-5 py-4 text-xs font-black text-slate-950 shadow-xl">{nearby.icon} ENTER</button>}<button onClick={() => openMission()} className="rounded-full bg-slate-950 px-4 py-4 text-xs font-black text-white shadow-xl">📜 Misión</button></div>
      {modal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-slate-950 p-6 text-white shadow-2xl"><p className="text-4xl">{modal.icon}</p><h2 className="mt-2 text-2xl font-black">{modal.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200">{modal.body}</p>{modal.choices && <div className="mt-5 grid gap-2">{modal.choices.map((choice) => <button key={choice.label} onClick={() => choose(choice)} className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-left text-sm font-bold text-emerald-100 hover:bg-emerald-500/30">{choice.label}</button>)}</div>}{!modal.choices && <button onClick={modal.kind === 'result' ? advance : modal.kind === 'victory' ? onExit : () => setModal(null)} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950">{modal.kind === 'result' ? 'Desbloquear siguiente objetivo →' : modal.kind === 'victory' ? 'Volver a la plataforma' : 'Cerrar misión'}</button>}</div></div>}
    </div>
  );
}
