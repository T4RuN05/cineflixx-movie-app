
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaHeart } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
  };
}

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ movie }: MovieCardProps) {
  const { addFavorite, removeFavorite, isFavorite } = useAppContext();
  const favorite = isFavorite(movie.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating
    e.stopPropagation(); // Stop event bubbling up to the Link
    
    // Simplification: Construct the necessary Movie object for storage
    const favMovieData = {
        ...movie,
        overview: 'N/A', 
        release_date: new Date().toISOString().split('T')[0], // Placeholder data
    };
    
    if (favorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(favMovieData);
    }
  };

  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="relative w-full rounded-xl overflow-hidden shadow-xl 
                    transform transition-all duration-300 hover:scale-[1.03] 
                    bg-card hover:shadow-2xl hover:shadow-primary/20 
                    border border-secondary/10">
        
        {/* Poster Image */}
        <div className="aspect-[2/3] relative">
          <Image
            src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png'}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
            // Use Next.js Image Optimization
            priority={false} 
          />
        </div>

        {/* Details and Favorite Button */}
        <div className="p-3">
          <h3 className="text-base font-semibold truncate text-card-foreground hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            {/* Rating */}
            <div className="flex items-center text-sm text-secondary">
              <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-medium">
                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1 rounded-full transition-all duration-200 
                        ${favorite 
                          ? 'text-red-500 hover:scale-110 bg-red-100/50 dark:bg-red-900/50' 
                          : 'text-secondary/60 hover:text-red-500 hover:scale-110'}`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaHeart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}