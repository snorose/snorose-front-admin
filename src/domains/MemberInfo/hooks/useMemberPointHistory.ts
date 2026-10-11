import { useInfiniteQuery } from '@tanstack/react-query';

import { getMemberPointHistoryAPI } from '@/apis';

export const memberPointHistoryQueryKey = (encryptedUserId: string) =>
  ['member-point-history', encryptedUserId] as const;

export function useMemberPointHistory(encryptedUserId: string, open: boolean) {
  return useInfiniteQuery({
    queryKey: memberPointHistoryQueryKey(encryptedUserId),
    queryFn: ({ pageParam, signal }) =>
      getMemberPointHistoryAPI(encryptedUserId, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
    enabled: open && Boolean(encryptedUserId),
  });
}
