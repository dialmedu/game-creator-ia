import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface DukubariRunnerProps {
  onExit: () => void;
}

type Point = { x: number; y: number };
type Choice = { label: string; result: string };
type Stage = {
  id: string;
  title: string;
  icon: string;
  target: string;
  x: number;
  y: number;
  prompt: string;
  choices: Choice[];
};
type Modal = {
  kind: 'mission' | 'result' | 'victory';
  title: string;
  body: string;
  icon: string;
  choices?: Choice[];
} | null;

const stages: Stage[] = [
  { id: 'identity', title: 'Conseguir una identidad', icon: '🪪', target: 'Funcionario', x: 12, y: 38, prompt: 'El funcionario quiere registrar tu nombre, profesión y opinión. En Dukubari, no tener una opinión es una anomalía.', choices: [{ label: 'Aceptar una identidad oficial', result: 'Resultado invertido: el sistema te registra como ANOMALÍA por aceptar demasiado.' }, { label: 'Rechazar la identidad', result: 'Resultado invertido: el sistema te asigna automáticamente el perfil Ciudadano Perfecto.' }] },
  { id: 'pet', title: 'Resolver la mascota', icon: '🐾', target: 'Centro de mascotas', x: 25, y: 62, prompt: 'La ciudad exige que declares si quieres una mascota. Tu respuesta será interpretada al revés.', choices: [{ label: 'Adoptar una mascota', result: 'Resultado invertido: la mascota desaparece del registro. Para el sistema nunca existió.' }, { label: 'No adoptar una mascota', result: 'Resultado invertido: aparece una mascota no solicitada y te sigue a todas partes.' }] },
  { id: 'schedule', title: 'Elegir horario de trabajo', icon: '🕒', target: 'Oficina de horarios', x: 38, y: 38, prompt: 'Debes decidir cuándo trabajar para poder continuar tu vida en la ciudad.', choices: [{ label: 'Trabajar de día', result: 'Resultado invertido: el cielo se vuelve de noche porque tu día acaba de comenzar.' }, { label: 'Trabajar de noche', result: 'Resultado invertido: sale el sol a medianoche para celebrar tu productividad.' }] },
  { id: 'study', title: 'Estudiar o no estudiar', icon: '🎓', target: 'Centro de educación', x: 51, y: 62, prompt: 'El sistema quiere saber si deseas aprender. Cualquier respuesta será convertida en su opuesto.', choices: [{ label: 'Estudiar', result: 'Resultado invertido: aprendes mucho, pero tu título dice que no sabes nada.' }, { label: 'No estudiar', result: 'Resultado invertido: el sistema te gradúa con honores por no hacer preguntas.' }] },
  { id: 'marriage', title: 'Decidir sobre el matrimonio', icon: '💍', target: 'Oficina de vínculos', x: 64, y: 38, prompt: 'Una pantalla te pregunta qué tipo de vida deseas compartir.', choices: [{ label: 'Casarse', result: 'Resultado invertido: tu pareja desaparece del registro civil.' }, { label: 'Permanecer soltero', result: 'Resultado invertido: el sistema te asigna una pareja que nunca pediste.' }] },
  { id: 'work', title: 'Conseguir trabajo', icon: '💼', target: 'Distrito laboral', x: 77, y: 62, prompt: 'Debes elegir cómo sostener tu vida en Dukubari.', choices: [{ label: 'Trabajar', result: 'Resultado invertido: el sistema te declara desempleado por exceso de productividad.' }, { label: 'No trabajar', result: 'Resultado invertido: recibes un cargo de máxima responsabilidad.' }] },
  { id: 'car', title: 'Decidir sobre el auto', icon: '🚗', target: 'Concesionario', x: 88, y: 38, prompt: 'La ciudad dice que la libertad necesita un vehículo.', choices: [{ label: 'Comprar un auto', result: 'Resultado invertido: recibes un auto que no puede conducirse.' }, { label: 'No comprar un auto', result: 'Resultado invertido: aparece un vehículo asignado con tu nombre.' }] },
  { id: 'exit', title: 'Salir del mundo al revés', icon: '🚪', target: 'Centro del Orden', x: 95, y: 62, prompt: 'Has cruzado las decisiones de la vida cotidiana. Solo queda decidir qué hacer con la verdad y salir del sistema.', choices: [{ label: 'Abrir todos los archivos', result: 'La verdad queda libre. La ciudad tendrá que decidir por sí misma.' }, { label: 'Apagar el sistema', result: 'El Orden se apaga. Nadie vuelve a decirte qué debes querer.' }, { label: 'Aceptar el Orden', result: 'Te conviertes en el nuevo Director. Ahora tú defines las reglas.' }] },
];

