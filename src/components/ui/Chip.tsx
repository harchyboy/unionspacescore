interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-[#252525] text-white',
    secondary: 'bg-[#8e8e8e] text-white',
    accent: 'bg-green-500 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-black',
    destructive: 'bg-red-500 text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

