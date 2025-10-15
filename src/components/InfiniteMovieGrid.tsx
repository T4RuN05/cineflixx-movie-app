'use client';

import { useState, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';
import { Movie } from '@/lib/tmdb-api';
import { MovieGridSkeleton } from './LoadingSkeleton';

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialPage: number;
  initialTotalPages: number;
  initialQuery?: string;
}

export default function InfiniteMovieGrid({
  initialMovies,
  initialPage,
  initialTotalPages,
  initialQuery = '',
}: InfiniteMovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [loading, setLoading] = useState(false);

  const fetchNextPage = useCallback(async () => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    const nextPage = page + 1;

    const params = new URLSearchParams();
    if (initialQuery) params.set('query', initialQuery);
    params.set('page', String(nextPage));

    try {
      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch movies');

      const data = await res.json();
      if (!data?.results) return;

      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMovies = data.results.filter((m: Movie) => !existingIds.has(m.id));
        return [...prev, ...newMovies];
      });

      setPage(nextPage);
      setTotalPages(data.total_pages || totalPages);
    } catch (err) {
      console.error('Error fetching next page:', err);
    } finally {
      setLoading(false);
    }
  }, [page, totalPages, loading, initialQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, loading]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.id + Math.random()} movie={movie} />
        ))}
      </div>
      {loading && <MovieGridSkeleton count={12} />}
    </>
  );
}
