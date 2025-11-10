import type { Property } from '../../../types/property';

interface ActivityCommsTabProps {
  property: Property;
}

export function ActivityCommsTab(_props: ActivityCommsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Activity Feed</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-[#fafafa] rounded-lg">
            <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📧</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#252525]">Email logged</div>
              <div className="text-xs text-[#8e8e8e]">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-[#fafafa] rounded-lg">
            <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📞</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#252525]">Call logged</div>
              <div className="text-xs text-[#8e8e8e]">1 day ago</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button className="px-4 py-3 border border-[#E6E6E6] rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-all flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Log Email</span>
          </button>
          <button className="px-4 py-3 border border-[#E6E6E6] rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-all flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>Log Call</span>
          </button>
          <button className="px-4 py-3 border border-[#E6E6E6] rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-all flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Add Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}

