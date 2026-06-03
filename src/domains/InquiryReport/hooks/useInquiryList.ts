import { useQuery } from '@tanstack/react-query';

import type { InquiryListItem } from '@/shared/types';

import { getAdminInquiriesAPI } from '@/apis/inquiries';

const MAX_INQUIRY_LIST_PAGE_REQUESTS = 100;

export const useInquiryList = () => {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const allData: InquiryListItem[] = [];
      let page = 0;
      let hasNext = true;

      while (hasNext && page < MAX_INQUIRY_LIST_PAGE_REQUESTS) {
        const response = await getAdminInquiriesAPI({ page });
        if (!response.isSuccess) throw new Error(response.message);
        allData.push(...response.result.data);
        hasNext = response.result.hasNext;
        page += 1;
      }

      if (hasNext) {
        throw new Error(
          '문의 및 신고 목록을 불러오는 요청 수가 초과되었습니다.'
        );
      }

      return allData;
    },
  });
};
