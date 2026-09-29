import type { BookChapter } from '@/core/types';

interface BookContentProps {
  chapters: BookChapter[];
}

export function BookContent({ chapters }: BookContentProps) {
  return (
    <div className="space-y-2">
      {chapters.map((c) => (
        <div
          key={c.id}
          className={`bg-slate-800 p-3 rounded-xl border space-y-1 ${
            c.unlocked ? 'border-amber-600/60' : 'border-slate-700 opacity-50'
          }`}
        >
          <span className="font-bold text-amber-400 text-[11px]">{c.title}</span>
          <p className="text-[11px] text-slate-300">
            {c.unlocked
              ? c.content
              : 'Capitulo bloqueado. Avanza en la historia para desbloquear.'}
          </p>
        </div>
      ))}
    </div>
  );
}
