import { Link } from 'react-router-dom';

export function MatchingShortlist() {
  const deals = [
    { id: 1, name: 'Tech Hub London', properties: 5, status: 'Matching', nextStep: 'Viewings' },
    { id: 2, name: 'Creative Space Manchester', properties: 3, status: 'Shortlisted', nextStep: 'Viewings' },
    { id: 3, name: 'Business Center Birmingham', properties: 8, status: 'Matching', nextStep: 'Viewings' },
    { id: 4, name: 'Innovation Lab Leeds', properties: 2, status: 'Shortlisted', nextStep: 'Proposal' },
    { id: 5, name: 'Co-Working Space Bristol', properties: 4, status: 'Matching', nextStep: 'Viewings' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Matching & Shortlist</h1>
          <p className="text-[#8e8e8e]">Match deals with properties and create shortlists</p>
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
            <h2 className="text-lg font-semibold text-[#252525]">Active Deals</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>Matching</option>
                <option>Shortlisted</option>
              </select>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      deal.status === 'Shortlisted' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">{deal.properties} properties matched</span>
                    <span>Next: {deal.nextStep}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Matches
                  </button>
                  <Link
                    to="/deals/viewings"
                    className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                  >
                    Schedule Viewings
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Total Matches</div>
          <div className="text-2xl font-semibold text-[#252525]">22</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Shortlisted</div>
          <div className="text-2xl font-semibold text-[#252525]">2</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Ready for Viewings</div>
          <div className="text-2xl font-semibold text-green-600">3</div>
        </div>
      </div>
    </div>
  );
}

