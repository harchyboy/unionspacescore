import { Link } from 'react-router-dom';

export function DecisionScreen() {
  const decisions = [
    { id: 1, deal: 'Tech Hub London', company: 'TechCorp Ltd', proposal: 'Proposal #1234', status: 'Pending Decision', deadline: '2024-01-20' },
    { id: 2, deal: 'Creative Space Manchester', company: 'Design Studio', proposal: 'Proposal #1235', status: 'Approved', deadline: '2024-01-18' },
    { id: 3, deal: 'Business Center Birmingham', company: 'Enterprise Inc', proposal: 'Proposal #1236', status: 'Pending Decision', deadline: '2024-01-22' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Decision Screen</h1>
          <p className="text-[#8e8e8e]">Track and manage proposal decisions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/deals"
            className="text-sm text-[#8e8e8e] hover:text-[#252525] flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Pipeline</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] mb-6">
        <div className="p-4 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Pending Decisions</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>Pending Decision</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {decisions.map((decision) => (
            <div key={decision.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{decision.deal}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      decision.status === 'Approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {decision.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {decision.company}</span>
                    <span className="mr-4">Proposal: {decision.proposal}</span>
                    <span>Deadline: {decision.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Proposal
                  </button>
                  {decision.status === 'Approved' && (
                    <Link
                      to="/deals/deal-room-setup"
                      className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                    >
                      Setup Deal Room
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
          <div className="text-sm text-[#8e8e8e] mb-1">Pending Decisions</div>
          <div className="text-2xl font-semibold text-[#252525]">5</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Approved This Month</div>
          <div className="text-2xl font-semibold text-[#252525]">3</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Average Decision Time</div>
          <div className="text-2xl font-semibold text-[#252525]">7 days</div>
        </div>
      </div>
    </div>
  );
}

