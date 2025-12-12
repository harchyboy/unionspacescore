import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { to: '/', icon: 'fa-grip', label: 'Overview' },
    ],
  },
  {
    title: 'Deal Flow',
    items: [
      { to: '/deals', icon: 'fa-handshake', label: 'Pipeline', badge: 12 },
      { to: '/leads', icon: 'fa-address-card', label: 'Leads', badge: '4 HOT', badgeColor: 'bg-[#8E8E8E]' },
      { to: '/viewings', icon: 'fa-calendar-days', label: 'Viewing Planner' },
      { to: '/properties', icon: 'fa-building', label: 'Properties', badge: 24 },
      { to: '/units', icon: 'fa-door-open', label: 'Units', badge: 58 },
      { to: '/deal-room', icon: 'fa-folder-open', label: 'Deal Room', badge: 3 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/onboarding', icon: 'fa-rocket', label: 'Onboarding', badge: 5 },
      { to: '/services', icon: 'fa-layer-group', label: 'Services' },
      { to: '/tickets', icon: 'fa-ticket', label: 'Tickets', badge: 8, badgeColor: 'bg-[#252525]' },
      { to: '/suppliers', icon: 'fa-truck', label: 'Suppliers' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/contacts', icon: 'fa-users', label: 'Contacts' },
      { to: '/companies', icon: 'fa-building', label: 'Companies' },
      { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
      { to: '/settings', icon: 'fa-gear', label: 'Settings' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="w-[240px] bg-[#F0F0F0] border-r border-[#E6E6E6] flex flex-col">
      {/* Logo */}
      <div className="p-[25px] border-b border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <img
              src="/union-logo.svg"
              alt="UNION Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-semibold text-primary text-lg">UNION</div>
            <div className="text-xs text-secondary">Core Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <div className="pt-4 pb-2">
                  <div className="px-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                    {section.title}
                  </div>
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-4 py-3 text-sm rounded transition-all-smooth border-l-[3px] ${
                    isActive(item.to)
                      ? 'bg-white border-[#252525] text-[#252525]'
                      : 'border-transparent text-[#252525] hover:bg-white/50'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5 mr-3`}></i>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto ${
                        item.badgeColor || 'bg-[#252525]'
                      } text-white text-xs px-2 py-0.5 rounded-full`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          <img
            src="https://hartzai.com/wp-content/uploads/2025/10/Tom.jpg"
            alt="Tom Townsend"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-primary truncate">Tom Townsend</div>
            <div className="text-xs text-secondary">Origination</div>
          </div>
          <button className="text-secondary hover:text-primary">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
