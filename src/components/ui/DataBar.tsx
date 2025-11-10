interface DataBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function DataBar({ value, max = 100, label, showValue = true, className = '' }: DataBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-[#8e8e8e]">{label}</div>
          {showValue && <div className="text-lg font-semibold text-[#252525]">{value}%</div>}
        </div>
      )}
      <div className="w-full bg-[#fafafa] rounded-full h-2">
        <div
          className="bg-[#252525] h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

