import { Link } from 'react-router-dom';

export function HandoffToOperations() {
  const handoffs = [
    { id: 1, deal: 'Tech Hub London', company: 'TechCorp Ltd', orderNumber: 'PO-2024-001', status: 'Pending Handoff', completed: '2024-01-22' },
    { id: 2, deal: 'Creative Space Manchester', company: 'Design Studio', orderNumber: 'PO-2024-002', status: 'Handed Off', completed: '2024-01-20' },
    { id: 3, deal: 'Business Center Birmingham', company: 'Enterprise Inc', orderNumber: 'PO-2024-003', status: 'Pending Handoff', completed: '2024-01-23' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Handoff to Operations</h1>
          <p className="text-[#8e8e8e]">Transfer completed deals to operations team</p>
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
            <h2 className="text-lg font-semibold text-[#252525]">Ready for Handoff</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>Pending Handoff</option>
                <option>Handed Off</option>
                <option>In Operations</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {handoffs.map((handoff) => (
            <div key={handoff.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{handoff.deal}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      handoff.status === 'Handed Off' 
                        ? 'bg-green-100 text-green-700' 
                        : handoff.status === 'In Operations'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {handoff.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {handoff.company}</span>
                    <span className="mr-4">Order: {handoff.orderNumber}</span>
                    <span>Completed: {handoff.completed}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Details
                  </button>
                  {handoff.status === 'Pending Handoff' && (
                    <button className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90">
                      Initiate Handoff
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Pending Handoff</div>
          <div className="text-2xl font-semibold text-[#252525]">3</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Handed Off This Month</div>
          <div className="text-2xl font-semibold text-[#252525]">8</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">In Operations</div>
          <div className="text-2xl font-semibold text-green-600">12</div>
        </div>
      </div>
    </div>
  );
}

