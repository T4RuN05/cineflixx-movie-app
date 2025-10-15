import { NextResponse } from 'next/server';
import { getPopularMovies, searchMovies } from '@/lib/tmdb-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    const data = query ? await searchMovies(query, page) : await getPopularMovies(page);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in /api/movies:', err);
    return NextResponse.json({ results: [], page, total_pages: 1, total_results: 0 });
  }
}
