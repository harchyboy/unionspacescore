import { useLocation } from 'react-router-dom';

interface HeaderProps {
  searchPlaceholder?: string;
}

export function Header({ searchPlaceholder }: HeaderProps) {
  const location = useLocation();

  const getDefaultPlaceholder = () => {
    const path = location.pathname;
    if (path.startsWith('/properties')) return 'Search properties, units, contacts...';
    if (path.startsWith('/suppliers')) return 'Search suppliers, contacts, categories...';
    if (path.startsWith('/contacts')) return 'Search contacts, companies, brokers...';
    if (path.startsWith('/tickets')) return 'Search tickets, issues, requests...';
    if (path.startsWith('/units')) return 'Search units, properties...';
    return 'Search deals, properties, tickets...';
  };

  return (
    <header className="bg-white border-b border-[#E6E6E6] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-6 flex-1">
        <div className="relative flex-1 max-w-xl">
          <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary"></i>
          <input
            type="text"
            placeholder={searchPlaceholder || getDefaultPlaceholder()}
            className="w-full pl-11 pr-4 py-2.5 bg-muted border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className="relative p-2 text-secondary hover:text-primary transition-all-smooth"
          aria-label="Notifications"
        >
          <i className="fa-solid fa-bell text-lg"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <button
          className="p-2 text-secondary hover:text-primary transition-all-smooth"
          aria-label="Help"
        >
          <i className="fa-solid fa-question-circle text-lg"></i>
        </button>
      </div>
    </header>
  );
}

