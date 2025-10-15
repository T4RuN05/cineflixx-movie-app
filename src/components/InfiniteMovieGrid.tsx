'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from './MovieCard';
import { MovieGridSkeleton } from './LoadingSkeleton';
import { searchMovies, getPopularMovies, Movie } from '@/lib/tmdb-api'; 

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialPage: number;
  initialTotalPages: number;
  initialQuery: string;
}

// Client-side function to fetch subsequent pages
const fetchNextPage = async (query: string, page: number) => {
    // Reuses the server-side functions for simplicity, which must handle API key securely.
    if (query) {
        return searchMovies(query, page);
    } else {
        return getPopularMovies(page);
    }
};

export default function InfiniteMovieGrid({ 
    initialMovies, 
    initialPage,
    initialTotalPages,
    initialQuery,
}: InfiniteMovieGridProps) {
    const searchParams = useSearchParams();
    const currentQuery = searchParams.get('query') || initialQuery;

    // --- State Initialization ---
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPage < initialTotalPages);

    const observerTargetRef = useRef<HTMLDivElement>(null);
    const queryRef = useRef(initialQuery);


    // --- 1. Handle New Search Query from Server ---
    useEffect(() => {
        // This effect runs if the Server Component rendered a new set of initial props
        // We use JSON.stringify to deep-compare the movie arrays since they are prop dependencies
        if (
            currentQuery !== queryRef.current || 
            initialPage !== page ||
            JSON.stringify(initialMovies) !== JSON.stringify(movies) 
        ) {
            // Reset state with the new server-fetched data
            setMovies(initialMovies);
            setPage(initialPage);
            setTotalPages(initialTotalPages);
            setHasMore(initialPage < initialTotalPages);
            queryRef.current = currentQuery;
        }
    }, [currentQuery, initialMovies, initialPage, initialTotalPages, movies, page]);


    // --- 2. Infinite Scroll Logic ---
    const loadMoreMovies = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPage = page + 1;
            const data = await fetchNextPage(currentQuery, nextPage);
            
            const newTotalPages = Math.min(data.total_pages, 500);
            
            setMovies(prevMovies => {
                const allMoviesMap = new Map<number, Movie>();
                prevMovies.forEach(m => allMoviesMap.set(m.id, m));
                data.results.forEach(m => allMoviesMap.set(m.id, m));
                return Array.from(allMoviesMap.values());
            });

            setPage(nextPage);
            setTotalPages(newTotalPages);
            setHasMore(nextPage < newTotalPages);

        } catch (error) {
            console.error('Failed to load more movies:', error);
            setHasMore(false); 
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, currentQuery]); // Dependency array is clean

    
    // --- 3. Intersection Observer Setup ---
    useEffect(() => {
        // RATIONALE: Observe target only if we know there is more data to fetch and we aren't already loading.
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreMovies();
                }
            },
            { rootMargin: '200px' }
        );

        const target = observerTargetRef.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    // Dependencies: loadMoreMovies changes when its own dependencies change (stable).
    }, [loadMoreMovies, hasMore, loading]);

    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">
                {currentQuery ? `Search Results for "${currentQuery}"` : 'Popular Movies'}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} /> 
                ))}
            </div>

            {/* Loading Indicator/Skeleton (YouTube Style) */}
            {hasMore && (
                <div ref={observerTargetRef} className="py-12">
                    {loading ? <MovieGridSkeleton count={6} /> : <div className="h-1" />}
                </div>
            )}

            {/* End of results message */}
            {!hasMore && movies.length > 0 && (
                <div className="text-center py-12 text-secondary">
                    <p className="text-lg font-medium">You&apos;ve reached the end of the line! 🎬</p>
                    <p className="text-sm">Displaying {movies.length} results.</p>
                </div>
            )}
        </div>
    );
}