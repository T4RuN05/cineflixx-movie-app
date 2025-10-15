import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import { getPopularMovies, searchMovies } from '@/lib/tmdb-api';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';
import AuthGuard from '@/components/AuthGuard';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const page = params?.page || '1';
  const currentPage = parseInt(page, 10);

  const initialData = query
    ? await searchMovies(query, currentPage)
    : await getPopularMovies(currentPage);

  return (
    <AuthGuard>
      <main className="container py-8">
        {/* Client-only SearchBar */}
        <SearchBar initialQuery={query} />

        {/* Infinite grid with Suspense */}
        <Suspense fallback={<MovieGridSkeleton count={18} />}>
          <InfiniteMovieGrid
            initialMovies={initialData.results}
            initialPage={currentPage}
            initialTotalPages={initialData.total_pages}
            initialQuery={query}
          />
        </Suspense>
      </main>
    </AuthGuard>
  );
}
