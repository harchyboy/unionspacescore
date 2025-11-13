import { useParams, useNavigate, Link } from 'react-router-dom';

export function ProposalConfiguration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSaveConfiguration = () => {
    // In production, this would save the configuration to the API
    // and update the deal's proposalConfigStatus
    console.log('Saving proposal configuration for deal:', id);
    
    // After saving, navigate to Proposal Builder
    navigate(`/deals/${id}/proposal/builder`);
  };

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to={`/deals/${id}`}
            className="text-sm text-[#8e8e8e] hover:text-[#252525] flex items-center space-x-2 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Deal Overview</span>
          </Link>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Proposal Configuration</h1>
          <p className="text-[#8e8e8e]">Configure deal type, services, and proposal structure</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#252525] mb-4">Deal Type Selection</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-[#E6E6E6] rounded-lg p-6 cursor-pointer hover:border-[#252525] transition-all">
            <h3 className="text-lg font-semibold text-[#252525] mb-2">All Inclusive</h3>
            <p className="text-sm text-[#8e8e8e]">All services bundled with the landlord</p>
          </div>
          <div className="border-2 border-[#E6E6E6] rounded-lg p-6 cursor-pointer hover:border-[#252525] transition-all">
            <h3 className="text-lg font-semibold text-[#252525] mb-2">Bolt On</h3>
            <p className="text-sm text-[#8e8e8e]">Services contracted directly with UNION</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#252525] mb-4">Services Configuration</h2>
        <p className="text-[#8e8e8e] mb-4">Select which services are included and their contract structure...</p>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={() => navigate(`/deals/${id}`)}
            className="px-4 py-2 text-sm text-[#8e8e8e] hover:text-[#252525] border border-[#E6E6E6] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveConfiguration}
            className="px-6 py-2 text-sm bg-[#252525] text-white rounded-lg font-medium hover:bg-opacity-90"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

