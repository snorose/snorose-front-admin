import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

interface UseBulkDeleteOptions<TResult> {
  deleteFn: (ids: number[], memo: string) => Promise<TResult>;
  queryKey: QueryKey;
}

interface BulkDeleteVariables {
  ids: number[];
  memo: string;
}

export const useBulkDelete = <TResult>({
  deleteFn,
  queryKey,
}: UseBulkDeleteOptions<TResult>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, memo }: BulkDeleteVariables) => deleteFn(ids, memo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};
