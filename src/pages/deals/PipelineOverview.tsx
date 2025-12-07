import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Pipeline', value: '47', sublabel: 'Active opportunities', icon: 'fa-chart-line' },
  { label: 'Hot Ops', value: '12', sublabel: 'Immediate action', icon: 'fa-fire', iconColor: 'text-red-600' },
  { label: 'In Viewings', value: '18', sublabel: 'Tours scheduled', icon: 'fa-eye' },
  { label: 'Proposals Out', value: '8', sublabel: 'Awaiting decision', icon: 'fa-file-invoice' },
  { label: 'In Legals', value: '5', sublabel: 'Near completion', icon: 'fa-gavel' },
  { label: 'Stale >14d', value: '4', sublabel: 'Needs attention', icon: 'fa-triangle-exclamation', iconColor: 'text-amber-600' },
];

const stages = [
  { id: 'intake', name: 'Intake', count: 7, color: 'bg-gray-400' },
  { id: 'matching', name: 'Matching', count: 12, color: 'bg-blue-500' },
  { id: 'viewings', name: 'Viewings', count: 18, color: 'bg-purple-500' },
  { id: 'proposals', name: 'Proposals', count: 8, color: 'bg-amber-500' },
  { id: 'legals', name: 'Legals', count: 5, color: 'bg-green-500' },
  { id: 'handoff', name: 'Handoff', count: 2, color: 'bg-teal-500' },
];

const deals = [
  { id: '1', company: 'TechFlow Solutions', broker: 'Knight Frank', desks: 35, location: 'City of London', budget: '£85k-£95k', time: '2 hours ago', hot: true, stage: 'intake' },
  { id: '2', company: 'MediaFirst Ltd', broker: 'CBRE', desks: 50, location: 'Shoreditch', budget: '£120k-£140k', time: '5 hours ago', hot: true, stage: 'intake' },
  { id: '3', company: 'FinanceHub', broker: 'JLL', desks: 25, location: 'Mayfair', budget: '£70k-£80k', time: '1 day ago', hot: false, stage: 'matching' },
  { id: '4', company: 'Creative Minds', broker: 'Savills', desks: 40, location: 'King\'s Cross', budget: '£90k-£100k', time: '2 days ago', hot: false, stage: 'viewings' },
];

export function PipelineOverview() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#252525]">Pipeline Overview</h1>
            <p className="text-sm text-[#8E8E8E] mt-0.5">Control centre for all active deals and opportunities</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-2 text-sm text-[#8E8E8E] hover:text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors">
              <i className="fa-solid fa-floppy-disk mr-2"></i>
              Save View
            </button>
            <button className="px-3 py-2 text-sm text-[#8E8E8E] hover:text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors">
              <i className="fa-solid fa-download mr-2"></i>
              Export
            </button>
            <Link
              to="/deals/qualification"
              className="px-4 py-2 bg-[#252525] text-white hover:bg-[#252525]/90 rounded-lg transition-colors text-sm font-semibold"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              New Requirement
            </Link>
          </div>
        </div>
      </div>

      {/* Pipeline Controls */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-white border border-[#E6E6E6] rounded-lg text-sm font-semibold text-[#252525] hover:bg-[#F0F0F0] transition-colors">
              <i className="fa-solid fa-table-columns mr-2"></i>
              Board View
              <i className="fa-solid fa-chevron-down ml-2 text-xs"></i>
            </button>
            
            <div className="h-8 w-px bg-[#E6E6E6]"></div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-sm text-[#8E8E8E] hover:text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors">
                <i className="fa-solid fa-sort mr-2"></i>
                Sorted by
                <span className="font-semibold text-[#252525] ml-1">Stage</span>
              </button>
              
              <button className="flex items-center px-3 py-2 text-sm text-[#8E8E8E] hover:text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#E6E6E6]">
                <i className="fa-solid fa-filter mr-2"></i>
                Filter
              </button>
              
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E6E6E6] rounded-lg px-3 py-2 pr-8 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#252525]">
                  <option>All Brokers</option>
                  <option>Knight Frank</option>
                  <option>CBRE</option>
                  <option>JLL</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E8E] text-xs pointer-events-none"></i>
              </div>
              
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E6E6E6] rounded-lg px-3 py-2 pr-8 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#252525]">
                  <option>All Properties</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E8E] text-xs pointer-events-none"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-8 py-6 bg-white border-b border-[#E6E6E6]">
        <div className="grid grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#F0F0F0] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8E8E8E] uppercase tracking-wide">{stat.label}</span>
                <i className={`fa-solid ${stat.icon} ${stat.iconColor || 'text-[#8E8E8E]'}`}></i>
              </div>
              <div className="text-2xl font-semibold text-[#252525]">{stat.value}</div>
              <div className="text-xs text-[#8E8E8E] mt-1">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto px-8 py-6 bg-[#F0F0F0]">
        <div className="flex space-x-4 h-full min-w-max">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-lg border border-[#E6E6E6] h-full flex flex-col">
                <div className="px-4 py-3 border-b border-[#E6E6E6] flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${stage.color} rounded-full mr-2`}></div>
                    <h3 className="text-sm font-semibold text-[#252525]">{stage.name}</h3>
                    <span className="ml-2 text-xs text-[#8E8E8E]">{stage.count}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-[#8E8E8E] hover:text-[#252525] transition-colors">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                    <button className="text-[#8E8E8E] hover:text-[#252525] transition-colors">
                      <i className="fa-solid fa-ellipsis-h text-xs"></i>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {deals
                    .filter((d) => d.stage === stage.id)
                    .map((deal) => (
                      <Link
                        key={deal.id}
                        to={`/deals/${deal.id}`}
                        className="block bg-[#F0F0F0] rounded-lg p-4 border border-[#E6E6E6]/20 hover:border-[#252525]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[#252525] mb-1">{deal.company}</h4>
                            <p className="text-xs text-[#8E8E8E]">Via: {deal.broker}</p>
                          </div>
                          {deal.hot && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              Hot
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-xs text-[#8E8E8E]">
                          <div className="flex items-center">
                            <i className="fa-solid fa-users w-4 mr-2"></i>
                            <span>{deal.desks} desks</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa-solid fa-location-dot w-4 mr-2"></i>
                            <span>{deal.location}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa-solid fa-sterling-sign w-4 mr-2"></i>
                            <span>{deal.budget} budget</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa-solid fa-clock w-4 mr-2"></i>
                            <span>{deal.time}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
