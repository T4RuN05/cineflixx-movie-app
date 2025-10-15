'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';

interface MovieSuggestion {
  id: number;
  title: string;
}

type TimeoutRef = NodeJS.Timeout | null;

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<TimeoutRef>(null);

  // --- Debounced search function ---
  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        try {
          const params = new URLSearchParams({
            query: searchTerm,
            page: '1',
          });
          const res = await fetch(`/api/movies?${params.toString()}`);
          const data = await res.json();

          setSuggestions(
            data.results.slice(0, 5).map((m: any) => ({ id: m.id, title: m.title }))
          );
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    searchTimeoutRef.current = timeoutId;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleSearch(newQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      newParams.set('query', query.trim());
    } else {
      newParams.delete('query');
    }
    newParams.set('page', '1');
    setSuggestions([]);
    router.push(`/dashboard?${newParams.toString()}`);
  };

  // Cleanup the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className="relative mb-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full px-5 py-3 pr-12 rounded-full border-2 
                    bg-card text-card-foreground border-secondary/20 focus:border-primary 
                    outline-none transition-colors shadow-lg"
          placeholder="Search for a movie..."
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full w-12 text-secondary hover:text-primary transition-colors"
          aria-label="Search"
        >
          <FaSearch className="w-5 h-5 mx-auto" />
        </button>
      </form>

      {showSuggestions && (
        <ul className="absolute top-full mt-2 w-full 
                       bg-card rounded-lg shadow-xl z-50 
                       border border-secondary/10 overflow-hidden">
          {suggestions.map((movie) => (
            <li key={movie.id}>
              <Link
                href={`/movie/${movie.id}`}
                className="block px-5 py-3 text-card-foreground 
                           hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-colors truncate"
                onClick={() => setSuggestions([])}
              >
                {movie.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
