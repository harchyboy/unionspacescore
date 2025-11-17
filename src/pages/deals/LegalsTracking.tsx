import { Link } from 'react-router-dom';

export function LegalsTracking() {
  const legals = [
    { id: 1, deal: 'Tech Hub London', company: 'TechCorp Ltd', status: 'In Progress', progress: 65, deadline: '2024-01-25' },
    { id: 2, deal: 'Creative Space Manchester', company: 'Design Studio', status: 'Review', progress: 90, deadline: '2024-01-22' },
    { id: 3, deal: 'Business Center Birmingham', company: 'Enterprise Inc', status: 'In Progress', progress: 40, deadline: '2024-01-28' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Legals Tracking</h1>
          <p className="text-[#8e8e8e]">Track legal document progress and completion</p>
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
            <h2 className="text-lg font-semibold text-[#252525]">Legal Documents</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {legals.map((legal) => (
            <div key={legal.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{legal.deal}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      legal.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : legal.status === 'Review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {legal.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {legal.company}</span>
                    <span>Deadline: {legal.deadline}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#252525] mb-1">{legal.progress}%</div>
                  <div className="w-32 bg-[#f0f0f0] rounded-full h-2">
                    <div 
                      className="bg-[#252525] h-2 rounded-full" 
                      style={{ width: `${legal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                  View Details
                </button>
                {legal.progress === 100 && (
                  <Link
                    to="/deals/provisional-orders"
                    className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                  >
                    Create Provisional Order
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">In Progress</div>
          <div className="text-2xl font-semibold text-[#252525]">5</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Completed</div>
          <div className="text-2xl font-semibold text-[#252525]">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Average Completion</div>
          <div className="text-2xl font-semibold text-[#252525]">12 days</div>
        </div>
      </div>
    </div>
  );
}

