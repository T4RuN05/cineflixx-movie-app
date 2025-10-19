'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';

// type for the suggestion objects we get from API
interface MovieSuggestion {
  id: number;
  title: string;
}

// helps to store the timeout reference for debounce
type TimeoutRef = NodeJS.Timeout | null;

// search bar component with auto-suggest feature
export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // controlled input state
  const [query, setQuery] = useState(initialQuery);
  // current list of suggestions
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  // track if input is focused for showing dropdown
  const [isFocused, setIsFocused] = useState(false);
  // debounce ref
  const searchTimeoutRef = useRef<TimeoutRef>(null);

  // handles fetching search suggestions after user stops typing
  const handleSearch = useCallback((searchTerm: string) => {
    // clear previous debounce timer
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // set new debounce timer
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        try {
          // build query params
          const params = new URLSearchParams({ query: searchTerm, page: '1' });
          const res = await fetch(`/api/movies?${params.toString()}`);

          if (!res.ok) {
            console.error('search api error:', res.statusText);
            setSuggestions([]);
            return;
          }

          const data = await res.json();

          if (!data?.results) {
            setSuggestions([]);
            return;
          }

          // keep only id and title, limit to 5 suggestions
          setSuggestions(
            data.results
              .filter((m: any) => m && m.id && m.title)
              .slice(0, 5)
              .map((m: any) => ({ id: m.id, title: m.title }))
          );
        } catch (error) {
          console.error('error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        // if query is too short, clear suggestions
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    searchTimeoutRef.current = timeoutId;
  }, []);

  // input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleSearch(newQuery);
  };

  // form submit handler
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

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // only show suggestions when input is focused and we have results
  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className="relative mb-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        {/* search input */}
        <input
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          // small delay to allow click on suggestion
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full px-5 py-3 pr-12 rounded-full border-2 
                     bg-card text-card-foreground border-secondary/20 focus:border-primary 
                     outline-none transition-colors shadow-lg"
          placeholder="search for a movie..."
        />

        {/* search button icon */}
        <button
          type="submit"
          className="absolute right-0 top-0 h-full w-12 text-secondary hover:text-primary transition-colors"
          aria-label="search"
        >
          <FaSearch className="w-5 h-5 mx-auto" />
        </button>
      </form>

      {/* suggestion dropdown */}
      {showSuggestions && (
        <ul
          className="absolute top-full mt-2 w-full 
                     bg-card rounded-lg shadow-xl z-50 
                     border border-secondary/10 overflow-hidden"
        >
          {suggestions.map((movie) => (
            <li key={movie.id}>
              <Link
                href={`/movie/${movie.id}`}
                className="block px-5 py-3 text-card-foreground 
                           hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-colors truncate"
                onClick={() => setSuggestions([])} // hide suggestions on click
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
