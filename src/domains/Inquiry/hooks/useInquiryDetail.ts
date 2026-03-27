import { useQuery } from '@tanstack/react-query';

import { MOCK_INQUIRIES } from '../mocks/inquiryMocks';
import type { Inquiry } from '../types';

// TODO: 실제 API 연동 시 이 함수를 API 호출로 교체
// GET /v1/inquiries/:id
const fetchInquiryDetail = async (id: number): Promise<Inquiry> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const item = MOCK_INQUIRIES.find((i) => i.id === id);
  if (!item) throw new Error('문의/신고를 찾을 수 없습니다.');
  return item;
};

export const useInquiryDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['inquiryDetail', id],
    queryFn: () => fetchInquiryDetail(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
};
