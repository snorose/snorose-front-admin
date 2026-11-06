import { beforeEach, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import {
  createMockNoticeCreateResponse,
  createMockNoticeListResponse,
} from '@/domains/Notices/mocks/notices';
import { toCreateNoticeRequest } from '@/domains/Notices/utils/api.mapper';

import { createAdminNotice, getAdminNotices } from './notices';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));
beforeEach(() => vi.clearAllMocks());

test('공지 목록 API는 0부터 시작하는 page만 전달하고 result를 반환한다', async () => {
  const response = createMockNoticeListResponse();
  vi.mocked(axiosInstance.get).mockResolvedValue({ data: response });
  expect(await getAdminNotices()).toEqual(response.result);
  expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/admin/notices', {
    params: { page: 0 },
  });
  await getAdminNotices(2);
  expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/admin/notices', {
    params: { page: 2 },
  });
});

test('공지 작성 API는 문서의 요청 필드와 응답 JSON 이름을 사용한다', async () => {
  const request = toCreateNoticeRequest(
    {
      board: '이벤트',
      category: '',
      title: '새 공지',
      content: '본문',
      pinned: false,
      scheduledAt: '',
      attachments: [],
    },
    'draft'
  );
  const response = createMockNoticeCreateResponse(request, 123);
  vi.mocked(axiosInstance.post).mockResolvedValue({ data: response });
  expect(await createAdminNotice(request)).toEqual({
    postId: 123,
    imageUploadUrls: [],
    isDraft: true,
    isScheduled: false,
    scheduledAt: null,
  });
  expect(axiosInstance.post).toHaveBeenCalledWith('/v1/admin/notices', request);
});
