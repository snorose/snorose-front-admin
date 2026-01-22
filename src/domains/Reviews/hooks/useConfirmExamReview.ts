import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmExamReview } from '@/apis/reviews';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const useConfirmExamReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isConfirmed,
    }: {
      reviewId: number;
      isConfirmed: boolean;
    }) => {
      const response = await confirmExamReview(reviewId, { isConfirmed });
      if (!response.isSuccess) {
        throw new Error(
          response.message || '시험 후기 상태 변경에 실패했습니다.'
        );
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['examReviews'],
      });

      const statusName =
        variables.isConfirmed === true ? '확인완료' : '미확인 족보';
      toast.success(`시험 후기가 ${statusName}로 변경되었습니다.`);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 상태 변경에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
};
