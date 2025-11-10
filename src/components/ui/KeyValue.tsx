interface KeyValueProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function KeyValue({ label, value, className = '' }: KeyValueProps) {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="w-2 h-2 bg-[#252525] rounded-full mt-1.5 mr-3 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#8e8e8e] mb-1">{label}</div>
        <div className="font-medium text-[#252525]">{value}</div>
      </div>
    </div>
  );
}

