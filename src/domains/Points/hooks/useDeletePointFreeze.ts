import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePointFreezeAPI } from '@/apis';

import { POINT_FREEZES_QUERY_KEY } from './pointFreezeQueryKeys';

export function useDeletePointFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePointFreezeAPI,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: POINT_FREEZES_QUERY_KEY }),
  });
}
