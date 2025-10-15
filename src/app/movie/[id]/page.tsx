import Image from 'next/image';
import { FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getMovieDetail, Movie } from '@/lib/tmdb-api';
import DetailActions from '@/components/DetailActions';
import { DetailPageSkeleton } from '@/components/LoadingSkeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

/**
 * MovieDetails: Server Component that handles API fetching and renders the details.
 * @param {object} id - The TMDB movie ID
 */
const MovieDetails = async ({ id }: { id: number }) => {
	let movie: Movie;

	try {
        // API Integration: Fetch movie data securely on the server
		movie = await getMovieDetail(id); 
	} catch (error) {
		console.error(`Failed to fetch movie ${id}:`, error);
        // FRAMEWORK CONVENTION: Use Next.js 'notFound' helper for 404 response
		notFound();
	}

    // Helper calculations for display
	const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
	const runtimeDisplay = movie.runtime > 0 ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';

	return (
		<div className="flex flex-col md:flex-row gap-8 bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-secondary/10">
			
			{/* Poster Image: Uses Next.js Image Optimization */}
			<div className="md:w-1/3 w-full relative">
				<div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
					<Image
						src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png'}
						alt={movie.title}
						fill
						sizes="(max-width: 768px) 100vw, 33vw"
						className="object-cover"
						priority // High priority for the main content image
					/>
				</div>
			</div>

			{/* Movie Info */}
			<div className="md:w-2/3 space-y-6">
				<h1 className="text-4xl font-extrabold text-card-foreground">
					{movie.title} ({releaseYear})
				</h1>
				
				<div className="flex flex-wrap items-center gap-6 text-lg font-medium text-secondary">
					{/* Rating */}
					<div className="flex items-center space-x-2">
						<FaStar className="w-5 h-5 text-yellow-500" />
						<span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
					</div>
					{/* Release Date */}
					<div className="flex items-center space-x-2">
						<FaCalendarAlt className="w-5 h-5 text-accent" />
						<span>{movie.release_date || 'N/A'}</span>
					</div>
					{/* Runtime */}
					{movie.runtime > 0 && (
						<div className="flex items-center space-x-2">
							<FaClock className="w-5 h-5 text-secondary" />
							<span>{runtimeDisplay}</span>
						</div>
					)}
				</div>

				{/* Genres */}
				<div className="flex flex-wrap gap-2">
					{movie.genres?.map(genre => (
						<span 
							key={genre.id} 
							className="px-3 py-1 text-sm font-medium rounded-full bg-accent/20 text-accent"
						>
							{genre.name}
						</span>
					))}
				</div>

				{/* Description / Overview */}
				<div>
					<h3 className="text-2xl font-semibold mb-3 text-card-foreground">Overview</h3>
					<p className="text-secondary leading-relaxed">
						{movie.overview || 'No overview available.'}
					</p>
				</div>

				{/* Favorite Action: Client Component to handle click/state change */}
				<div className="pt-4">
					<DetailActions movie={movie} /> 
				</div>
			</div>
		</div>
	);
};

/**
 * MovieDetailPage: Main Page Component (Server Component).
 * CONVENTION: Must be declared 'async' to read the dynamic route parameter 'params.id' 
 * without triggering the Next.js sync-dynamic-apis warning.
 */
export default async function MovieDetailPage({ params }: { params: { id: string } }) { 
	// Safely access and parse the dynamic route parameter
	const movieId = parseInt(params.id, 10);
	
	return (
		<main className="container py-8">
			{/* PERFORMANCE: Suspense shows the skeleton until the MovieDetails Server Component resolves the fetch. */}
			<Suspense fallback={<DetailPageSkeleton />}>
				<MovieDetails id={movieId} />
			</Suspense>
		</main>
	);
}
