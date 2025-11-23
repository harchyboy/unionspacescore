import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { TableRow, TableCell } from '../ui/Table';
import type { DealRoomDeal } from '../../types/dealRoomDashboard';

interface DealRowProps {
  deal: DealRoomDeal;
  index?: number;
}

const stageColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  'Inquiry': 'default',
  'Viewing': 'primary',
  'Heads of Terms': 'warning',
  'Legals': 'warning',
  'Signed': 'success',
  'Lost': 'destructive',
};

const riskColors: Record<string, 'destructive' | 'warning' | 'success'> = {
  'High': 'destructive',
  'Medium': 'warning',
  'Low': 'success',
};

const approvalColors: Record<string, 'warning' | 'success'> = {
  'Pending': 'warning',
  'Clear': 'success',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DealRow({ deal, index }: DealRowProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableRow className={index !== undefined && index % 2 === 1 ? 'bg-[#fafafa]' : ''}>
      {/* Deal Name */}
      <TableCell>
        <Link
          to={`/deals/${deal.id}`}
          className="text-primary hover:text-primary/80 font-medium hover:underline"
        >
          {deal.name}
        </Link>
        {deal.requirementCode && (
          <div className="text-xs text-secondary mt-0.5">{deal.requirementCode}</div>
        )}
      </TableCell>

      {/* Property */}
      <TableCell>
        <div className="text-sm text-primary">{deal.property.name}</div>
        {(deal.property.unit || deal.property.floor) && (
          <div className="text-xs text-secondary">
            {deal.property.unit || deal.property.floor}
          </div>
        )}
      </TableCell>

      {/* Tenant */}
      <TableCell>
        <div className="text-sm text-primary">{deal.tenant.companyName}</div>
        {deal.tenant.mainContact && (
          <div className="text-xs text-secondary">{deal.tenant.mainContact.name}</div>
        )}
      </TableCell>

      {/* Stage */}
      <TableCell>
        <Badge variant={stageColors[deal.stage] || 'default'} size="sm">
          {deal.stage}
        </Badge>
      </TableCell>

      {/* Owner */}
      <TableCell>
        <div className="flex items-center space-x-2">
          {deal.owner.avatar ? (
            <img
              src={deal.owner.avatar}
              alt={deal.owner.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(deal.owner.name)}
            </div>
          )}
          <span className="text-sm text-primary">{deal.owner.name}</span>
        </div>
      </TableCell>

      {/* Commercial */}
      <TableCell className="text-right">
        {deal.commercial.monthlyRent && (
          <div className="text-sm font-medium text-primary">
            {formatCurrency(deal.commercial.monthlyRent)}/mo
          </div>
        )}
        {deal.commercial.totalAnnualValue && (
          <div className="text-xs text-secondary">
            {formatCurrency(deal.commercial.totalAnnualValue)}/yr
          </div>
        )}
      </TableCell>

      {/* Status Flags */}
      <TableCell>
        <div className="flex items-center space-x-2">
          <Badge variant={riskColors[deal.status.risk]} size="sm">
            {deal.status.risk}
          </Badge>
          <Badge variant={approvalColors[deal.status.approvals]} size="sm">
            {deal.status.approvals}
          </Badge>
        </div>
      </TableCell>

      {/* Next Step */}
      <TableCell>
        {deal.nextStep ? (
          <div>
            {deal.nextStep.date && (
              <div className="text-xs text-secondary mb-0.5">{deal.nextStep.date}</div>
            )}
            <div className="text-sm text-primary">{deal.nextStep.description}</div>
          </div>
        ) : (
          <span className="text-sm text-secondary">None</span>
        )}
      </TableCell>

      {/* View Action */}
      <TableCell className="text-right">
        <Link
          to={`/deals/${deal.id}`}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View
        </Link>
      </TableCell>
    </TableRow>
  );
}

