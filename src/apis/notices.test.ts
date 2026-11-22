import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import { toCreateNoticeRequest } from '@/domains/Notices/utils/api.mapper';

import {
  createMockNoticeCreateResponse,
  createMockNoticeListResponse,
} from '@/test/fixtures/notices';

import {
  NoticeCreateOutcomeUnknownError,
  NoticeUpdateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  getAdminNotices,
  getAllAdminNotices,
  getNoticeAuthorId,
  updateAdminNotice,
  uploadNoticeFile,
} from './notices';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllGlobals());

test('수정은 PATCH로 전달하고 서버가 돌려준 상태와 예약 일시를 사용한다', async () => {
  const result = {
    postId: 123,
    imageUploadUrls: [],
    status: 'SCHEDULED',
    scheduledAt: '2030-01-01T09:00:00',
  };
  vi.mocked(axiosInstance.patch).mockResolvedValue({
    data: { isSuccess: true, result },
  });
  expect(await updateAdminNotice(123, { title: '수정 제목' })).toEqual(result);
  expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
    '/v1/admin/notices/123',
    { title: '수정 제목' }
  );
  expect(axiosInstance.post).not.toHaveBeenCalled();
});

test('수정 응답 유실·5xx·잘못된 성공 응답은 결과 불명이며 4xx는 입력 수정 후 재시도할 수 있다', async () => {
  for (const status of [undefined, 408, 500, 502]) {
    vi.mocked(axiosInstance.patch).mockRejectedValueOnce({
      isAxiosError: true,
      response: status ? { status } : undefined,
    });
    await expect(
      updateAdminNotice(123, { title: '수정' })
    ).rejects.toBeInstanceOf(NoticeUpdateOutcomeUnknownError);
  }
  const rejection = {
    isAxiosError: true,
    response: { status: 400, data: { message: '입력 오류' } },
  };
  vi.mocked(axiosInstance.patch).mockRejectedValueOnce(rejection);
  await expect(updateAdminNotice(123, {})).rejects.toBe(rejection);
  for (const result of [
    {},
    { postId: 456, status: 'PUBLISHED' },
    { postId: 123, status: 'INVALID' },
  ]) {
    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { isSuccess: true, result },
    });
    await expect(updateAdminNotice(123, {})).rejects.toBeInstanceOf(
      NoticeUpdateOutcomeUnknownError
    );
  }
});

test('작성자 회원 조회는 부분 일치를 제외하고 모든 페이지의 정확한 닉네임을 확인한다', async () => {
  vi.mocked(axiosInstance.get)
    .mockResolvedValueOnce({
      data: {
        result: {
          data: [{ nickname: '운영리자2', encryptedUserId: 'other' }],
          hasNext: true,
        },
      },
    })
    .mockResolvedValueOnce({
      data: {
        result: {
          data: [{ nickname: '운영리자', encryptedUserId: 'correct' }],
          hasNext: false,
        },
      },
    });
  expect(await getNoticeAuthorId('운영리자')).toBe('correct');
  expect(axiosInstance.get).toHaveBeenNthCalledWith(2, '/v2/admin/users', {
    params: { keyword: '운영리자', page: 1 },
  });
});

test('일치하는 작성자가 없거나 닉네임이 중복되면 임의의 회원을 선택하지 않는다', async () => {
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: { result: { data: [], hasNext: false } },
  });
  await expect(getNoticeAuthorId('없는리자')).rejects.toThrow(
    '찾을 수 없습니다'
  );
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: {
      result: {
        data: [
          { nickname: '리자', encryptedUserId: 'a' },
          { nickname: '리자', encryptedUserId: 'b' },
        ],
        hasNext: false,
      },
    },
  });
  await expect(getNoticeAuthorId('리자')).rejects.toThrow('여러 명');
  await expect(getNoticeAuthorId('')).rejects.toThrow('확인할 수 없습니다');
});

test('작성자 검색에서 같은 페이지가 반복되면 조회를 중단한다', async () => {
  vi.mocked(axiosInstance.get).mockResolvedValue({
    data: {
      result: {
        data: [{ nickname: '리자', encryptedUserId: 'a' }],
        hasNext: true,
      },
    },
  });
  await expect(getNoticeAuthorId('리자')).rejects.toThrow('다음 페이지');
  expect(axiosInstance.get).toHaveBeenCalledTimes(2);
});

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

test('브라우저가 MIME을 제공하지 않은 파일도 허용 확장자에 맞는 Content-Type으로 업로드한다', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetcher);
  for (const [name, type] of [
    ['image.jfif', 'image/jpeg'],
    ['video.mov', 'video/quicktime'],
  ]) {
    await uploadNoticeFile(
      'https://upload.test/file',
      new File(['file'], name)
    );
    expect(fetcher).toHaveBeenLastCalledWith(
      'https://upload.test/file',
      expect.objectContaining({ headers: { 'Content-Type': type } })
    );
  }
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
  ).rejects.toThrow('저장 상태를 확인');
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

test('검색용 전체 공지는 totalPage 범위에서 조회하고 페이지의 순서를 유지한다', async () => {
  const responses = [0, 1, 2, 3].map((page) =>
    createMockNoticeListResponse(page)
  );
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
  ).toEqual([0, 1, 2, 3]);
});

test('hasNext가 계속 true여도 totalCount 48·totalPage 5 이후에는 호출하지 않는다', async () => {
  const template = createMockNoticeListResponse();
  vi.mocked(axiosInstance.get).mockImplementation(async (_path, config) => {
    const page = (config?.params as { page: number }).page;
    const count = page === 4 ? 8 : 10;
    return {
      data: {
        ...template,
        result: {
          ...template.result,
          totalCount: 48,
          totalPage: 5,
          currentCount: count,
          hasNext: true,
          data: Array.from({ length: count }, (_, index) => ({
            ...template.result.data[0],
            postId: page * 10 + index,
          })),
        },
      },
    };
  });
  expect(await getAllAdminNotices()).toHaveLength(48);
  expect(axiosInstance.get).toHaveBeenCalledTimes(5);
  expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/admin/notices', {
    params: { page: 4 },
  });
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
