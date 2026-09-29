import type { DialogueOption } from '@/components/GameModal';

interface DialogueContentProps {
  text: string;
  options: DialogueOption[];
  onOptionClick: (opt: DialogueOption) => void;
}

export function DialogueContent({ text, options, onOptionClick }: DialogueContentProps) {
  return (
    <div className="space-y-3">
      <p className="text-slate-200 text-xs leading-relaxed">{text}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onOptionClick(opt)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition active:scale-95"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
