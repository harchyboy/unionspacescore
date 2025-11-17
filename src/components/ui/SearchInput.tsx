import { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({ onSearch, debounceMs = 300, className = '', ...props }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(props.value?.toString() || '');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (onSearch) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
    }
  };

  return (
    <Input
      type="search"
      icon="fa-search"
      iconPosition="left"
      value={searchValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}

