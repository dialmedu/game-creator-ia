import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DukubariCityManager, CITY_TARGETS, type CityTarget } from '@/games/dukubari/DukubariCityManager';

type Choice = { label: string; result: string; favorable: boolean };
type Modal = { kind: 'mission' | 'result' | 'victory'; title: string; body: string; icon: string; choices?: Choice[] } | null;

const decisions: Record<string, { prompt: string; choices: Choice[] }> = {
  identity: { prompt: 'Registra tu nombre, profesión y opinión. En Ciudad al revés, no tener opinión es una anomalía.', choices: [{ label: 'Aceptar una identidad oficial', result: 'El sistema te registra como ANOMALÍA por aceptar demasiado.', favorable: false }, { label: 'Rechazar la identidad', result: 'El sistema te asigna el perfil Ciudadano Perfecto.', favorable: true }] },
  pet: { prompt: 'Declara si quieres una mascota. Tu respuesta será interpretada al revés.', choices: [{ label: 'Adoptar una mascota', result: 'La mascota desaparece del registro. Para el sistema nunca existió.', favorable: false }, { label: 'No adoptar una mascota', result: 'Aparece una mascota no solicitada y te sigue a todas partes.', favorable: true }] },
  schedule: { prompt: 'Elige cuándo trabajar.', choices: [{ label: 'Trabajar de día', result: 'El cielo se vuelve de noche porque tu día acaba de comenzar.', favorable: false }, { label: 'Trabajar de noche', result: 'Sale el sol a medianoche para celebrar tu productividad.', favorable: true }] },
  study: { prompt: 'El sistema quiere saber si deseas aprender.', choices: [{ label: 'Estudiar', result: 'Aprendes mucho, pero tu título dice que no sabes nada.', favorable: false }, { label: 'No estudiar', result: 'El sistema te gradúa por no hacer preguntas.', favorable: true }] },
  marriage: { prompt: 'Decide qué tipo de vida deseas compartir.', choices: [{ label: 'Casarse', result: 'Tu pareja desaparece del registro civil.', favorable: false }, { label: 'Permanecer soltero', result: 'El sistema te asigna una pareja que nunca pediste.', favorable: true }] },
  work: { prompt: 'Elige cómo sostener tu vida.', choices: [{ label: 'Trabajar', result: 'El sistema te declara desempleado por exceso de productividad.', favorable: false }, { label: 'No trabajar', result: 'Recibes un cargo de máxima responsabilidad.', favorable: true }] },
  car: { prompt: 'La ciudad dice que la libertad necesita un vehículo.', choices: [{ label: 'Comprar un auto', result: 'Recibes un auto que no puede conducirse.', favorable: false }, { label: 'No comprar un auto', result: 'Aparece un vehículo asignado con tu nombre.', favorable: true }] },
  exit: { prompt: 'Has cruzado las decisiones cotidianas. Decide qué hacer con la verdad.', choices: [{ label: 'Abrir todos los archivos', result: 'La verdad queda libre. La ciudad tendrá que decidir.', favorable: true }, { label: 'Apagar el sistema', result: 'El Orden se apaga. Nadie vuelve a decirte qué querer.', favorable: true }, { label: 'Aceptar el Orden', result: 'Te conviertes en el nuevo Director.', favorable: false }] },
};

interface DukubariRunnerProps { onExit: () => void; }

export function DukubariRunner({ onExit }: DukubariRunnerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<DukubariCityManager | null>(null);
  const [targetIndex, setTargetIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [decisionsMade, setDecisionsMade] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    if (nearby?.id === target.id && !modal && !completed.includes(target.id)) openMission(nearby);
  }, [nearby, target, modal, completed, openMission]);

  const choose = useCallback((choice: Choice) => {
    if (target.id === 'schedule') {
      const nextMode = choice.label.includes('día') ? 'night' : 'day';
      setMode(nextMode);
      cityRef.current?.setMode(nextMode);
    }
    setConsciousness((value) => value + 1);
    setDecisionsMade((items) => ({ ...items, [target.id]: choice.favorable }));
    setCompleted((items) => [...new Set([...items, target.id])]);
    setModal({ kind: 'result', title: choice.favorable ? '✓ Resultado favorable' : '✕ Resultado desfavorable', icon: choice.favorable ? '✅' : '❌', body: choice.result });
  }, [target]);

  const advance = () => {
    if (targetIndex >= CITY_TARGETS.length - 1) {
      setModal({ kind: 'victory', title: '🏆 Has sobrevivido a Ciudad al revés', icon: '🏆', body: `Has salido del mundo al revés. Conciencia: ${consciousness}.` });
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
    const city = new DukubariCityManager({ root: canvasRef.current, onTargetEnter: setNearby, onPositionChange: () => undefined });
    cityRef.current = city;
    city.start().catch((error) => console.error('No se pudo iniciar Ciudad al revés:', error));
    return () => { city.stop(); cityRef.current = null; };
  }, []);

  const direction = useMemo(() => nearby ? `📍 ${nearby.title} · ENTER` : `➡️ Ve hacia ${target.icon} ${target.title}`, [nearby, target]);
  const progress = `${completed.length}/${CITY_TARGETS.length}`;

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      <header className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="rounded-xl bg-slate-950/90 px-4 py-2 text-white shadow-lg"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">🏙️ CIUDAD AL REVÉS · DUKUBARI</p><p className="text-xs text-slate-300">{mode === 'night' ? '🌙 Noche invertida' : '☀️ Día'} · 💡 {consciousness}</p></div>
        <button onClick={onExit} className="pointer-events-auto rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-lg">← Volver</button>
      </header>

      <footer className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto rounded-2xl bg-slate-950/95 px-4 py-3 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">🎯 Misión {progress}</p><p className="text-sm font-black">{target.icon} {target.title}</p><p className="text-xs text-amber-200">{direction}</p><p className="mt-1 text-[10px] text-slate-400">WASD mover · Enter interactuar</p></div>
        <div className="pointer-events-auto flex gap-2">{nearby && <button onClick={() => openMission(nearby)} className="rounded-full bg-amber-400 px-4 py-3 text-xs font-black text-slate-950 shadow-xl">{nearby.icon} ENTER</button>}<button onClick={() => openMission()} className="rounded-full bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-xl">📜</button></div>
      </footer>

      <div className="absolute right-3 top-20 z-20 flex flex-col gap-1">{CITY_TARGETS.map((item) => <div key={item.id} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm shadow ${item.id === target.id ? 'border-amber-400 bg-amber-100' : completed.includes(item.id) ? decisionsMade[item.id] ? 'border-emerald-500 bg-emerald-100' : 'border-red-500 bg-red-100' : 'border-slate-300 bg-white'}`}>{completed.includes(item.id) ? decisionsMade[item.id] ? '✓' : '✕' : item.icon}</div>)}</div>

      {modal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl"><p className="text-4xl">{modal.icon}</p><h2 className="mt-2 text-2xl font-black">{modal.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7">{modal.body}</p>{modal.choices && <div className="mt-5 grid gap-2">{modal.choices.map((choice) => <button key={choice.label} onClick={() => choose(choice)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold hover:bg-emerald-50">{choice.label}</button>)}</div>}{!modal.choices && <button onClick={modal.kind === 'result' ? advance : modal.kind === 'victory' ? onExit : () => setModal(null)} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-white">{modal.kind === 'result' ? 'Desbloquear siguiente objetivo →' : 'Cerrar'}</button>}</div></div>}
    </div>
  );
}
