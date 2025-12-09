import { TableRow, TableCell } from '../ui/Table';
import type { Company } from '../../types/company';

interface CompanyRowProps {
  company: Company;
  onSelect?: () => void;
}

export function CompanyRow({ company, onSelect }: CompanyRowProps) {
  // Generate initials from company name
  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Type metadata for badge styling
  const getTypeMeta = (type: string | null | undefined) => {
    switch (type) {
      case 'Brokerage':
        return { label: 'Brokerage', badgeClass: 'bg-black text-white' };
      case 'Landlord':
        return { label: 'Landlord', badgeClass: 'bg-secondary text-white' };
      case 'Tenant':
        return { label: 'Tenant', badgeClass: 'bg-accent text-white' };
      case 'Supplier':
        return { label: 'Supplier', badgeClass: 'bg-muted text-primary' };
      default:
        return { label: type || 'Company', badgeClass: 'bg-muted text-primary' };
    }
  };

  const typeMeta = getTypeMeta(company.type);

  return (
    <TableRow onClick={onSelect} className="group">
      {/* Checkbox */}
      <TableCell>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>

      {/* Company Name */}
      <TableCell>
        <div className="flex items-center space-x-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
          )}
          <div>
            <div className="font-medium text-primary group-hover:text-primary/80 transition-colors">
              {company.name}
            </div>
            {company.industry && (
              <div className="text-xs text-secondary">{company.industry}</div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeMeta.badgeClass}`}
        >
          {typeMeta.label}
        </span>
      </TableCell>

      {/* Location */}
      <TableCell>
        <span className="text-sm text-primary">
          {company.city || '-'}
        </span>
      </TableCell>

      {/* Website */}
      <TableCell>
        {company.website ? (
          <a
            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        ) : (
          <span className="text-sm text-secondary">-</span>
        )}
      </TableCell>

      {/* Phone */}
      <TableCell>
        <span className="text-sm text-primary">{company.phone || '-'}</span>
      </TableCell>

      {/* Contacts */}
      <TableCell>
        {company.contacts && company.contacts.length > 0 ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary">{company.contacts[0].name}</span>
            {company.contacts.length > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-secondary">
                +{company.contacts.length - 1} more
              </span>
            )}
          </div>
        ) : company.contactCount && company.contactCount > 0 ? (
          <span className="text-sm text-secondary">{company.contactCount} contact{company.contactCount !== 1 ? 's' : ''}</span>
        ) : (
          <span className="text-sm text-secondary">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}
