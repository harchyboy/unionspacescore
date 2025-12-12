interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  const variants = {
    default: 'bg-[#F0F0F0] text-[#252525]',
    primary: 'bg-[#252525] text-white',
    secondary: 'bg-[#8E8E8E] text-white',
    accent: 'bg-[#252525] text-white', // Consolidated to primary brand color
    success: 'bg-[#252525] text-white', // Consolidated to primary brand color
    warning: 'bg-[#F0F0F0] text-[#252525] border border-[#8E8E8E]',
    destructive: 'bg-white text-[#252525] border border-[#252525]',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

