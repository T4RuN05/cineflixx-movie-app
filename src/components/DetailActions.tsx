'use client';
import { FaHeart } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';
import { Movie } from '@/lib/tmdb-api';

interface DetailActionsProps {
  movie: Movie;
}

export default function DetailActions({ movie }: DetailActionsProps) {
  const { addFavorite, removeFavorite, isFavorite } = useAppContext();
  const favorite = isFavorite(movie.id);

  const handleFavorite = () => {
    if (favorite) {
      removeFavorite(movie.id);
    } else {
      // Pass the full movie object for stodrage
      addFavorite(movie);
    }
  };

  return (
    <button
      onClick={handleFavorite}
      className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-colors duration-200 
                  shadow-lg 
                  ${favorite 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-primary/20 text-primary hover:bg-primary/30 dark:text-white dark:bg-primary/30'}`}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <FaHeart className="w-5 h-5" />
      <span>{favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
    </button>
  );
}