import { useQuery } from '@tanstack/react-query';

import { getAdminInquiryCommentsAPI } from '@/apis/inquiries';

export const useInquiryComments = (postId: number | null) => {
  return useQuery({
    queryKey: ['inquiryComments', postId],
    queryFn: async () => {
      const response = await getAdminInquiryCommentsAPI(postId!);
      if (!response.isSuccess) throw new Error(response.message);
      return response;
    },
    enabled: postId !== null,
  });
};
