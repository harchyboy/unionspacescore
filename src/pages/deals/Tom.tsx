import { Link } from 'react-router-dom';

export function Tom() {
  return (
    <div className="p-8">
      <section className="mb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-primary mb-2">Good morning, Tom</h1>
          <p className="text-secondary">Your pipeline is moving. 3 deals need attention today.</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#F0F0F0] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-handshake text-primary"></i>
              </div>
              <span className="text-xs text-secondary">This Month</span>
            </div>
            <div className="text-3xl font-semibold text-primary mb-1">£2.4M</div>
            <div className="text-sm text-secondary">Pipeline Value</div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-green-600 font-medium">+18%</span>
              <span className="text-secondary ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#F0F0F0] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-primary"></i>
              </div>
              <span className="text-xs text-secondary">Active</span>
            </div>
            <div className="text-3xl font-semibold text-primary mb-1">12</div>
            <div className="text-sm text-secondary">Live Deals</div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-primary font-medium">4 Hot Ops</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#F0F0F0] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-ticket text-primary"></i>
              </div>
              <span className="text-xs text-red-600">SLA Breach</span>
            </div>
            <div className="text-3xl font-semibold text-primary mb-1">8</div>
            <div className="text-sm text-secondary">Open Tickets</div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-red-600 font-medium">3 overdue</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#F0F0F0] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-rocket text-primary"></i>
              </div>
              <span className="text-xs text-secondary">This Week</span>
            </div>
            <div className="text-3xl font-semibold text-primary mb-1">5</div>
            <div className="text-sm text-secondary">Move-Ins</div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-primary font-medium">2 need setup</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary">Pipeline Overview</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-xs font-medium text-primary bg-[#F0F0F0] rounded-lg">
                  Week
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-secondary hover:bg-[#F0F0F0] rounded-lg">
                  Month
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-secondary hover:bg-[#F0F0F0] rounded-lg">
                  Quarter
                </button>
              </div>
            </div>
            <div className="h-[300px] flex items-center justify-center text-secondary">
              <div className="text-center">
                <i className="fa-solid fa-chart-line text-4xl mb-4"></i>
                <p>Pipeline chart will be displayed here</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h2 className="text-lg font-semibold text-primary mb-6">Priority Actions</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 pb-4 border-b border-[#E6E6E6]">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">
                    Heads of Terms - WeWork Alternative Ltd
                  </div>
                  <div className="text-xs text-secondary mb-2">Due in 2 hours</div>
                  <button className="text-xs text-primary font-medium hover:underline">
                    Review terms →
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 pb-4 border-b border-[#E6E6E6]">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">Final viewing - TechCorp</div>
                  <div className="text-xs text-secondary mb-2">Today at 3pm</div>
                  <button className="text-xs text-primary font-medium hover:underline">
                    View details →
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 pb-4 border-b border-[#E6E6E6]">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">
                    Broker follow-up - Knight Frank
                  </div>
                  <div className="text-xs text-secondary mb-2">Tomorrow</div>
                  <button className="text-xs text-primary font-medium hover:underline">
                    Schedule call →
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">
                    Property materials - 45 Mortimer
                  </div>
                  <div className="text-xs text-secondary mb-2">This week</div>
                  <button className="text-xs text-primary font-medium hover:underline">
                    Generate PDFs →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">Deal Pipeline</h2>
            <p className="text-secondary">Track negotiations from requirement to closed won</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select className="pl-4 pr-10 py-2 bg-white border border-[#E6E6E6] rounded-lg text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                <option>All Brokers</option>
                <option>Knight Frank</option>
                <option>CBRE</option>
                <option>JLL</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary pointer-events-none"></i>
            </div>
            <Link
              to="/deals"
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              New Deal
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <div className="text-center py-8">
            <i className="fa-solid fa-chart-line text-4xl text-secondary mb-4"></i>
            <p className="text-secondary">Deal pipeline visualization will be displayed here</p>
            <Link
              to="/deals"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              View Full Pipeline
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">Quick Actions</h2>
            <p className="text-secondary">Common tasks and shortcuts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Link
            to="/properties"
            className="bg-white p-6 rounded-lg border border-[#E6E6E6] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary mb-1">Properties</div>
                <div className="text-sm text-secondary">View all properties</div>
              </div>
              <i className="fa-solid fa-chevron-right text-secondary"></i>
            </div>
          </Link>

          <Link
            to="/deals"
            className="bg-white p-6 rounded-lg border border-[#E6E6E6] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary mb-1">Deal Pipeline</div>
                <div className="text-sm text-secondary">Track all deals</div>
              </div>
              <i className="fa-solid fa-chevron-right text-secondary"></i>
            </div>
          </Link>

          <Link
            to="/tickets"
            className="bg-white p-6 rounded-lg border border-[#E6E6E6] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary mb-1">Tickets</div>
                <div className="text-sm text-secondary">8 open tickets</div>
              </div>
              <i className="fa-solid fa-chevron-right text-secondary"></i>
            </div>
          </Link>

          <Link
            to="/suppliers"
            className="bg-white p-6 rounded-lg border border-[#E6E6E6] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary mb-1">Suppliers</div>
                <div className="text-sm text-secondary">Manage vendors</div>
              </div>
              <i className="fa-solid fa-chevron-right text-secondary"></i>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

