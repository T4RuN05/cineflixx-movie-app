const TMDB_API_KEY = process.env.TMDB_API_KEY || '1a1a7efe0d1cf54302742fa3b8c2c919'; 
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
  // Add more fields for detail page as needed
}

interface PaginatedResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Reusable fetch function for server components
const fetcher = async <T>(path: string, params: Record<string, any> = {}): Promise<T> => {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
    console.error("TMDB_API_KEY is not set. Using mock data or throwing error.");
    
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    // Next.js 15.5 caching options
    next: { revalidate: 3600 } 
  });

  if (!response.ok) {
    throw new Error(`TMDB API request failed: ${response.status} ${response.statusText} for ${path}`);
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