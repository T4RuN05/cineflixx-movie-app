'use client';

import { Suspense } from 'react';
import MovieCard from '@/components/MovieCard';
import { useAppContext } from '@/context/AppContext';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import AuthGuard from '@/components/AuthGuard';

/**
 * FavoritesContent: Reads and displays the user-specific favorites list.
 * RATIONALE: This component must be separated because it uses the useAppContext hook, 
 * making it client-side and subject to hydration delays.
 */
const FavoritesContent = () => {
    // State Management: Accesses the user-scoped favorites list from Context.
    const { favorites } = useAppContext();
    
    // Business Logic: Check if the list is empty.
    if (favorites.length === 0) {
        return (
            <div className="text-center py-20 bg-card rounded-xl shadow-lg border border-secondary/10">
                <h2 className="text-2xl font-bold text-secondary">Your favorites list is empty.</h2>
                <p className="text-secondary/80 mt-2">
                    Go to the <a href="/dashboard" className="text-primary hover:underline">Dashboard</a> to start adding movies!
                </p>
            </div>
        );
    }

    // Displays the list in the same grid format as the Dashboard.
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* RATIONALE: Each card requires a unique key (movie.id) for React to track them efficiently. */}
            {favorites.map(movie => (
                <MovieCard 
                    key={movie.id} 
                    movie={{
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                    }}
                />
            ))}
        </div>
    );
}

/**
 * FavoritesPage: Main entry for the /favorites route (Client Component).
 */
export default function FavoritesPage() {
    return (
        // SECURITY: AuthGuard ensures this entire page is inaccessible unless logged in.
        <AuthGuard>
            <main className="container py-8">
                <h1 className="text-3xl font-bold mb-8 text-card-foreground">My Favorites</h1>

                {/* PERFORMANCE: Suspense is crucial here. It runs while the client checks 
                   localStorage and initializes the 'favorites' state, preventing a blank screen. */}
                <Suspense fallback={<MovieGridSkeleton count={6} />}>
                    <FavoritesContent />
                </Suspense>
            </main>
        </AuthGuard>

    );
}
