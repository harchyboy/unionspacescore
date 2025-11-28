import React, { useState } from 'react';

interface SidebarProps {
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage = 'contacts' }) => {
  const [logoError, setLogoError] = useState(false);

  const getLinkClass = (pageName: string) => {
    const baseClass = "flex items-center px-3 py-2 text-sm rounded transition-all-smooth group";
    
    return activePage === pageName 
      ? `${baseClass} bg-[#F5F5F4] text-primary font-medium`
      : `${baseClass} text-primary hover:bg-[#F5F5F4]`;
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E6E6E6] flex flex-col hidden md:flex">
      <div className="p-6 border-b border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          {logoError ? (
            <div className="w-10 h-10 bg-primary text-white rounded flex items-center justify-center font-bold">
              UN
            </div>
          ) : (
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">
              <img
                src="/union-logo.svg"
                alt="UNION Logo"
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          <div>
            <div className="font-semibold text-primary text-lg">UNION</div>
            <div className="text-xs text-secondary">Core Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          <a href="index.html#overview" className={getLinkClass('overview')}>
            <i className="fa-solid fa-grip w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Overview</span>
          </a>

          <div className="pt-4 pb-2">
            <div className="px-3 text-xs font-semibold text-secondary uppercase tracking-wider">Deal Flow</div>
          </div>

          <a href="Leads Dashboard.html" className={getLinkClass('leads')}>
            <i className="fa-solid fa-address-card w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Leads</span>
            <span className="ml-auto bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">4 HOT</span>
          </a>

          <a href="Pipeline Overview.html" className={getLinkClass('deals')}>
            <i className="fa-solid fa-handshake w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Pipeline</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">12</span>
          </a>

          <a href="Viewings.html" className={getLinkClass('viewing-planner')}>
            <i className="fa-solid fa-calendar-days w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Viewing Planner</span>
          </a>

          <a href="Property List Dashboard.html" className={getLinkClass('properties')}>
            <i className="fa-solid fa-building w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Properties</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">24</span>
          </a>

          <a href="Units Details Page.html" className={getLinkClass('units')}>
            <i className="fa-solid fa-door-open w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Units</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">58</span>
          </a>

          <a href="Deal Room Dashboard.html" className={getLinkClass('deal-room')}>
            <i className="fa-solid fa-folder-open w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Deal Room</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </a>

          <div className="pt-4 pb-2">
            <div className="px-3 text-xs font-semibold text-secondary uppercase tracking-wider">Operations</div>
          </div>

          <a href="Property List Dashboard Add Po.html" className={getLinkClass('onboarding')}>
            <i className="fa-solid fa-rocket w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Onboarding</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
          </a>

          <a href="Contacts Adding Card.html" className={getLinkClass('services')}>
            <i className="fa-solid fa-layer-group w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Services</span>
            <span className="ml-auto bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
          </a>

          <a href="Contacts List Page.html" className={getLinkClass('tickets')}>
            <i className="fa-solid fa-ticket w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Tickets</span>
            <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">8</span>
          </a>

          <a href="Suppliers List Page.html" className={getLinkClass('suppliers')}>
            <i className="fa-solid fa-truck w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Suppliers</span>
          </a>

          <div className="pt-4 pb-2">
            <div className="px-3 text-xs font-semibold text-secondary uppercase tracking-wider">Intelligence</div>
          </div>

          <a href="contacts.html" className={getLinkClass('contacts')}>
            <i className="fa-solid fa-users w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>People</span>
          </a>

          <a href="Companies List Page.html" className={getLinkClass('companies')}>
            <i className="fa-solid fa-building w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Companies</span>
          </a>

          <a href="Property List Dashboard.html#analytics" className={getLinkClass('analytics')}>
            <i className="fa-solid fa-chart-line w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Analytics</span>
          </a>

          <a href="index.html#settings" className={getLinkClass('settings')}>
            <i className="fa-solid fa-gear w-5 mr-3 text-secondary group-hover:text-primary transition-colors"></i>
            <span>Settings</span>
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-[#E6E6E6]">
        <div className="flex items-center space-x-3">
          <img src="https://hartzai.com/wp-content/uploads/2025/10/Tom.jpg" alt="Tom Townsend" className="w-9 h-9 rounded-full object-cover" />
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
};

export default Sidebar;
