import { useQuery } from '@tanstack/react-query';

import { getPointFreezesAPI } from '@/apis';

import { POINT_FREEZES_QUERY_KEY } from './pointFreezeQueryKeys';

export function usePointFreezes() {
  return useQuery({
    queryKey: POINT_FREEZES_QUERY_KEY,
    queryFn: getPointFreezesAPI,
  });
}
