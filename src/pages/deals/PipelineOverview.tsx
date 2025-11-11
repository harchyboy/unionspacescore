import { Link } from 'react-router-dom';

export function PipelineOverview() {
  const stages = [
    { name: 'Qualification', count: 3, route: '/deals/qualification' },
    { name: 'Matching & Shortlist', count: 5, route: '/deals/matching' },
    { name: 'Viewings', count: 8, route: '/deals/viewings' },
    { name: 'Proposal Builder', count: 4, route: '/deals/proposal-builder' },
    { name: 'Decision Screen', count: 2, route: '/deals/decision' },
    { name: 'Deal Room Setup', count: 3, route: '/deals/deal-room-setup' },
    { name: 'Heads of Terms', count: 1, route: '/deals/heads-of-terms' },
    { name: 'Legals Tracking', count: 2, route: '/deals/legals' },
    { name: 'Provisional Orders', count: 1, route: '/deals/provisional-orders' },
    { name: 'Handoff to Operations', count: 0, route: '/deals/handoff' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#252525] mb-2">Pipeline Overview</h1>
        <p className="text-[#8e8e8e]">Track all deals through the pipeline stages</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {stages.map((stage, index) => (
          <Link
            key={stage.name}
            to={stage.route}
            className="bg-white p-6 rounded-lg border border-[#E6E6E6] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-semibold text-[#252525]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#252525]">{stage.name}</h3>
                  <p className="text-sm text-[#8e8e8e]">{stage.count} deals in this stage</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-semibold text-[#252525]">{stage.count}</div>
                  <div className="text-xs text-[#8e8e8e]">Active deals</div>
                </div>
                <svg className="w-5 h-5 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
        <h2 className="text-lg font-semibold text-[#252525] mb-4">Pipeline Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Total Deals</div>
            <div className="text-2xl font-semibold text-[#252525]">29</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">In Progress</div>
            <div className="text-2xl font-semibold text-[#252525]">25</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Completed</div>
            <div className="text-2xl font-semibold text-[#252525]">4</div>
          </div>
          <div>
            <div className="text-sm text-[#8e8e8e] mb-1">Success Rate</div>
            <div className="text-2xl font-semibold text-green-600">14%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

