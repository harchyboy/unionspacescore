import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isPropertiesActive = location.pathname.startsWith('/properties');

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f0f0]">
      <aside
        className="w-64 bg-white border-r border-[#E6E6E6] flex flex-col"
        aria-label="Primary navigation"
      >
        <div className="p-6 border-b border-[#E6E6E6]">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-[#252525] rounded flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-white font-semibold text-lg">U</span>
            </div>
            <div>
              <div className="font-semibold text-[#252525] text-lg">UNION</div>
              <div className="text-xs text-[#8e8e8e]">Core Dashboard</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-6">
            <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-2 px-3">
              Deal Flow
            </div>
            <Link
              to="/deals"
              className="flex items-center px-3 py-2 text-sm text-[#8e8e8e] hover:bg-[#fafafa] rounded transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="ml-3">Deals</span>
            </Link>
            <Link
              to="/properties"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                isPropertiesActive
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="ml-3">Properties</span>
            </Link>
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#E6E6E6] px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#252525]">Properties</h2>
            <div className="flex items-center space-x-4">
              <button
                className="text-[#8e8e8e] hover:text-[#252525]"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

