import type { InventoryItem } from '@/core/types';
import type { Recipe } from '@/managers';
import { Package, Wrench } from 'lucide-react';

interface BackpackContentProps {
  inventory: InventoryItem[];
  recipes: Recipe[];
  onCraft: (recipeId: string) => void;
}

export function BackpackContent({ inventory, recipes, onCraft }: BackpackContentProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
          <Package className="w-3 h-3" /> Objetos en Mochila:
        </p>
        {inventory.length === 0 ? (
          <p className="text-slate-500 italic text-center py-2">Mochila vacia.</p>
        ) : (
          inventory.map((i) => (
            <div
              key={i.id}
              className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex justify-between items-center text-xs"
            >
              <span className="text-white">{i.name}</span>
              <span className="text-amber-400 font-mono font-bold">x{i.qty}</span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <p className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
          <Wrench className="w-3 h-3" /> Recetas de Combinacion:
        </p>
        {recipes.map((r) => (
          <div
            key={r.id}
            className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center text-xs gap-2"
          >
            <div className="flex-1">
              <span className="font-bold text-white">{r.name}</span>
              <p className="text-[10px] text-slate-400">{r.desc}</p>
            </div>
            <button
              onClick={() => onCraft(r.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer shrink-0 transition active:scale-95"
            >
              Combinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
