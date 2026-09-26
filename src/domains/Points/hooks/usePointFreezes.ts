import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdatePointFreeze } from '@/shared/types';

import {
  deletePointFreezeAPI,
  getPointFreezesAPI,
  patchPointFreezeAPI,
  postPointFreezeAPI,
} from '@/apis';

const POINT_FREEZES_QUERY_KEY = ['pointFreezes'] as const;

export function usePointFreezes() {
  return useQuery({
    queryKey: POINT_FREEZES_QUERY_KEY,
    queryFn: getPointFreezesAPI,
    staleTime: 0,
  });
}

function useInvalidatePointFreezes() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: POINT_FREEZES_QUERY_KEY });
}

export function useCreatePointFreeze() {
  const invalidate = useInvalidatePointFreezes();
  return useMutation({ mutationFn: postPointFreezeAPI, onSuccess: invalidate });
}

export function useUpdatePointFreeze() {
  const invalidate = useInvalidatePointFreezes();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePointFreeze }) =>
      patchPointFreezeAPI(id, data),
    onSuccess: invalidate,
  });
}

export function useDeletePointFreeze() {
  const invalidate = useInvalidatePointFreezes();
  return useMutation({
    mutationFn: deletePointFreezeAPI,
    onSuccess: invalidate,
  });
}
