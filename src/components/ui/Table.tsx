interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-[#fafafa] border-b border-[#E6E6E6]">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function TableHeaderCell({ children, align = 'left', className = '' }: TableHeaderCellProps) {
  const alignClasses = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  return (
    <th className={`px-4 py-3 text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider ${alignClasses[align]} ${className}`}>
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-[#E6E6E6]">{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-[#fafafa] transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function TableCell({ children, align = 'left', className = '' }: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  return (
    <td className={`px-4 py-4 text-sm text-[#252525] ${alignClasses[align]} ${className}`}>{children}</td>
  );
}

