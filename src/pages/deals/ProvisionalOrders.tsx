import { Link } from 'react-router-dom';

export function ProvisionalOrders() {
  const orders = [
    { id: 1, deal: 'Tech Hub London', company: 'TechCorp Ltd', orderNumber: 'PO-2024-001', status: 'Draft', created: '2024-01-20' },
    { id: 2, deal: 'Creative Space Manchester', company: 'Design Studio', orderNumber: 'PO-2024-002', status: 'Issued', created: '2024-01-18' },
    { id: 3, deal: 'Business Center Birmingham', company: 'Enterprise Inc', orderNumber: 'PO-2024-003', status: 'Draft', created: '2024-01-21' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#252525] mb-2">Provisional Orders</h1>
          <p className="text-[#8e8e8e]">Create and manage provisional orders</p>
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
            New Provisional Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] mb-6">
        <div className="p-4 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Provisional Orders</h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]">
                <option>All Status</option>
                <option>Draft</option>
                <option>Issued</option>
                <option>Confirmed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#E6E6E6]">
          {orders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-[#fafafa] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#252525]">{order.deal}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'Issued' 
                        ? 'bg-blue-100 text-blue-700' 
                        : order.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-[#8e8e8e]">
                    <span className="mr-4">Company: {order.company}</span>
                    <span className="mr-4">Order: {order.orderNumber}</span>
                    <span>Created: {order.created}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm hover:bg-[#fafafa]">
                    View Order
                  </button>
                  {order.status === 'Confirmed' && (
                    <Link
                      to="/deals/handoff"
                      className="px-3 py-1.5 bg-[#252525] text-white rounded-lg text-sm hover:bg-opacity-90"
                    >
                      Handoff to Operations
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
          <div className="text-sm text-[#8e8e8e] mb-1">Total Orders</div>
          <div className="text-2xl font-semibold text-[#252525]">10</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Issued</div>
          <div className="text-2xl font-semibold text-[#252525]">4</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="text-sm text-[#8e8e8e] mb-1">Confirmed</div>
          <div className="text-2xl font-semibold text-green-600">6</div>
        </div>
      </div>
    </div>
  );
}

