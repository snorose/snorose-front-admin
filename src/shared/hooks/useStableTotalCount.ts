import { useEffect, useRef } from 'react';

// 페이지를 제외한 조회 조건이 같을 때만 마지막 건수를 유지한다.
export function useStableTotalCount(
  totalCount: number | undefined,
  conditions: unknown
) {
  const key = JSON.stringify(conditions);
  const previous = useRef<
    { key: string | undefined; count: number } | undefined
  >(undefined);

  useEffect(() => {
    if (totalCount !== undefined) previous.current = { key, count: totalCount };
  }, [key, totalCount]);

  return (
    totalCount ??
    (previous.current?.key === key ? previous.current?.count : undefined)
  );
}
