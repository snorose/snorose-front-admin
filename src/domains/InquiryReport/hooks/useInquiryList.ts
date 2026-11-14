import { useQuery } from '@tanstack/react-query';

import type { InquiryListItem } from '@/shared/types';

import {
  type AdminInquiryListParams,
  getAdminInquiriesAPI,
} from '@/apis/inquiries';

const MAX_INQUIRY_LIST_PAGE_REQUESTS = 100;

type InquiryListFilters = Pick<
  AdminInquiryListParams,
  'searchKey' | 'group' | 'subGroup'
>;

export const useInquiryList = (filters: InquiryListFilters = {}) => {
  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: async ({ signal }) => {
      const allData: InquiryListItem[] = [];
      let page = 0;
      let hasNext = true;

      while (hasNext && page < MAX_INQUIRY_LIST_PAGE_REQUESTS) {
        signal.throwIfAborted();
        const response = await getAdminInquiriesAPI(
          { ...filters, page },
          signal
        );
        allData.push(...response.data);
        hasNext = response.hasNext;
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
