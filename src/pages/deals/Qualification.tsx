import { Link } from 'react-router-dom';

export function Qualification() {
  const deals = [
    { id: 1, name: 'Tech Hub London', company: 'TechCorp Ltd', value: '£450K', status: 'New' },
    { id: 2, name: 'Creative Space Manchester', company: 'Design Studio', value: '£320K', status: 'Reviewing' },
    { id: 3, name: 'Business Center Birmingham', company: 'Enterprise Inc', value: '£680K', status: 'New' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Qualification</h1>
          <p className="text-[#8e8e8e]">Review and qualify new opportunities</p>
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
          <button className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
            Add New Deal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] mb-6">
        <div className="p-4 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Deals to Qualify</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search deals..."
                className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {deals.map((deal) => (
            <div key={deal.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{deal.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{deal.status}</span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {deal.company}</span>
                    <span>Value: {deal.value}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Details
                  </button>
                  <Link
                    to="/deals/matching"
                    className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                  >
                    Qualify & Move Forward
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Total Opportunities</div>
          <div className="text-2xl font-semibold text-[#252525]">12</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Qualified This Month</div>
          <div className="text-2xl font-semibold text-[#252525]">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Conversion Rate</div>
          <div className="text-2xl font-semibold text-green-600">67%</div>
        </div>
      </div>
    </div>
  );
}

