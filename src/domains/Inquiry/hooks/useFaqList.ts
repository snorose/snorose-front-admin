import { useQuery } from '@tanstack/react-query';

import { MOCK_FAQS } from '../mocks/inquiryMocks';
import type { Faq } from '../types';

// TODO: 실제 API 연동 시 교체
// GET /v1/inquiries/faqs
const fetchFaqList = async (): Promise<Faq[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [...MOCK_FAQS];
};

export const useFaqList = () => {
  return useQuery({
    queryKey: ['faqList'],
    queryFn: fetchFaqList,
    staleTime: 1000 * 60 * 5,
  });
};
