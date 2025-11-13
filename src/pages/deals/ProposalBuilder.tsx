import { Link, useParams } from 'react-router-dom';

export function ProposalBuilder() {
  const { id } = useParams<{ id: string }>();
  const proposals = [
    { id: 1, deal: 'Tech Hub London', company: 'TechCorp Ltd', status: 'Draft', created: '2024-01-10' },
    { id: 2, deal: 'Creative Space Manchester', company: 'Design Studio', status: 'Sent', created: '2024-01-08' },
    { id: 3, deal: 'Business Center Birmingham', company: 'Enterprise Inc', status: 'Draft', created: '2024-01-12' },
    { id: 4, deal: 'Innovation Lab Leeds', company: 'Startup Co', status: 'Under Review', created: '2024-01-09' },
  ];

  const backLink = id ? `/deals/${id}` : '/deals';
  const backLabel = id ? 'Deal Overview' : 'Pipeline';

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Proposal Builder</h1>
          <p className="text-[#8e8e8e]">Create and manage property proposals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={backLink}
            className="text-sm text-[#8e8e8e] hover:text-[#252525] flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{backLabel}</span>
          </Link>
          {!id && (
            <button className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
              New Proposal
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] mb-6">
        <div className="p-4 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Active Proposals</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>Draft</option>
                <option>Sent</option>
                <option>Under Review</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{proposal.deal}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      proposal.status === 'Sent' 
                        ? 'bg-blue-100 text-blue-700' 
                        : proposal.status === 'Under Review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {proposal.company}</span>
                    <span>Created: {proposal.created}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    Edit
                  </button>
                  {proposal.status === 'Sent' && (
                    <Link
                      to="/deals/decision"
                      className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                    >
                      Track Decision
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Total Proposals</div>
          <div className="text-2xl font-semibold text-[#252525]">15</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Sent This Month</div>
          <div className="text-2xl font-semibold text-[#252525]">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Acceptance Rate</div>
          <div className="text-2xl font-semibold text-green-600">60%</div>
        </div>
      </div>
    </div>
  );
}

