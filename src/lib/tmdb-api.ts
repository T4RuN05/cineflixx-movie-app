const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error(
    'TMDB_API_KEY is missing! Set it in .env.local (local dev) or Vercel Environment Variables.'
  );
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

const fetcher = async <T>(path: string, params: Record<string, unknown> = {}): Promise<T> => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

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
