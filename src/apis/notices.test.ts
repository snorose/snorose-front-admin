import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import { toCreateNoticeRequest } from '@/domains/Notices/utils/api.mapper';

import {
  createMockNoticeCreateResponse,
  createMockNoticeListResponse,
} from '@/test/fixtures/notices';

import {
  NoticeCreateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  getAdminNotices,
  getAllAdminNotices,
  uploadNoticeFile,
} from './notices';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));
beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllGlobals());

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

test('presigned 업로드는 파일 원본을 보내며 인증 헤더와 쿠키를 전달하지 않는다', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetcher);
  const file = new File(['image'], 'image.png', { type: 'image/png' });
  await uploadNoticeFile('https://upload.test/photo', file);
  expect(fetcher).toHaveBeenCalledWith(
    'https://upload.test/photo',
    expect.objectContaining({
      method: 'PUT',
      body: file,
      credentials: 'omit',
      redirect: 'error',
      headers: { 'Content-Type': 'image/png' },
    })
  );
  fetcher.mockResolvedValueOnce({ ok: false });
  await expect(
    uploadNoticeFile('https://upload.test/photo', file)
  ).rejects.toThrow('업로드에 실패');
});

test('파일 업로드는 HTTPS 주소만 사용하고 접근 거절 시 복구 안내를 제공한다', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
  vi.stubGlobal('fetch', fetcher);
  const file = new File(['image'], 'image.png', { type: 'image/png' });
  for (const url of [
    'http://upload.test/file',
    'https://user:password@upload.test/file',
  ])
    await expect(uploadNoticeFile(url, file)).rejects.toThrow('주소');
  expect(fetcher).not.toHaveBeenCalled();
  await expect(
    uploadNoticeFile('https://upload.test/photo', file)
  ).rejects.toThrow('만료되었거나 접근이 거절');
  fetcher.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  await expect(
    uploadNoticeFile('https://upload.test/photo', file)
  ).rejects.toThrow('네트워크 상태를 확인');
});

test('썸네일 API는 업로드 이후 유저단과 같은 경로로 요청한다', async () => {
  vi.mocked(axiosInstance.post).mockResolvedValue({
    data: { isSuccess: true, result: {} },
  });
  await createNoticeThumbnail(12, 123);
  expect(axiosInstance.post).toHaveBeenCalledExactlyOnceWith(
    '/v1/boards/12/posts/123/thumbnail'
  );
});

test('전체 공지를 hasNext가 끝날 때까지 조회하고 페이지의 순서를 유지한다', async () => {
  const responses = [0, 1, 2].map((page) => createMockNoticeListResponse(page));
  for (const response of responses)
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: response });
  expect(await getAllAdminNotices()).toEqual(
    responses.flatMap((response) => response.result.data)
  );
  expect(
    vi
      .mocked(axiosInstance.get)
      .mock.calls.map(
        ([, config]) => (config?.params as { page: number } | undefined)?.page
      )
  ).toEqual([0, 1, 2]);
});

test('중간 페이지 실패 시 일부 목록을 성공 응답으로 반환하지 않는다', async () => {
  vi.mocked(axiosInstance.get)
    .mockResolvedValueOnce({ data: createMockNoticeListResponse(0) })
    .mockRejectedValueOnce(new Error('조회 실패'));
  await expect(getAllAdminNotices()).rejects.toThrow('조회 실패');
});

test('같은 페이지 안에서 중복된 공지도 한 번만 표시한다', async () => {
  const response = createMockNoticeListResponse(0);
  const first = response.result.data[0];
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: {
      ...response,
      result: { ...response.result, hasNext: false, data: [first, first] },
    },
  });
  expect(await getAllAdminNotices()).toEqual([first]);
});

test('다음 페이지가 반복되면 중단하고 응답 실패도 오류로 처리한다', async () => {
  vi.mocked(axiosInstance.get).mockResolvedValue({
    data: createMockNoticeListResponse(0),
  });
  await expect(getAllAdminNotices()).rejects.toThrow('다음 페이지');
  expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: { isSuccess: false, message: '조회 권한이 없습니다.' },
  });
  await expect(getAdminNotices()).rejects.toThrow('조회 권한이 없습니다.');
});

test('빈 목록은 한 번만 조회한다', async () => {
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: createMockNoticeListResponse(0, []),
  });
  expect(await getAllAdminNotices()).toEqual([]);
  expect(axiosInstance.get).toHaveBeenCalledOnce();
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

test('응답 유실·타임아웃·5xx와 명확한 4xx·업무 거절 응답을 구분한다', async () => {
  const request = toCreateNoticeRequest(
    {
      board: '공지사항',
      category: '',
      title: '결과 확인',
      content: '',
      pinned: false,
      scheduledAt: '',
      attachments: [],
    },
    'draft'
  );
  for (const status of [undefined, 408, 500, 502]) {
    vi.mocked(axiosInstance.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: status ? { status } : undefined,
    });
    await expect(createAdminNotice(request)).rejects.toBeInstanceOf(
      NoticeCreateOutcomeUnknownError
    );
  }
  const rejection = {
    isAxiosError: true,
    response: { status: 400, data: { message: '입력 오류' } },
  };
  vi.mocked(axiosInstance.post).mockRejectedValueOnce(rejection);
  await expect(createAdminNotice(request)).rejects.toBe(rejection);
  vi.mocked(axiosInstance.post).mockResolvedValueOnce({
    data: { isSuccess: false, message: '작성 권한이 없습니다.' },
  });
  await expect(createAdminNotice(request)).rejects.toThrow('작성 권한');
  vi.mocked(axiosInstance.post).mockResolvedValueOnce({
    data: { isSuccess: true, result: {} },
  });
  await expect(createAdminNotice(request)).rejects.toBeInstanceOf(
    NoticeCreateOutcomeUnknownError
  );
});
