import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type { Faq, FaqInput, FaqPage, FaqResult } from '@/domains/Faqs/types';

const FAQ_ENDPOINT = '/v1/admin/support/faq';

function unwrap<T>(response: BaseResponse<T>): T {
  if (!response.isSuccess) throw new Error(response.message);
  return response.result;
}

export async function getAdminFaqs(page = 0): Promise<FaqPage> {
  const { data } = await axiosInstance.get<BaseResponse<FaqPage>>(
    FAQ_ENDPOINT,
    { params: { page } }
  );
  return unwrap(data);
}

// hasNext가 끝날 때까지 수집해 정확한 개수와 번호형 페이지네이션에 사용합니다.
export async function getAllAdminFaqs(): Promise<Faq[]> {
  const faqs: Faq[] = [];
  const seen = new Set<number>();
  for (let page = 0; ; page += 1) {
    const result = await getAdminFaqs(page);
    const fresh = result.data.filter((faq) => !seen.has(faq.faqId));
    for (const faq of fresh) {
      seen.add(faq.faqId);
      faqs.push(faq);
    }
    if (!result.hasNext) return faqs;
    if (!fresh.length)
      throw new Error('FAQ 목록의 다음 페이지를 확인할 수 없습니다.');
  }
}

export async function createAdminFaq(input: FaqInput): Promise<FaqResult> {
  const { data } = await axiosInstance.post<BaseResponse<FaqResult>>(
    FAQ_ENDPOINT,
    input
  );
  return unwrap(data);
}

export async function updateAdminFaq(
  faqId: number,
  input: FaqInput
): Promise<FaqResult> {
  const { data } = await axiosInstance.patch<BaseResponse<FaqResult>>(
    `${FAQ_ENDPOINT}/${faqId}`,
    input
  );
  return unwrap(data);
}

export async function deleteAdminFaq(faqId: number): Promise<FaqResult> {
  const { data } = await axiosInstance.delete<BaseResponse<FaqResult>>(
    `${FAQ_ENDPOINT}/${faqId}`
  );
  return unwrap(data);
}
