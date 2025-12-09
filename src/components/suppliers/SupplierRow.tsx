import { TableRow, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import type { Supplier } from '../../types/supplier';

interface SupplierRowProps {
  supplier: Supplier;
  onSelect: () => void;
}

export function SupplierRow({ supplier, onSelect }: SupplierRowProps) {
  const primaryContact = supplier.contacts.find((c) => c.isPrimary) || supplier.contacts[0];
  
  // Determine SLA color based on percentage
  const getSlaColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-primary';
    if (percentage >= 80) return 'bg-primary';
    return 'bg-destructive';
  };

  const getSlaTextColor = (percentage: number) => {
    if (percentage < 80) return 'text-destructive';
    return 'text-primary';
  };

  // Format coverage areas
  const formatCoverage = () => {
    if (supplier.coverage.length === 0) return null;
    if (supplier.coverage.length <= 2) {
      return supplier.coverage.map((area, idx) => (
        <span key={idx} className="text-xs text-primary block">{area}</span>
      ));
    }
    return (
      <>
        {supplier.coverage.slice(0, 2).map((area, idx) => (
          <span key={idx} className="text-xs text-primary block">{area}</span>
        ))}
        <span className="text-xs text-secondary">+{supplier.coverage.length - 2} more</span>
      </>
    );
  };

  // Contract status badge variant
  const getContractBadgeVariant = () => {
    switch (supplier.contractStatus) {
      case 'Active':
        return 'primary';
      case 'Trial':
        return 'secondary';
      case 'Suspended':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or actions button
    if ((e.target as HTMLElement).closest('input, button')) {
      return;
    }
    onSelect();
  };

  return (
    <TableRow 
      onClick={handleRowClick}
      className="cursor-pointer"
    >
      <TableCell>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{supplier.initials}</span>
          </div>
          <div>
            <div className="font-semibold text-primary text-sm">{supplier.name}</div>
            {primaryContact && (
              <div className="text-xs text-secondary">
                {primaryContact.name} · {primaryContact.phone}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="default">{supplier.category}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          {formatCoverage()}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-primary text-sm">{supplier.openWorkOrders}</span>
          <span className="text-xs text-secondary">open</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-muted rounded-full h-2 w-16">
            <div
              className={`${getSlaColor(supplier.slaPercentage)} h-2 rounded-full`}
              style={{ width: `${supplier.slaPercentage}%` }}
            ></div>
          </div>
          <span className={`text-sm font-semibold ${getSlaTextColor(supplier.slaPercentage)}`}>
            {supplier.slaPercentage}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getContractBadgeVariant()}>{supplier.contractStatus}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm text-secondary">{supplier.lastJobAt}</span>
      </TableCell>
      <TableCell align="right">
        <button
          className="text-secondary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            // Menu actions would go here
          }}
        >
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </TableCell>
    </TableRow>
  );
}

