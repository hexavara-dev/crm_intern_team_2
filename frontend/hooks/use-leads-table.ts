import { useEffect, useMemo, useState } from "react";

import { useLeads } from "@/hooks/use-leads";
import { useAuth } from "@/components/auth/auth-provider";

type UseLeadsTableOptions = {
  initialPage?: number;
  initialLimit?: number;
};

export function useLeadsTable(options: UseLeadsTableOptions = {}) {
  const { initialPage = 1, initialLimit = 10 } = options;
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialLimit);
  const [useServerPaginationMode, setUseServerPaginationMode] = useState(true);

  const leadsQuery = useLeads({
    page: currentPage,
    limit: rowsPerPage,
    useServerPagination: useServerPaginationMode,
    additionalParams: {
      assignedUserId: user?.role === "owner" ? undefined : user?.id,
      isDeleted: false,
    },
    getAll: true,
  });

  const { pagination, isLoading, isFetching, isSuccess } = leadsQuery;

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
    ...leadsQuery,
    serverPagination,
  };
}
