import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminFaq,
  deleteAdminFaq,
  getAllAdminFaqs,
  updateAdminFaq,
} from '@/apis/faqs';

import type { FaqInput } from '../types';

const FAQ_QUERY_KEY = ['adminFaqs'] as const;

export function useFaqs() {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: FAQ_QUERY_KEY,
    queryFn: getAllAdminFaqs,
  });
  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });

  const saveMutation = useMutation({
    mutationFn: ({ faqId, input }: { faqId?: number; input: FaqInput }) =>
      faqId === undefined
        ? createAdminFaq(input)
        : updateAdminFaq(faqId, input),
    onSuccess: refreshList,
  });
  const deleteMutation = useMutation({
    mutationFn: (faqId: number) => deleteAdminFaq(faqId),
    onSuccess: refreshList,
  });

  return { listQuery, saveMutation, deleteMutation };
}
