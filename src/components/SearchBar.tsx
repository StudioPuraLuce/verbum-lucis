import { useState } from 'react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({ 
  placeholder = 'Cerca...', 
  onSearch,
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-12 rounded-lg border bg-background 
                   focus:outline-none focus:ring-2 focus:ring-primary 
                   transition-shadow"
      />
      <svg 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
      
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch?.('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground 
                     hover:text-foreground transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
