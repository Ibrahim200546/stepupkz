import { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProductSearch } from '@/hooks/useProductSearch';
import { SearchResults } from './SearchResults';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ 
  placeholder = 'Поиск обуви...', 
  className = '',
  onSearch 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Memoize empty filters object to prevent infinite loop
  const emptyFilters = useMemo(() => ({}), []);

  const { results, loading } = useProductSearch(query, emptyFilters, {
    enabled: query.trim().length > 0,
  });

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowResults(false);
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/catalog?search=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 w-full"
          autoComplete="off"
        />
      </div>

      {showResults && (
        <SearchResults
          results={results}
          loading={loading}
          query={query}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
