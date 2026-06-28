import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { InquiryStatus } from '@/shared/types';

import { updateAdminInquiryStatusAPI } from '@/apis/inquiries';

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inquiryId,
      status,
    }: {
      inquiryId: number;
      status: InquiryStatus;
    }) => {
      return await updateAdminInquiryStatusAPI(inquiryId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiryDetail'] });
      toast.success('문의 및 신고 상태가 변경되었습니다.');
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : '상태 변경에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
    },
  });
};
