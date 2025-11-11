import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isPropertiesActive = location.pathname.startsWith('/properties');

  const getPageTitle = () => {
    if (location.pathname === '/deals' || location.pathname.startsWith('/deals/pipeline')) return 'Pipeline Overview';
    if (location.pathname.startsWith('/deals/tom')) return 'TOM';
    if (location.pathname.startsWith('/deals/qualification')) return 'Qualification';
    if (location.pathname.startsWith('/deals/matching')) return 'Matching & Shortlist';
    if (location.pathname.startsWith('/deals/viewings')) return 'Viewings';
    if (location.pathname.startsWith('/deals/proposal-builder')) return 'Proposal Builder';
    if (location.pathname.startsWith('/deals/decision')) return 'Decision Screen';
    if (location.pathname.startsWith('/deals/deal-room-setup')) return 'Deal Room Setup';
    if (location.pathname.startsWith('/deals/heads-of-terms')) return 'Heads of Terms Upload';
    if (location.pathname.startsWith('/deals/legals')) return 'Legals Tracking';
    if (location.pathname.startsWith('/deals/provisional-orders')) return 'Provisional Orders';
    if (location.pathname.startsWith('/deals/handoff')) return 'Handoff to Operations';
    if (location.pathname.startsWith('/properties')) return 'Properties';
    return 'Dashboard';
  };

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
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals' || location.pathname === '/deals/pipeline'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="ml-3">Pipeline Overview</span>
            </Link>
            <Link
              to="/deals/tom"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/tom'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="ml-3">TOM</span>
            </Link>
            <Link
              to="/deals/qualification"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/qualification'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-3">Qualification</span>
            </Link>
            <Link
              to="/deals/matching"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/matching'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="ml-3">Matching & Shortlist</span>
            </Link>
            <Link
              to="/deals/viewings"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/viewings'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="ml-3">Viewings</span>
            </Link>
            <Link
              to="/deals/proposal-builder"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/proposal-builder'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="ml-3">Proposal Builder</span>
            </Link>
            <Link
              to="/deals/decision"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/decision'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="ml-3">Decision Screen</span>
            </Link>
            <Link
              to="/deals/deal-room-setup"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/deal-room-setup'
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
              <span className="ml-3">Deal Room Setup</span>
            </Link>
            <Link
              to="/deals/heads-of-terms"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/heads-of-terms'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="ml-3">Heads of Terms</span>
            </Link>
            <Link
              to="/deals/legals"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/legals'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="ml-3">Legals Tracking</span>
            </Link>
            <Link
              to="/deals/provisional-orders"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/provisional-orders'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="ml-3">Provisional Orders</span>
            </Link>
            <Link
              to="/deals/handoff"
              className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
                location.pathname === '/deals/handoff'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#8e8e8e] hover:bg-[#fafafa]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span className="ml-3">Handoff to Operations</span>
            </Link>
          </div>
          <div className="px-3 mb-6">
            <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-2 px-3">
              Properties
            </div>
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
            <h2 className="text-lg font-semibold text-[#252525]">{getPageTitle()}</h2>
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

