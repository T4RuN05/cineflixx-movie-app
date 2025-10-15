import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import { getPopularMovies, searchMovies } from '@/lib/tmdb-api';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';
import AuthGuard from '@/components/AuthGuard';

/**
 * InitialMovieFetcher: Server Component responsible for the FIRST API call (SSR).
 * RATIONALE: By fetching the first page on the server, we improve load performance 
 * and SEO, avoiding client-side waterfalls for the initial render.
 * @param {object} searchParams - URL parameters passed by Next.js
 */
const InitialMovieFetcher = async ({ query, page }: { query: string; page: string }) => {
    // Framework Convention: Safely parse URL parameter, default to page 1.
    const currentPage = parseInt(page || '1', 10);
    
    // API Integration: Fetch the data securely on the server side.
    const initialData = query 
        ? await searchMovies(query, currentPage) 
        : await getPopularMovies(currentPage);
    
    const initialMovies = initialData.results;
    
    // TRADE-OFF: We pass all initial data as props to the Client Component.
    return (
        <InfiniteMovieGrid 
            initialMovies={initialMovies} 
            initialPage={currentPage}
            initialTotalPages={initialData.total_pages}
            initialQuery={query} 
        />
    );
}

/**
 * DashboardPage: Main Page Component (Server Component).
 * CONVENTION: Must be marked 'async' because it accesses dynamic route props (searchParams).
 */
export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { query?: string; page?: string };
}) {
    // Safely extract URL state. This access is valid because the function is 'async'.
    const query = searchParams.query || '';
    const page = searchParams.page || '1'; 

    return (
        // SECURITY: AuthGuard ensures unauthenticated users are redirected to /login 
        // before the main content even attempts to render.
        <AuthGuard>
            <main className="container py-8">
                {/* SearchBar is a Client Component for dynamic input and suggestions */}
                <SearchBar initialQuery={query} />

                {/* PERFORMANCE: Suspense wraps the Server Fetcher. This renders the 
                   skeleton while the TMDB API call is pending, enabling streaming. */}
                <Suspense fallback={<MovieGridSkeleton count={18} />}>
                    {/* The Server Component that executes the initial fetch */}
                    <InitialMovieFetcher query={query} page={page} />
                </Suspense>
            </main>
        </AuthGuard>
    );
}
