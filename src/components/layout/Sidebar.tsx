import { NavLink } from 'react-router-dom';
import { isFeatureEnabled, FEATURES } from '../../config/features';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  feature?: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: 'fa-home', label: 'Overview', feature: FEATURES.OVERVIEW },
  { to: '/deals', icon: 'fa-handshake', label: 'Deals', feature: FEATURES.DEALS },
  { to: '/properties', icon: 'fa-building', label: 'Properties', feature: FEATURES.PROPERTIES },
  { to: '/contacts', icon: 'fa-users', label: 'Contacts', feature: FEATURES.CONTACTS },
  { to: '/suppliers', icon: 'fa-truck', label: 'Suppliers', feature: FEATURES.SUPPLIERS },
  { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics', feature: FEATURES.ANALYTICS },
  { to: '/settings', icon: 'fa-cog', label: 'Settings', feature: FEATURES.SETTINGS },
];

export function Sidebar() {
  const filteredNavItems = navItems.filter(
    (item) => !item.feature || isFeatureEnabled(item.feature as any)
  );

  return (
    <aside className="w-64 bg-white border-r border-[#E6E6E6] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E6E6E6]">
        <img src="/union-logo.svg" alt="UNION" className="h-8" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all-smooth ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-muted hover:text-primary'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#E6E6E6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">User</p>
            <p className="text-xs text-secondary truncate">user@union.co</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