export function DukubariRunner({ onExit }: DukubariRunnerProps) {
  const [player, setPlayer] = useState<Point>({ x: 7, y: 50 });
  const [stageIndex, setStageIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [consciousness, setConsciousness] = useState(0);
  const [worldMode, setWorldMode] = useState<'day' | 'night'>('day');
  const [modal, setModal] = useState<Modal>(null);
  const [nearby, setNearby] = useState(false);
  const openedStageRef = useRef<string | null>(null);
  const stage = stages[stageIndex];

  const checkNearby = useCallback((position: Point) => {
    setNearby(Math.hypot(stage.x - position.x, stage.y - position.y) < 9);
  }, [stage]);

  const choose = useCallback((choice: Choice) => {
    if (stage.id === 'schedule') {
      setWorldMode(choice.label.includes('día') ? 'night' : 'day');
    }
    setConsciousness((value) => value + 1);
    setCompleted((items) => [...new Set([...items, stage.id])]);
    setModal({ kind: 'result', title: 'Consecuencia invertida', icon: '🔄', body: choice.result });
  }, [stage]);

  const openMission = useCallback(() => {
    if (!nearby) return;
    setModal({ kind: 'mission', title: stage.title, icon: stage.icon, body: `${stage.prompt}\n\nVe hacia ${stage.icon} ${stage.target}. Lee la decisión y elige una opción.` , choices: stage.choices });
  }, [nearby, stage]);

  useEffect(() => {
    openedStageRef.current = null;
    setNearby(false);
  }, [stage.id]);

  useEffect(() => {
    if (nearby && !modal && openedStageRef.current !== stage.id && !completed.includes(stage.id)) {
      openedStageRef.current = stage.id;
      setModal({ kind: 'mission', title: stage.title, icon: stage.icon, body: `${stage.prompt}\n\nMisión: llega al objetivo y decide cómo continuar.`, choices: stage.choices });
    }
  }, [completed, modal, nearby, stage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'enter') { event.preventDefault(); openMission(); return; }
      const directions: Record<string, Point> = {
        w: { x: 0, y: -1 }, a: { x: -1, y: 0 }, s: { x: 0, y: 1 }, d: { x: 1, y: 0 },
        arrowup: { x: 0, y: -1 }, arrowleft: { x: -1, y: 0 }, arrowdown: { x: 0, y: 1 }, arrowright: { x: 1, y: 0 },
      };
      if (!directions[key]) return;
      event.preventDefault();
      setPlayer((current) => {
        const next = { x: Math.max(5, Math.min(97, current.x + directions[key].x * 2)), y: Math.max(20, Math.min(82, current.y + directions[key].y * 2)) };
        checkNearby(next);
        return next;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checkNearby, openMission]);

  const direction = useMemo(() => {
    if (Math.abs(stage.x - player.x) > 7) return stage.x > player.x ? '➡️ Ve hacia la derecha' : '⬅️ Ve hacia la izquierda';
    if (Math.abs(stage.y - player.y) > 7) return stage.y > player.y ? '⬇️ Ve hacia abajo' : '⬆️ Ve hacia arriba';
    return '📍 Estás en el objetivo';
  }, [player, stage]);
  const progress = Math.round((completed.length / stages.length) * 100);
  const missionRead = completed.includes(stage.id);

  const nextStage = () => {
    setModal(null);
    if (stageIndex === stages.length - 1) {
      setModal({ kind: 'victory', title: 'Has sobrevivido a Dukubari', icon: '🏆', body: `Has salido del mundo al revés. Conciencia obtenida: ${consciousness}. Tus decisiones no eran correctas o incorrectas: eran pruebas para descubrir quién decide por ti.` });
      return;
    }
    setStageIndex((value) => value + 1);
    setPlayer({ x: 7, y: 50 });
  };

  return (
    <div className={`fixed inset-0 overflow-hidden transition-colors duration-700 ${worldMode === 'night' ? 'bg-[#101a3a]' : 'bg-[#e7f4ef]'}`}>
      <div className={`absolute inset-0 ${worldMode === 'night' ? 'bg-[radial-gradient(circle_at_50%_20%,#405080,#101a3a_65%,#080d20)]' : 'bg-[radial-gradient(circle_at_50%_20%,#ffffff,#d6eee6_55%,#9dccbe)]'}`} />
      <header className="absolute left-3 right-3 top-3 z-30 flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-lg"><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">🏙️ DUKUBARI · RUTA DE SUPERVIVENCIA</p><h1 className="text-lg font-black md:text-2xl">Elige. Sobrevive. Descubre.</h1><p className="text-xs text-slate-500">Progreso: {progress}% · {worldMode === 'night' ? '🌙 mundo nocturno' : '☀️ mundo diurno'}</p></div>
        <div className="flex items-center gap-2"><div className="rounded-2xl bg-slate-950/90 px-3 py-2 text-xs font-bold text-white shadow-lg">💡 {consciousness}</div><button onClick={onExit} className="rounded-2xl border border-slate-300 bg-white/90 px-3 py-2 text-xs font-bold shadow-lg">Salir</button></div>
      </header>

      <section className="absolute left-3 right-3 top-32 z-20 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl">
        <div className="relative flex items-center justify-between gap-1 md:gap-3">
          <div className="absolute left-3 right-3 top-7 h-1 bg-slate-200" /><div className="absolute left-3 top-7 h-1 bg-emerald-400 transition-all" style={{ width: `${Math.max(0, progress)}%` }} />
          {stages.map((item, index) => <div key={item.id} className="relative z-10 flex min-w-0 flex-1 flex-col items-center"><div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl shadow ${index === stageIndex ? 'border-amber-400 bg-amber-100 ring-4 ring-amber-300/40' : completed.includes(item.id) ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300 bg-slate-100'}`}>{completed.includes(item.id) ? '✅' : item.icon}</div><span className="mt-1 hidden max-w-20 truncate text-[9px] font-bold text-slate-600 sm:block">{item.target}</span>{index === stageIndex && <span className="absolute -top-5 animate-bounce text-lg">⬇️</span>}</div>)}
        </div>
      </section>

      <main className="absolute inset-x-0 bottom-0 top-56 z-10"><div className="absolute inset-x-0 bottom-0 h-1/2 border-t-8 border-emerald-700/30 bg-emerald-200/50" /><div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-xl border-4 border-slate-700 bg-slate-900 px-4 py-2 text-center text-white shadow-xl"><p className="text-2xl">📺</p><p className="text-[10px] font-black tracking-widest">TODO FUNCIONA COMO DEBE</p></div>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100" style={{ left: `${player.x}%`, top: `${player.y}%` }}><div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-2xl shadow-xl">🧑</div><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[9px] font-bold text-white">DESCONOCIDO</span></div>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${stage.x}%`, top: `${stage.y}%` }}><div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 bg-amber-100 text-4xl shadow-xl ${nearby ? 'border-amber-400 ring-8 ring-amber-300/40' : 'border-white'}`}>{stage.icon}</div><p className="mt-2 whitespace-nowrap rounded-lg bg-white/90 px-3 py-1 text-xs font-black shadow">{stage.target}</p><p className="mt-1 text-xs font-black text-amber-700">OBJETIVO</p></div>
      </main>

      <aside className="absolute bottom-4 left-3 z-30 w-72 rounded-2xl bg-slate-950/90 p-4 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">🎯 Misión activa</p><p className="mt-1 text-sm font-black">{stage.icon} {stage.title}</p><p className="mt-2 text-xs text-amber-200">{direction}</p><p className="mt-2 text-[10px] text-slate-400">WASD mover · ENTER interactuar</p></aside>
      <div className="absolute bottom-5 right-4 z-30 flex gap-2">{!missionRead && <button onClick={openMission} className="rounded-full bg-amber-500 px-5 py-4 text-xs font-black text-slate-950 shadow-xl">{stage.icon} ENTER</button>}<button onClick={() => setModal({ kind: 'mission', title: stage.title, icon: stage.icon, body: stage.prompt, choices: missionRead ? undefined : stage.choices })} className="rounded-full bg-slate-950 px-4 py-4 text-xs font-black text-white shadow-xl">📜 Misión</button></div>

      {modal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-slate-950 p-6 text-white shadow-2xl"><p className="text-4xl">{modal.icon}</p><h2 className="mt-2 text-2xl font-black">{modal.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200">{modal.body}</p>{modal.choices && <div className="mt-5 grid gap-2">{modal.choices.map((choice) => <button key={choice.label} onClick={() => choose(choice)} className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-left text-sm font-bold text-emerald-100 hover:bg-emerald-500/30">{choice.label}</button>)}</div>}{!modal.choices && <button onClick={modal.kind === 'result' ? nextStage : () => setModal(null)} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950">{modal.kind === 'result' ? 'Desbloquear siguiente objetivo →' : modal.kind === 'victory' ? 'Volver a la plataforma' : 'Cerrar misión'}</button>}</div></div>}
    </div>
  );
}
