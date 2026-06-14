import { useState, useMemo } from 'react';

export function usePagination<T>(data: T[], perPage: number = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / perPage);

  const paginated = useMemo(
    () => data.slice((page - 1) * perPage, page * perPage),
    [data, page, perPage],
  );

  return { page, setPage, totalPages, paginated };
}
