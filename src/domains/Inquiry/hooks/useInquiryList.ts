import { useQuery } from '@tanstack/react-query';

import { MOCK_INQUIRIES } from '../mocks/inquiryMocks';
import type { Inquiry, InquiryListParams } from '../types';

interface UseInquiryListParams extends InquiryListParams {
  enabled?: boolean;
}

const PAGE_SIZE = 10;

// TODO: 실제 API 연동 시 이 함수를 API 호출로 교체
// GET /v1/inquiries?keyword=&category=&subCategory=&status=&dateFrom=&dateTo=&page=
const fetchInquiryList = async (
  params: InquiryListParams
): Promise<{ data: Inquiry[]; hasNext: boolean; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // 로딩 시뮬레이션

  let filtered = [...MOCK_INQUIRIES];

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.contentPreview.toLowerCase().includes(kw) ||
        item.userId.toLowerCase().includes(kw) ||
        item.userName.toLowerCase().includes(kw)
    );
  }

  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }

  if (params.subCategory) {
    filtered = filtered.filter(
      (item) => item.subCategory === params.subCategory
    );
  }

  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params.dateFrom) {
    filtered = filtered.filter((item) => item.createdAt >= params.dateFrom!);
  }

  if (params.dateTo) {
    filtered = filtered.filter((item) => item.createdAt <= params.dateTo!);
  }

  const total = filtered.length;
  const page = params.page ?? 1;
  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  return {
    data: paged,
    hasNext: start + PAGE_SIZE < total,
    total,
  };
};

export const useInquiryList = (params: UseInquiryListParams = {}) => {
  const { enabled = true, ...listParams } = params;

  return useQuery({
    queryKey: [
      'inquiryList',
      listParams.keyword,
      listParams.category,
      listParams.subCategory,
      listParams.status,
      listParams.dateFrom,
      listParams.dateTo,
      listParams.page,
    ],
    queryFn: () => fetchInquiryList(listParams),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
