interface LogsContentProps {
  logs: { time: string; text: string; type: string }[];
}

export function LogsContent({ logs }: LogsContentProps) {
  return (
    <div className="space-y-1">
      {logs.length === 0 ? (
        <p className="text-slate-500 italic text-center py-4">No hay logs.</p>
      ) : (
        logs.map((l, i) => (
          <div
            key={i}
            className={`bg-slate-950 p-2 rounded text-[10px] font-mono border border-slate-800 ${
              l.type === 'error' ? 'text-red-400' : 'text-slate-300'
            }`}
          >
            [{l.time}] {l.text}
          </div>
        ))
      )}
    </div>
  );
}
