import { Table } from '@tanstack/react-table';

export const usePagination = <TData,>(table: Table<TData>) => {
  const totalItems = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const goToNextPage = () => table.nextPage();
  const goToPreviousPage = () => table.previousPage();

  return {
    totalItems,
    currentPage,
    totalPages,
    canNextPage: table.getCanNextPage(),
    canPreviousPage: table.getCanPreviousPage(),
    goToNextPage,
    goToPreviousPage,
  };
};