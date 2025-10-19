import { NextResponse } from 'next/server';
import { getPopularMovies, searchMovies } from '@/lib/tmdb-api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const data = query
      ? await searchMovies(query, page)
      : await getPopularMovies(page);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/movies:', error);
    return NextResponse.json(
      { results: [], page: 1, total_pages: 1, total_results: 0 },
      { status: 200 }
    );
  }
}
