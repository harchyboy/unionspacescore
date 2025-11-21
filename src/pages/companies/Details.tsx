import { useParams } from 'react-router-dom';
import { useCompanyStore } from '../../store/useCompanyStore';

export function CompanyDetails() {
  const { companyId } = useParams<{ companyId: string }>();
  const { getCompanyById } = useCompanyStore();
  const company = companyId ? getCompanyById(companyId) : undefined;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0F0F0]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {company ? company.name : 'Company Profile'}
          </h1>
          <p className="text-secondary text-sm">
            Company details and information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          {company ? (
            <div>
              <p className="text-lg text-primary">Company: {company.name}</p>
              <p className="text-secondary mt-2">This is a placeholder company profile page.</p>
            </div>
          ) : (
            <div>
              <p className="text-secondary">Company not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

