import { beforeEach, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import {
  createAdminFaq,
  deleteAdminFaq,
  getAdminFaqs,
  getAllAdminFaqs,
  updateAdminFaq,
} from './faqs';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const success = <T>(result: T) => ({
  data: { isSuccess: true, code: 1000, message: '성공', result },
});
beforeEach(() => vi.clearAllMocks());

test('hasNext가 끝날 때까지 순서대로 수집해 전체 목록과 정확한 페이지 수를 계산할 수 있다', async () => {
  const first = { faqId: 1, question: '첫 제목' };
  const second = { faqId: 2, question: '둘째 제목' };
  vi.mocked(axiosInstance.get)
    .mockResolvedValueOnce(success({ hasNext: true, data: [first] }))
    .mockResolvedValueOnce(success({ hasNext: false, data: [second] }));
  expect(await getAllAdminFaqs()).toEqual([first, second]);
  expect(axiosInstance.get).toHaveBeenNthCalledWith(
    1,
    '/v1/admin/support/faq',
    { params: { page: 0 } }
  );
  expect(axiosInstance.get).toHaveBeenNthCalledWith(
    2,
    '/v1/admin/support/faq',
    { params: { page: 1 } }
  );
});

test('후속 페이지 실패나 반복 응답을 부분 목록 성공으로 처리하지 않는다', async () => {
  const page = success({ hasNext: true, data: [{ faqId: 1 }] });
  vi.mocked(axiosInstance.get)
    .mockResolvedValueOnce(page)
    .mockRejectedValueOnce(new Error('다음 페이지 실패'));
  await expect(getAllAdminFaqs()).rejects.toThrow('다음 페이지 실패');
  vi.mocked(axiosInstance.get).mockResolvedValue(page);
  await expect(getAllAdminFaqs()).rejects.toThrow(
    '다음 페이지를 확인할 수 없습니다.'
  );
});

test('목록은 0 기반 page를 전송하고 hasNext와 data를 그대로 반환한다', async () => {
  const result = { hasNext: true, data: [] };
  vi.mocked(axiosInstance.get).mockResolvedValue(success(result));
  expect(await getAdminFaqs()).toEqual(result);
  expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/admin/support/faq', {
    params: { page: 0 },
  });
  await getAdminFaqs(2);
  expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/admin/support/faq', {
    params: { page: 2 },
  });
});

test('작성·수정은 category를 보내고 경로에는 faqId를 사용한다', async () => {
  const input = {
    category: '계정',
    question: '질문',
    answer: '첫 줄\n\nhttps://example.com',
  };
  vi.mocked(axiosInstance.post).mockResolvedValue(success({ faqId: 23 }));
  vi.mocked(axiosInstance.patch).mockResolvedValue(success({ faqId: 23 }));
  expect(await createAdminFaq(input)).toEqual({ faqId: 23 });
  expect(axiosInstance.post).toHaveBeenCalledWith(
    '/v1/admin/support/faq',
    input
  );
  expect(await updateAdminFaq(23, input)).toEqual({ faqId: 23 });
  expect(axiosInstance.patch).toHaveBeenCalledWith(
    '/v1/admin/support/faq/23',
    input
  );
});

test('삭제는 faqId 경로를 사용한다', async () => {
  vi.mocked(axiosInstance.delete).mockResolvedValue(success({ faqId: 3 }));
  expect(await deleteAdminFaq(3)).toEqual({ faqId: 3 });
  expect(axiosInstance.delete).toHaveBeenCalledWith('/v1/admin/support/faq/3');
});

test('HTTP 성공이어도 isSuccess가 false이면 실패로 처리한다', async () => {
  vi.mocked(axiosInstance.post).mockResolvedValue({
    data: { isSuccess: false, code: 6101, message: '저장할 수 없습니다.' },
  });
  await expect(
    createAdminFaq({ category: '계정', question: '질문', answer: '답변' })
  ).rejects.toThrow('저장할 수 없습니다.');
});
