import { useQuery } from '@tanstack/react-query';

import { getAdminInquiryDetailAPI } from '@/apis/inquiries';

export const useInquiryDetail = (postId: number | null) => {
  return useQuery({
    queryKey: ['inquiryDetail', postId],
    queryFn: async () => {
      const response = await getAdminInquiryDetailAPI(postId!);
      return response;
    },
    enabled: postId !== null,
  });
};
