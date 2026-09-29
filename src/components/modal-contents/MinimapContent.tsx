import { useEffect, useRef } from 'react';
import type { MinimapData } from '@/core/types';

interface MinimapContentProps {
  minimapData: MinimapData | null;
}

export function MinimapContent({ minimapData }: MinimapContentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !minimapData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!minimapData) return;

    const scaleX = canvas.width / minimapData.worldSize.width;
    const scaleY = canvas.height / minimapData.worldSize.height;

    minimapData.pois.forEach((poi) => {
      const px = poi.x * scaleX;
      const py = poi.y * scaleY;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px system-ui';
      ctx.fillText(poi.label, px + 8, py + 3);
    });

    const plx = minimapData.playerPos.x * scaleX;
    const ply = minimapData.playerPos.y * scaleY;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(plx, ply, 6, 0, Math.PI * 2);
    ctx.fill();
  }, [minimapData]);

  if (!minimapData) return <p className="text-slate-500">Cargando mapa...</p>;

  const levelLabel =
    minimapData.level === 'main'
      ? 'Hacienda La Amalia (Acto I)'
      : minimapData.level === 'warehouse'
        ? 'Almacen de Suministros'
        : 'Puerto (React Platformer)';

  return (
    <div className="space-y-3">
      <div className="bg-slate-950 h-48 rounded-2xl border border-slate-800 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={300}
          height={180}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
        <p className="text-amber-400 font-bold">Ubicacion: {levelLabel}</p>
        <p className="text-slate-400 font-mono">
          Coordenadas X: {Math.round(minimapData.playerPos.x)} | Y:{' '}
          {Math.round(minimapData.playerPos.y)}
        </p>
        <p className="text-slate-400">
          Total Puntos de Interes: {minimapData.pois.length}
        </p>
      </div>
    </div>
  );
}
