import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DialogueOption {
  text: string;
  action: () => void;
}

export type ModalState =
  | { type: 'none' }
  | { type: 'menu' }
  | { type: 'book' }
  | { type: 'backpack' }
  | { type: 'logs' }
  | { type: 'minimap' }
  | { type: 'building'; title: string; description: string }
  | { type: 'dialogue'; name: string; text: string; options: DialogueOption[] };

interface GameModalProps {
  state: ModalState;
  onClose: () => void;
  children?: ReactNode;
}

export function GameModal({ state, onClose, children }: GameModalProps) {
  if (state.type === 'none') return null;

  const titleMap: Record<string, string> = {
    menu: 'Menu Principal',
    book: 'Libro Familiar de La Amalia',
    backpack: 'Inventario y Recetas',
    logs: 'Consola de Logs',
    minimap: 'Mapa Tactico Global',
    building: state.type === 'building' ? state.title : '',
    dialogue: state.type === 'dialogue' ? state.name : '',
  };

  return (
    <div
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">
            {titleMap[state.type]}
          </h2>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Cerrar
          </button>
        </div>
        <div className="text-slate-300 text-xs mb-4 overflow-y-auto flex-grow text-left space-y-3 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
