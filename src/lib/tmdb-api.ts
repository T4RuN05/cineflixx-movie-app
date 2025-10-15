const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null; // Can be null in TMDB responses
  vote_average: number;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  runtime: number;
}

interface PaginatedResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

/**
 * Reusable function for fetching data securely on the server.
 * @template T The expected JSON response type.
 * @param params Record<string, unknown>: Ensures type safety for search parameters.
 */
const fetcher = async <T>(path: string, params: Record<string, unknown> = {}): Promise<T> => {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
    console.error("CRITICAL: TMDB_API_KEY is missing or invalid.");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    // FRAMEWORK CONVENTION: Ensure parameter values are strings for URL searching.
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    // PERFORMANCE: Next.js caching strategy. Cache results for 1 hour (3600s).
    next: { revalidate: 3600 } 
  });

  if (!response.ok) {
    throw new Error(`TMDB API request failed: ${response.statusText}`);
  }

  return response.json();
};

// --- Exported API Functions (Used by Server Components and Client Infinite Scroll) ---

export const getPopularMovies = (page: number = 1): Promise<PaginatedResponse> => {
  return fetcher<PaginatedResponse>('/movie/popular', { page });
};

export const searchMovies = (query: string, page: number = 1): Promise<PaginatedResponse> => {
  if (!query) return getPopularMovies(page);
  return fetcher<PaginatedResponse>('/search/movie', { query, page });
};

export const getMovieDetail = (id: number): Promise<Movie> => {
  return fetcher<Movie>(`/movie/${id}`);
};
