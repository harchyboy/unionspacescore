import { useState, useEffect, useRef } from 'react';
import { useContacts } from '../../api/contacts';
import { Input } from '../ui/Input';

interface CompanyLookupProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export function CompanyLookup({
  value,
  onChange,
  label,
  required,
  placeholder = 'e.g., Knight Frank, CBRE, JLL',
  helperText = "If the firm doesn't exist, we'll create it automatically",
  error,
}: CompanyLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all contacts to extract unique companies
  const { data: contactsData } = useContacts({
    page: 1,
    pageSize: 1000, // Get a large set to extract companies
  });

  // Extract unique companies from contacts and filter by search query
  const companies = contactsData?.items
    ? Array.from(new Set(contactsData.items
        .map((contact) => contact.company)
        .filter((company): company is string => !!company && company.trim() !== '')))
        .sort()
        .filter((company) => 
          !searchQuery || company.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchQuery(newValue);
    setShowSuggestions(true);
  };

  const handleSelectCompany = (company: string) => {
    onChange(company);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (value) {
      setSearchQuery(value);
    }
    setShowSuggestions(true);
  };

  const handleLookupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery(''); // Clear search to show all companies
    setShowSuggestions(true);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div>
        <Input
          label={label}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          rightElement={
            <button
              type="button"
              onClick={handleLookupClick}
              className="p-1.5 text-secondary hover:text-primary transition-all-smooth rounded hover:bg-muted"
              title="Search existing companies"
              tabIndex={-1}
            >
              <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
            </button>
          }
        />
      </div>
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6E6E6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {companies.length > 0 ? (
              <>
                {companies.slice(0, 10).map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => handleSelectCompany(company)}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-muted transition-all-smooth flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-building text-secondary text-xs"></i>
                    <span>{company}</span>
                  </button>
                ))}
                {companies.length > 10 && (
                  <div className="px-4 py-2 text-xs text-secondary border-t border-[#E6E6E6]">
                    {companies.length - 10} more companies found
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-secondary text-center">
                No companies found. Type to create a new company.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

