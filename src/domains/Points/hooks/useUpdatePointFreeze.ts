import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdatePointFreeze } from '@/shared/types';

import { patchPointFreezeAPI } from '@/apis';

import { POINT_FREEZES_QUERY_KEY } from './pointFreezeQueryKeys';

export function useUpdatePointFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePointFreeze }) =>
      patchPointFreezeAPI(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: POINT_FREEZES_QUERY_KEY }),
  });
}
