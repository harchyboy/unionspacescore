import { Link } from 'react-router-dom';

export function Tom() {
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#252525] mb-2">Good morning, Tom</h1>
        <p className="text-[#8e8e8e]">Your pipeline is moving. 3 deals need attention today.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#252525]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xs text-[#8e8e8e]">This Month</span>
          </div>
          <div className="text-3xl font-semibold text-[#252525] mb-1">£2.4M</div>
          <div className="text-sm text-[#8e8e8e]">Pipeline Value</div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-green-600 font-medium">+18%</span>
            <span className="text-[#8e8e8e] ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#252525]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs text-[#8e8e8e]">Active</span>
          </div>
          <div className="text-3xl font-semibold text-[#252525] mb-1">12</div>
          <div className="text-sm text-[#8e8e8e]">Live Deals</div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-[#252525] font-medium">4 Hot Ops</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#252525]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-[#8e8e8e]">This Week</span>
          </div>
          <div className="text-3xl font-semibold text-[#252525] mb-1">8</div>
          <div className="text-sm text-[#8e8e8e]">Viewings Scheduled</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#252525]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-[#8e8e8e]">Pending</span>
          </div>
          <div className="text-3xl font-semibold text-[#252525] mb-1">5</div>
          <div className="text-sm text-[#8e8e8e]">Proposals</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#252525]">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/deals"
              className="block p-4 border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#252525]">Pipeline Overview</div>
                  <div className="text-sm text-[#8e8e8e]">View all deals in pipeline</div>
                </div>
                <svg className="w-5 h-5 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              to="/deals/qualification"
              className="block p-4 border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#252525]">Qualification</div>
                  <div className="text-sm text-[#8e8e8e]">Qualify new opportunities</div>
                </div>
                <svg className="w-5 h-5 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              to="/deals/viewings"
              className="block p-4 border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#252525]">Viewings</div>
                  <div className="text-sm text-[#8e8e8e]">Manage property viewings</div>
                </div>
                <svg className="w-5 h-5 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E6E6E6]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#252525]">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div className="text-sm font-medium text-[#252525]">New deal qualified</div>
              <div className="text-xs text-[#8e8e8e]">2 hours ago</div>
            </div>
            <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
              <div className="text-sm font-medium text-[#252525]">Proposal sent</div>
              <div className="text-xs text-[#8e8e8e]">5 hours ago</div>
            </div>
            <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <div className="text-sm font-medium text-[#252525]">Viewing scheduled</div>
              <div className="text-xs text-[#8e8e8e]">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

