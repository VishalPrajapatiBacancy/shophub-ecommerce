import { useState, useMemo } from 'react';
import { DEFAULT_ITEMS_PER_PAGE } from '@/config/constants';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPerPage?: number;
}

export function usePagination({ totalItems, initialPage = 1, initialPerPage = DEFAULT_ITEMS_PER_PAGE }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const paginatedRange = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return { start, end };
  }, [currentPage, perPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const changePerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return {
    currentPage,
    perPage,
    totalPages,
    paginatedRange,
    goToPage,
    nextPage,
    prevPage,
    changePerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
