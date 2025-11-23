import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { DealRoomDeal } from '../../types/dealRoomDashboard';

interface DealCardProps {
  deal: DealRoomDeal;
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

export function DealCard({ deal }: DealCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link
            to={`/deals/${deal.id}`}
            className="text-primary hover:text-primary/80 font-semibold text-base hover:underline block mb-1"
          >
            {deal.name}
          </Link>
          {deal.requirementCode && (
            <div className="text-xs text-secondary mb-2">{deal.requirementCode}</div>
          )}
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant={stageColors[deal.stage] || 'default'} size="sm">
              {deal.stage}
            </Badge>
            <Badge variant={riskColors[deal.status.risk]} size="sm">
              {deal.status.risk}
            </Badge>
            <Badge variant={approvalColors[deal.status.approvals]} size="sm">
              {deal.status.approvals}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-secondary">Property:</span>
          <span className="text-primary font-medium">
            {deal.property.name} {deal.property.unit && `- ${deal.property.unit}`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-secondary">Tenant:</span>
          <span className="text-primary font-medium">{deal.tenant.companyName}</span>
        </div>

        {deal.tenant.mainContact && (
          <div className="flex items-center justify-between">
            <span className="text-secondary">Contact:</span>
            <span className="text-primary">{deal.tenant.mainContact.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-secondary">Owner:</span>
          <div className="flex items-center space-x-2">
            {deal.owner.avatar ? (
              <img
                src={deal.owner.avatar}
                alt={deal.owner.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(deal.owner.name)}
              </div>
            )}
            <span className="text-primary">{deal.owner.name}</span>
          </div>
        </div>

        {deal.commercial.monthlyRent && (
          <div className="flex items-center justify-between">
            <span className="text-secondary">Monthly Rent:</span>
            <span className="text-primary font-medium">
              {formatCurrency(deal.commercial.monthlyRent)}
            </span>
          </div>
        )}

        {deal.nextStep && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E6E6E6]">
            <span className="text-secondary">Next Step:</span>
            <div className="text-right">
              {deal.nextStep.date && (
                <div className="text-xs text-secondary mb-0.5">{deal.nextStep.date}</div>
              )}
              <span className="text-primary text-sm">{deal.nextStep.description}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E6E6E6]">
        <Link
          to={`/deals/${deal.id}`}
          className="block w-full text-center text-primary hover:text-primary/80 font-medium text-sm py-2 hover:underline"
        >
          View Deal
        </Link>
      </div>
    </div>
  );
}

