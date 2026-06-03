import { useQuery } from '@tanstack/react-query';

import type { InquiryListItem } from '@/shared/types';

import { getAdminInquiriesAPI } from '@/apis/inquiries';

export const useInquiryList = () => {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const allData: InquiryListItem[] = [];
      let page = 0;
      let hasNext = true;

      while (hasNext) {
        const response = await getAdminInquiriesAPI({ page });
        if (!response.isSuccess) throw new Error(response.message);
        allData.push(...response.result.data);
        hasNext = response.result.hasNext;
        page += 1;
      }

      return allData;
    },
  });
};
