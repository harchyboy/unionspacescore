import { Link } from 'react-router-dom';

export function Viewings() {
  const viewings = [
    { id: 1, property: 'Tech Hub London', company: 'TechCorp Ltd', date: '2024-01-15', time: '10:00 AM', status: 'Scheduled' },
    { id: 2, property: 'Creative Space Manchester', company: 'Design Studio', date: '2024-01-16', time: '2:00 PM', status: 'Scheduled' },
    { id: 3, property: 'Business Center Birmingham', company: 'Enterprise Inc', date: '2024-01-14', time: '11:00 AM', status: 'Completed' },
    { id: 4, property: 'Innovation Lab Leeds', company: 'Startup Co', date: '2024-01-17', time: '3:00 PM', status: 'Scheduled' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Viewings</h1>
          <p className="text-[#8e8e8e]">Manage property viewings and schedule appointments</p>
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
            Schedule Viewing
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] mb-6">
        <div className="p-4 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Upcoming Viewings</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search viewings..."
                className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {viewings.map((viewing) => (
            <div key={viewing.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{viewing.property}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      viewing.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {viewing.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {viewing.company}</span>
                    <span className="mr-4">Date: {viewing.date}</span>
                    <span>Time: {viewing.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Details
                  </button>
                  {viewing.status === 'Completed' && (
                    <Link
                      to="/deals/proposal-builder"
                      className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                    >
                      Create Proposal
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
          <div className="text-sm text-[#8e8e8e] mb-1">Scheduled This Week</div>
          <div className="text-2xl font-semibold text-[#252525]">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Completed</div>
          <div className="text-2xl font-semibold text-[#252525]">12</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Conversion Rate</div>
          <div className="text-2xl font-semibold text-green-600">75%</div>
        </div>
      </div>
    </div>
  );
}

