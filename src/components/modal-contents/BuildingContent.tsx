interface BuildingContentProps {
  description: string;
}

export function BuildingContent({ description }: BuildingContentProps) {
  return <p className="text-slate-200 text-xs leading-relaxed">{description}</p>;
}
