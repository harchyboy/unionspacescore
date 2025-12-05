import { useEffect, useMemo, useRef, useState } from 'react';

interface AccountOption {
  id: string;
  name: string;
  city?: string | null;
  website?: string | null;
}

interface CompanyLookupProps {
  label?: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  onChange: (value: string, meta?: { accountId?: string | null; city?: string | null }) => void;
  // When an existing account is selected, pass the id back so we can link in Zoho.
  initialAccountId?: string | null;
}

export function CompanyLookup({
  label = 'Company Name',
  value,
  required,
  placeholder = 'Start typing to search accounts…',
  onChange,
  initialAccountId = null,
}: CompanyLookupProps) {
  const [options, setOptions] = useState<AccountOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialAccountId ?? null);
  const controller = useRef<AbortController | null>(null);

  const fetchOptions = useMemo(
    () =>
      async (search: string) => {
        if (!search || search.trim().length < 2) {
          setOptions([]);
          return;
        }

        controller.current?.abort();
        const nextController = new AbortController();
        controller.current = nextController;
        setIsLoading(true);
        try {
          const response = await fetch(`/api/accounts?search=${encodeURIComponent(search)}`, {
            signal: nextController.signal,
          });
          if (!response.ok) {
            throw new Error('Failed to fetch accounts');
          }
          const data = (await response.json()) as { items?: AccountOption[] };
          setOptions(data.items ?? []);
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Company lookup failed', error);
          }
        } finally {
          setIsLoading(false);
        }
      },
    [],
  );

  useEffect(() => {
    void fetchOptions(value);
  }, [value, fetchOptions]);

  const handleSelect = (option: AccountOption) => {
    setSelectedId(option.id);
    onChange(option.name, { accountId: option.id, city: option.city ?? null });
    setIsOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedId(null);
    onChange(event.target.value);
    setIsOpen(true);
  };

  const showDropdown = isOpen && options.length > 0;

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full border border-[#E6E6E6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {selectedId && (
        <p className="mt-1 text-xs text-secondary">
          Linked to Zoho Account ID: <span className="font-mono">{selectedId}</span>
        </p>
      )}
      {showDropdown && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#E6E6E6] rounded-lg shadow-lg max-h-48 overflow-auto">
          {isLoading && <div className="px-3 py-2 text-sm text-secondary">Searching…</div>}
          {!isLoading &&
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-3 py-2 hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] focus:outline-none"
              >
                <div className="text-sm text-primary font-medium">{option.name}</div>
                {(option.city || option.website) && (
                  <div className="text-xs text-secondary">
                    {[option.city, option.website].filter(Boolean).join(' • ')}
                  </div>
                )}
              </button>
            ))}
          {!isLoading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-secondary">No accounts found</div>
          )}
        </div>
      )}
    </div>
  );
}


