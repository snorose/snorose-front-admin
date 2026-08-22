import { useEffect, useRef } from 'react';

export function useStableTotalPage(
  totalPage: number | undefined,
  currentPage: number
): number {
  const lastTotalPageRef = useRef<number | undefined>(totalPage);

  useEffect(() => {
    if (totalPage !== undefined) lastTotalPageRef.current = totalPage;
  }, [totalPage]);

  return totalPage ?? lastTotalPageRef.current ?? currentPage;
}
