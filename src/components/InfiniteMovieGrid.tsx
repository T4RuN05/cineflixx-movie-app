'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MovieCard from './MovieCard';
import { Movie } from '@/lib/tmdb-api';
import { MovieGridSkeleton } from './LoadingSkeleton';

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialPage: number;
  initialTotalPages: number;
  initialQuery: string;
}

export default function InfiniteMovieGrid({
  initialMovies,
  initialPage,
  initialTotalPages,
  initialQuery,
}: InfiniteMovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      params.set('page', String(page + 1));

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) {
        console.error('Failed to fetch movies from API route:', res.statusText);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data || !data.results) {
        console.error('Invalid data from API:', data);
        setLoading(false);
        return;
      }

      // Filter out duplicates
      const existingIds = new Set(movies.map((m) => m.id));
      const newMovies = data.results.filter((m: Movie) => !existingIds.has(m.id));

      setMovies((prev) => [...prev, ...newMovies]);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching next page:', err);
    } finally {
      setLoading(false);
    }
  }, [page, totalPages, query, loading, movies]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchNextPage]);

  // Reset when query changes
  useEffect(() => {
    setMovies(initialMovies);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
    setQuery(initialQuery);
  }, [initialMovies, initialPage, initialTotalPages, initialQuery]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div ref={loaderRef} className="mt-6 flex justify-center">
        {loading && <MovieGridSkeleton count={6} />}
      </div>
    </>
  );
}
