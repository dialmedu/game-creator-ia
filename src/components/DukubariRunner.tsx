import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, FileText, HelpCircle, MessageCircle, Search, Sparkles } from 'lucide-react';

interface DukubariRunnerProps {
  onExit: () => void;
}

type Point = { x: number; y: number };
type Modal = { title: string; body: string; icon: string } | null;

const objects = [
  { id: 'official', x: 50, y: 18, icon: '📺', name: 'Pantalla central', hint: 'TODO FUNCIONA COMO DEBE', action: 'official' },
  { id: 'official', x: 25, y: 42, icon: '🧍', name: 'Funcionario', hint: 'Asigna identidades', action: 'official' },
  { id: 'mira', x: 73, y: 42, icon: '🗂️', name: 'Mira, archivista', hint: 'Guarda lo que nunca existió', action: 'mira' },
  { id: 'mirror', x: 25, y: 70, icon: '🪞', name: 'Espejo', hint: 'Observa lo que otros no ven', action: 'mirror' },
  { id: 'archive', x: 74, y: 70, icon: '📁', name: 'Archivo 17', hint: 'Misión bloqueada', action: 'archive' },
] as const;

export function DukubariRunner({ onExit }: DukubariRunnerProps) {
  const [player, setPlayer] = useState<Point>({ x: 50, y: 55 });
  const [consciousness, setConsciousness] = useState(0);
  const [identity, setIdentity] = useState('NO DEFINIDA');
  const [mission, setMission] = useState('Habla con el funcionario');
  const [modal, setModal] = useState<Modal>({
    title: 'Bienvenido a Dukubari',
    icon: '🏙️',
    body: 'Aquí todo funciona como debe. Explora la estación, habla con el funcionario y descubre qué ocurre cuando una persona no tiene una opinión registrada.',
  });
  const [nearby, setNearby] = useState<(typeof objects)[number] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const findNearby = useCallback((position: Point) => {
    return objects.find((object) => Math.hypot(object.x - position.x, object.y - position.y) < 12) || null;
  }, []);

  const interact = useCallback((target = nearby) => {
    if (!target) return;
    if (target.action === 'official') {
      setIdentity('DESCONOCIDO · PROFESIÓN PENDIENTE');
      setMission('Habla con Mira en el archivo');
      setModal({ title: 'Funcionario · 🪪', icon: '🧍', body: 'Nombre: DESCONOCIDO. Profesión: PENDIENTE. Opinión: NO ASIGNADA. En Dukubari una persona sin opinión registrada es una anomalía.' });
    } else if (target.action === 'mira') {
      setMission('Examina el espejo');
      setModal({ title: 'Mira · 🗂️', icon: '🗂️', body: 'En Dukubari nadie pierde la memoria. La memoria se corrige. Si quieres saber quién eres, mira aquello que la ciudad intenta ocultar.' });
    } else if (target.action === 'mirror') {
      setRevealed(true);
      setConsciousness((value) => Math.max(value, 1));
      setMission('Encuentra el Archivo 17');
      setModal({ title: 'Contradicción descubierta · 🪞', icon: '🪞', body: 'VERSIÓN OFICIAL: Centro de Orientación. REALIDAD: Centro de control de opiniones. Has obtenido +1 CONCIENCIA.' });
    } else if (target.action === 'archive') {
      if (!revealed) {
        setModal({ title: 'Archivo 17 · 🔒', icon: '🔒', body: 'La puerta no reconoce tu identidad. Primero debes descubrir una contradicción.' });
      } else {
        setConsciousness((value) => value + 1);
        setMission('Decide qué hacer con la verdad');
        setModal({ title: 'Archivo 17 · 📁', icon: '📁', body: 'Dentro encuentras una fotografía de hace 20 años. En ella aparece alguien idéntico a ti frente a una máquina del Orden.' });
      }
    }
  }, [nearby, revealed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'enter') {
        event.preventDefault();
        interact();
        return;
      }
      if (key === ' ' || event.code === 'Space') {
        event.preventDefault();
        setModal({ title: 'Observación · 👁️', icon: '👁️', body: nearby ? `${nearby.name}: ${nearby.hint}. Mira con atención: lo evidente no siempre es lo real.` : 'No hay nada cercano que observar.' });
        return;
      }
      const directions: Record<string, Point> = {
        w: { x: 0, y: -1 }, a: { x: -1, y: 0 }, s: { x: 0, y: 1 }, d: { x: 1, y: 0 },
        arrowup: { x: 0, y: -1 }, arrowleft: { x: -1, y: 0 }, arrowdown: { x: 0, y: 1 }, arrowright: { x: 1, y: 0 },
      };
      const direction = directions[key];
      if (direction) {
        event.preventDefault();
        setPlayer((current) => {
          const next = { x: Math.max(8, Math.min(92, current.x + direction.x * 2)), y: Math.max(12, Math.min(86, current.y + direction.y * 2)) };
          setNearby(findNearby(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [findNearby, interact, nearby]);

  const nearbyLabel = useMemo(() => nearby ? `${nearby.icon} ${nearby.name} · ENTER` : 'Explora la estación', [nearby]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#e8f4f1] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,#ffffff_0%,#d5ebe5_45%,#9fcfc4_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#bdded2] border-t-8 border-[#79b5a4]" />

      <header className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/90 border border-emerald-200 shadow-lg px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700 font-bold">🏙️ DUKUBARI</p>
          <h1 className="text-lg md:text-2xl font-black">Encuentra quién eres</h1>
          <p className="text-xs text-slate-500">Acto I · Bienvenido a la ciudad perfecta</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-slate-950/90 text-white px-3 py-2 text-xs font-bold shadow-lg">💡 Conciencia: {consciousness}</div>
          <button onClick={onExit} className="rounded-2xl bg-white/90 border border-slate-300 px-3 py-2 text-xs font-bold shadow-lg hover:bg-white">Salir</button>
        </div>
      </header>

      <div className="absolute left-3 top-32 z-20 w-64 rounded-2xl bg-slate-950/90 text-white p-4 shadow-xl">
        <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">🪪 Identidad</p>
        <p className="mt-1 text-sm font-bold">{identity}</p>
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">🎯 Misión actual</p>
          <p className="mt-1 text-xs text-slate-200">{mission}</p>
        </div>
      </div>

      <div className="absolute inset-0 z-10" aria-label="Estación de Dukubari">
        <div className="absolute left-[42%] top-[27%] h-28 w-40 rounded-t-3xl border-4 border-white/80 bg-[#f8d878] shadow-xl md:h-40 md:w-56">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black shadow">🏛️ ESTACIÓN CENTRAL</span>
          </div>
          <div className="absolute bottom-0 left-1/2 h-20 w-14 -translate-x-1/2 rounded-t-xl bg-[#6e9eb0] border-4 border-white" />
          <div className="absolute top-5 left-5 h-8 w-8 rounded bg-[#82b8c9] border-2 border-white" />
          <div className="absolute top-5 right-5 h-8 w-8 rounded bg-[#82b8c9] border-2 border-white" />
        </div>

        <div className="absolute left-[39%] top-[12%] -translate-x-1/2 rounded-xl border-4 border-slate-700 bg-slate-900 px-4 py-2 text-center text-white shadow-xl">
          <p className="text-2xl">📺</p><p className="text-[10px] font-black tracking-widest">TODO FUNCIONA COMO DEBE</p>
          {revealed && <p className="mt-1 text-[9px] text-amber-300">...SI NO PREGUNTAS</p>}
        </div>

        {objects.filter((object) => object.id !== 'official').map((object) => (
          <div key={`${object.id}-${object.x}`} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${object.x}%`, top: `${object.y}%` }}>
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 text-3xl shadow-xl ${nearby?.x === object.x ? 'border-amber-400 ring-4 ring-amber-300/50 scale-110' : 'border-white/90'} ${object.id === 'mirror' ? 'bg-cyan-200' : object.id === 'archive' ? 'bg-amber-200' : 'bg-white'}`}>
              {object.icon}
            </div>
            <div className="mt-2 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold shadow">{object.name}</div>
          </div>
        ))}

        <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100" style={{ left: `${player.x}%`, top: `${player.y}%` }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-2xl shadow-xl">🧑</div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[9px] font-bold text-white">DESCONOCIDO</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-center shadow-xl">
        <p className="text-xs font-black text-slate-800">{nearbyLabel}</p>
        <p className="mt-1 text-[10px] text-slate-500">WASD mover · ENTER interactuar · ESPACIO observar</p>
      </div>

      {nearby && (
        <button
          onClick={() => interact()}
          className="absolute bottom-24 right-5 z-30 rounded-full bg-amber-500 px-5 py-4 text-xs font-black text-slate-950 shadow-xl hover:bg-amber-400"
        >
          {nearby.icon} ENTER
        </button>
      )}
      <button
        onClick={() => setModal({ title: 'Observación · 👁️', icon: '👁️', body: nearby ? `${nearby.name}: ${nearby.hint}. Pulsa ENTER para actuar.` : 'No hay nada cercano que observar.' })}
        className="absolute bottom-24 right-28 z-30 rounded-full bg-slate-900 px-5 py-4 text-xs font-black text-white shadow-xl hover:bg-slate-700"
      >
        👁️
      </button>

      {modal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-950 p-6 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-4xl">{modal.icon}</p><h2 className="mt-2 text-2xl font-black">{modal.title}</h2></div>
              <button onClick={() => setModal(null)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20">Cerrar</button>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-200">{modal.body}</p>
            <button onClick={() => setModal(null)} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400">Continuar explorando</button>
          </div>
        </div>
      )}
    </div>
  );
}
