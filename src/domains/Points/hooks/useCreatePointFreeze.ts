import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postPointFreezeAPI } from '@/apis';

import { POINT_FREEZES_QUERY_KEY } from './pointFreezeQueryKeys';

export function useCreatePointFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPointFreezeAPI,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: POINT_FREEZES_QUERY_KEY }),
  });
}
