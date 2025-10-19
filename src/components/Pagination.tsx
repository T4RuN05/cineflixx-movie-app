// Path: src/components/Pagination.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  query: string;
}


export default function Pagination({ currentPage, totalPages, totalResults, query }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const MAX_PAGES = 500; // TMDB API limit
  const finalTotalPages = Math.min(totalPages, MAX_PAGES);
  
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNumber));
    if (query) {
      params.set('query', query);
    } else {
      params.delete('query');
    }
    return `/dashboard?${params.toString()}`;
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= finalTotalPages) {
      router.push(createPageUrl(pageNumber));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-4">
        {/* Previous Button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-3 rounded-full bg-card text-card-foreground border border-secondary/10 hover:bg-secondary/10 disabled:opacity-50 transition-colors"
          aria-label="Previous Page"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-secondary text-sm md:text-base">
          Page <span className="font-bold text-card-foreground">{currentPage.toLocaleString()}</span> of {finalTotalPages.toLocaleString()}
        </span>

        {/* Next Button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= finalTotalPages}
          className="p-3 rounded-full bg-card text-card-foreground border border-secondary/10 hover:bg-secondary/10 disabled:opacity-50 transition-colors"
          aria-label="Next Page"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-secondary/70 mt-2">
        Total Results: {totalResults.toLocaleString()}
      </p>
    </div>
  );
}