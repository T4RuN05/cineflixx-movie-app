'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());
    if (query.trim()) newParams.set('query', query.trim());
    else newParams.delete('query');
    newParams.set('page', '1');
    router.push(`/dashboard?${newParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-8 max-w-2xl mx-auto">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for a movie..."
        className="w-full px-5 py-3 rounded-full border-2 focus:border-primary outline-none shadow-lg"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-secondary hover:text-primary"
        aria-label="Search"
      >
        <FaSearch className="w-5 h-5" />
      </button>
    </form>
  );
}
