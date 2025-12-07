import { useState } from 'react';

interface HeaderProps {
  searchPlaceholder?: string;
}

export function Header({ searchPlaceholder = 'Search...' }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white border-b border-[#E6E6E6] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E6E6E6] rounded-lg text-sm placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-6">
        <button className="relative text-secondary hover:text-primary transition-all-smooth">
          <i className="fa-solid fa-bell text-lg"></i>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <button className="text-secondary hover:text-primary transition-all-smooth">
          <i className="fa-solid fa-question-circle text-lg"></i>
        </button>
      </div>
    </header>
  );
}

