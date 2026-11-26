import { queryOptions } from '@tanstack/react-query';

import { getPopupDetail } from '@/apis/popups';

export function popupDetailQueryOptions(id: number | null) {
  return queryOptions({
    queryKey: ['popups', 'detail', id],
    queryFn: () => {
      if (id === null) throw new Error('팝업 ID가 없습니다.');
      return getPopupDetail(id);
    },
    enabled: id !== null,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
