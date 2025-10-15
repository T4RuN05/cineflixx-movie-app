// lib/tmdb-api.ts
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error(
    'TMDB_API_KEY is missing! Set it in .env.local or in Vercel Environment Variables.'
  );
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
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

const fetcher = async <T>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T> => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, String(value))
  );

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // 1 hour caching
  });

  if (!response.ok) {
    throw new Error(`TMDB API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Server-side API functions
export const getPopularMovies = (page: number = 1): Promise<PaginatedResponse> =>
  fetcher<PaginatedResponse>('/movie/popular', { page });

export const searchMovies = (query: string, page: number = 1): Promise<PaginatedResponse> =>
  query ? fetcher<PaginatedResponse>('/search/movie', { query, page }) : getPopularMovies(page);

export const getMovieDetail = (id: number): Promise<Movie> =>
  fetcher<Movie>(`/movie/${id}`);
