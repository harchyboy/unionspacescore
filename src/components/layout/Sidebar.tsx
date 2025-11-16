import { Link, useLocation } from 'react-router-dom';
import { isFeatureEnabled, FEATURES } from '../../config/features';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  badgeColor?: 'default' | 'destructive';
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const allNavSections: NavSection[] = [
  {
    items: [
      {
        key: 'overview',
        label: 'Overview',
        icon: 'fa-grip',
        href: '/',
      },
    ],
  },
  {
    label: 'Deal Flow',
    items: [
      {
        key: 'deals',
        label: 'Pipeline',
        icon: 'fa-handshake',
        href: '/deals',
        badge: 12,
      },
      {
        key: 'properties',
        label: 'Properties',
        icon: 'fa-building',
        href: '/properties',
        badge: 24,
      },
      {
        key: 'units',
        label: 'Units',
        icon: 'fa-door-open',
        href: '/units',
        badge: 58,
      },
      {
        key: 'deal-room',
        label: 'Deal Room',
        icon: 'fa-folder-open',
        href: '/deal-room',
        badge: 3,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        key: 'onboarding',
        label: 'Onboarding',
        icon: 'fa-rocket',
        href: '/onboarding',
        badge: 5,
      },
      {
        key: 'services',
        label: 'Services',
        icon: 'fa-layer-group',
        href: '/services',
      },
      {
        key: 'tickets',
        label: 'Tickets',
        icon: 'fa-ticket',
        href: '/tickets',
        badge: 8,
        badgeColor: 'destructive',
      },
      {
        key: 'suppliers',
        label: 'Suppliers',
        icon: 'fa-truck',
        href: '/suppliers',
      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      {
        key: 'contacts',
        label: 'Contacts',
        icon: 'fa-users',
        href: '/contacts',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        icon: 'fa-chart-line',
        href: '/analytics',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: 'fa-gear',
        href: '/settings',
      },
    ],
  },
];

// Filter navigation sections based on feature flags
function getFilteredNavSections(): NavSection[] {
  return allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const featureMap: Record<string, string> = {
          overview: FEATURES.OVERVIEW,
          deals: FEATURES.DEALS,
          properties: FEATURES.PROPERTIES,
          units: FEATURES.UNITS,
          'deal-room': FEATURES.DEAL_ROOM,
          onboarding: FEATURES.ONBOARDING,
          services: FEATURES.SERVICES,
          tickets: FEATURES.TICKETS,
          suppliers: FEATURES.SUPPLIERS,
          contacts: FEATURES.CONTACTS,
          analytics: FEATURES.ANALYTICS,
          settings: FEATURES.SETTINGS,
        };
        const feature = featureMap[item.key];
        return feature ? isFeatureEnabled(feature as any) : true;
      }),
    }))
    .filter((section) => section.items.length > 0); // Remove empty sections
}

function NavItemComponent({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      to={item.href}
      className={`flex items-center px-3 py-2 text-sm rounded transition-all ${
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-[#8e8e8e] hover:bg-[#fafafa]'
      }`}
    >
      <i className={`fa-solid ${item.icon} w-5 mr-3 ${isActive ? 'text-white' : ''}`}></i>
      <span>{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-white text-primary'
              : item.badgeColor === 'destructive'
                ? 'bg-destructive text-white'
                : 'bg-[#252525] text-white'
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();

  const getActiveKey = (): string => {
    const path = location.pathname;
    if (path === '/') return 'overview';
    if (path.startsWith('/deals')) return 'deals';
    if (path.startsWith('/properties')) return 'properties';
    if (path.startsWith('/units')) return 'units';
    if (path.startsWith('/deal-room')) return 'deal-room';
    if (path.startsWith('/onboarding')) return 'onboarding';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/tickets')) return 'tickets';
    if (path.startsWith('/suppliers')) return 'suppliers';
    if (path.startsWith('/contacts')) return 'contacts';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/settings')) return 'settings';
    return 'overview';
  };

  const activeKey = getActiveKey();

  return (
    <aside
      className="w-64 bg-white border-r border-[#E6E6E6] flex flex-col"
      aria-label="Primary navigation"
    >
      <div className="p-6 border-b border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 bg-white rounded flex items-center justify-center"
            aria-hidden="true"
          >
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

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {getFilteredNavSections().map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.label && (
                <div className="pt-4 pb-2">
                  <div className="px-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                    {section.label}
                  </div>
                </div>
              )}
              {section.items.map((item) => (
                <NavItemComponent key={item.key} item={item} isActive={activeKey === item.key} />
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          <img
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
            alt="Tom"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-primary truncate">Tom Harrison</div>
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

