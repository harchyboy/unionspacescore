import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import type { Deal } from '../../types/deal';

// Mock deal data - in production this would come from an API
const mockDeal: Deal = {
  id: '1',
  name: 'Tech Hub London',
  tenant: 'TechCorp Ltd',
  property: '42 Moorgate, Floor 7',
  stage: 'Viewings',
  status: 'Active',
  proposalConfigStatus: 'none', // This would come from the API
  // hasProposalConfiguration: false, // Alternative boolean flag
};

export function DealOverview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal] = useState<Deal>(mockDeal); // In production, use useDeal(id) hook

  const handleGenerateProposal = () => {
    // Determine if proposal configuration exists
    // Check both the status field and boolean flag for flexibility
    // Safeguard: If flag is undefined, treat it as "no configuration"
    const hasConfig = 
      deal.proposalConfigStatus === 'draft' || 
      deal.proposalConfigStatus === 'complete' ||
      deal.hasProposalConfiguration === true;

    // Log for debugging in dev mode
    if (process.env.NODE_ENV === 'development') {
      const status = deal.proposalConfigStatus;
      const hasBool = deal.hasProposalConfiguration;
      
      // Warn if flag is in an unexpected state
      if (status && !['none', 'draft', 'complete'].includes(status)) {
        console.warn('Unexpected proposalConfigStatus value:', status, 'for deal:', id);
      }
      
      console.log('Generate Proposal clicked:', {
        dealId: id,
        proposalConfigStatus: status,
        hasProposalConfiguration: hasBool,
        routingTo: hasConfig ? 'builder' : 'configure',
      });
    }

    if (!hasConfig) {
      // No configuration on record → send user to Proposal Configuration
      navigate(`/deals/${id}/proposal/configure`);
    } else {
      // Configuration exists → send user to Proposal Builder
      navigate(`/deals/${id}/proposal/builder`);
    }
  };

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/deals"
            className="text-sm text-[#8e8e8e] hover:text-[#252525] flex items-center space-x-2 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Pipeline</span>
          </Link>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Deal Overview</h1>
          <p className="text-[#8e8e8e]">{deal.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateProposal}
            className="bg-[#252525] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center space-x-2"
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span>Generate Proposal</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#252525] mb-4">Deal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Tenant</div>
            <div className="text-base font-medium text-[#252525]">{deal.tenant || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Property</div>
            <div className="text-base font-medium text-[#252525]">{deal.property || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Stage</div>
            <div className="text-base font-medium text-[#252525]">{deal.stage || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Status</div>
            <div className="text-base font-medium text-[#252525]">{deal.status || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-lg font-semibold text-[#252525] mb-4">Deal Details</h2>
        <p className="text-[#8e8e8e]">Deal overview content will go here...</p>
      </div>
    </div>
  );
}

