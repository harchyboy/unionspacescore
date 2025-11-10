interface InlineStatProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InlineStat({ label, value, className = '' }: InlineStatProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-[#8e8e8e]">{label}</div>
      <div className="text-lg font-semibold text-[#252525]">{value}</div>
    </div>
  );
}

