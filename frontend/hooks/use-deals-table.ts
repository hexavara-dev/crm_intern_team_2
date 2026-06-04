import { useEffect, useMemo, useState } from "react";

import { useDeals } from "@/hooks/use-deals";

type UseDealsTableOptions = {
  initialPage?: number;
  initialLimit?: number;
};

export function useDealsTable(options: UseDealsTableOptions = {}) {
  const { initialPage = 1, initialLimit = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialLimit);
  const [useServerPaginationMode, setUseServerPaginationMode] = useState(true);

  const dealsQuery = useDeals({
    page: currentPage,
    limit: rowsPerPage,
    useServerPagination: useServerPaginationMode,
  });

  const { pagination, isLoading, isFetching, isSuccess } = dealsQuery;

  useEffect(() => {
    if (
      useServerPaginationMode &&
      currentPage === 1 &&
      isSuccess &&
      !isLoading &&
      !isFetching &&
      !pagination
    ) {
      setUseServerPaginationMode(false);
      setCurrentPage(1);
    }
  }, [
    useServerPaginationMode,
    currentPage,
    isSuccess,
    isLoading,
    isFetching,
    pagination,
  ]);

  useEffect(() => {
    if (
      useServerPaginationMode &&
      pagination &&
      currentPage > pagination.totalPages
    ) {
      setCurrentPage(Math.max(pagination.totalPages, 1));
    }
  }, [currentPage, pagination, useServerPaginationMode]);

  const serverPagination = useMemo(() => {
    if (!useServerPaginationMode || !pagination) {
      return undefined;
    }

    return {
      meta: pagination,
      page: currentPage,
      limit: rowsPerPage,
      isLoading: isLoading || isFetching,
      onPageChange: (nextPage: number) => {
        if (nextPage < 1 || nextPage > pagination.totalPages) return;
        setCurrentPage(nextPage);
      },
      onLimitChange: (nextLimit: number) => {
        setRowsPerPage(nextLimit);
        setCurrentPage(1);
      },
    };
  }, [
    useServerPaginationMode,
    pagination,
    currentPage,
    rowsPerPage,
    isLoading,
    isFetching,
  ]);

  return {
    ...dealsQuery,
    serverPagination,
  };
}
