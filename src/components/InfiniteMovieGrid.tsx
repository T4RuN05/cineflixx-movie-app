'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from './MovieCard';
import { MovieGridSkeleton } from './LoadingSkeleton';
import { searchMovies, getPopularMovies, Movie } from '@/lib/tmdb-api'; // Assuming Movie type is exported here

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialPage: number;
  initialTotalPages: number;
  initialQuery: string;
}

// Client-side function to fetch subsequent pages
const fetchNextPage = async (query: string, page: number) => {
    // Reuses the serverside functions for simplicity, which must handleAPI key securely.
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
    // Get the current query from the URL, defulting to initialQuery from server if URL is clean
    const currentQuery = searchParams.get('query') || initialQuery;

    // --- State Initialization ---
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [loading, setLoading] = useState(false);
    
    // Determine if more data can be fetched
    const [hasMore, setHasMore] = useState(initialPage < initialTotalPages);

    // Ref to attach to the bottom element
    const observerTargetRef = useRef<HTMLDivElement>(null);
    // Ref to track the query used for the last state udate
    const queryRef = useRef(initialQuery);


    //Handle New Search Query from Serve
    useEffect(() => {
        // This effect runs if the Server Component rendered a new set of initial props (e.g., query changed in URL)
        if (
            currentQuery !== queryRef.current || 
            initialMovies.length !== movies.length || 
            initialPage !== page
        ) {
            // Reset state with the new server-fetched data
            setMovies(initialMovies);
            setPage(initialPage);
            setTotalPages(initialTotalPages);
            setHasMore(initialPage < initialTotalPages);
            queryRef.current = currentQuery;
        }
    // Dependency array relies on all props that might change via server render/URL change
    }, [currentQuery, initialMovies, initialPage, initialTotalPages]);


    // Infinite Scroll Logic 
    const loadMoreMovies = useCallback(async () => {
        // Exit if currently loading or no more pages exist
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
            setHasMore(false); // Stop trying to load on persistent errors
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, currentQuery]);


    
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Check if the target is visible (intersecting)
                if (entries[0].isIntersecting) {
                    loadMoreMovies();
                }
            },
            { rootMargin: '200px' } // Load when 200px from the bottom
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
    // Dependencies: loadMoreMovies changes only when its dependencies change (stable), 
    // ensuring the observer is updated correctly.
    }, [loadMoreMovies, hasMore, loading]);

    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">
                {currentQuery ? `Search Results for "${currentQuery}"` : 'Popular Movies'}
            </h2>

            {/* Movie Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} /> 
                ))}
            </div>


            {hasMore && (
                <div ref={observerTargetRef} className="py-12">
                    {loading ? <MovieGridSkeleton count={6} /> : <div className="h-1" />}
                </div>
            )}

            {/* End of results message */}
            {!hasMore && movies.length > 0 && (
                <div className="text-center py-12 text-secondary">
                    <p className="text-lg font-medium">You've reached the end of the line! 🎬</p>
                    <p className="text-sm">Displaying {movies.length} results.</p>
                </div>
            )}
        </div>
    );
}