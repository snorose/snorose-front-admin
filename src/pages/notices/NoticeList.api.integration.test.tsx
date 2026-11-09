import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';
import { AuthContext } from '@/shared/contexts';
import type { AuthContextType } from '@/shared/types';

import { NoticesProvider } from '@/domains/Notices';
import type {
  AdminCreateNoticeRequest,
  AdminNoticeListItem,
} from '@/domains/Notices/types';

import GeneralNoticePage from './GeneralNoticePage';
import NoticeEditorPage from './NoticeEditorPage';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const items: AdminNoticeListItem[] = Array.from({ length: 23 }, (_, index) => ({
  postId: 5000 - index,
  boardId: index % 2 ? 21 : 12,
  boardName: index % 2 ? '첫눈온방' : '공지사항',
  title: `서버 공지 ${index + 1}`,
  content: `<p>서버 본문 ${index + 1}</p>`,
  adminNickname: index % 2 ? '개발리자' : '운영리자',
  viewCount: index + 1,
  likeCount: index,
  scrapCount: 0,
  status: 'PUBLISHED',
  isNew: index < 11,
  isPinned: false,
  updatedAt: '2026-09-29T00:13:45.312433',
}));
let serverItems = [...items];
const NativeURL = URL;
const nativeFetch = globalThis.fetch;
const response = (page: number, data = serverItems) => ({
  data: {
    isSuccess: true,
    code: 1000,
    message: '성공',
    result: {
      data: data.slice(page * 10, (page + 1) * 10),
      hasNext: (page + 1) * 10 < data.length,
      totalCount: data.length,
      totalPage: Math.ceil(data.length / 10),
      currentCount: data.slice(page * 10, (page + 1) * 10).length,
    },
  },
});
const auth: AuthContextType = {
  user: {
    userId: 101,
    nickname: '관리자',
    balance: 0,
    userRoleId: 4,
    birthday: '',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: async () => ({ success: true }),
  logout: vi.fn(),
  clearError: vi.fn(),
};
const clients: QueryClient[] = [];
const renderPage = (path = '/notices/general') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  clients.push(client);
  const router = createMemoryRouter(
    [
      {
        element: (
          <AuthContext.Provider value={auth}>
            <NoticesProvider>
              <Outlet />
            </NoticesProvider>
          </AuthContext.Provider>
        ),
        children: [
          { path: '/notices/general', element: <GeneralNoticePage /> },
          { path: '/notices/general/new', element: <NoticeEditorPage /> },
          {
            path: '/notices/general/:noticeId/edit',
            element: <NoticeEditorPage />,
          },
          {
            path: '/elsewhere',
            element: <Link to='/notices/general'>공지 목록으로</Link>,
          },
        ],
      },
    ],
    { initialEntries: [path] }
  );
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
};

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.resetAllMocks();
  serverItems = [...items];
  vi.mocked(axiosInstance.get).mockImplementation(async (_path, config) =>
    response((config?.params as { page: number } | undefined)?.page ?? 0)
  );
  vi.mocked(axiosInstance.post).mockImplementation(async (url, body) => {
    if (url !== '/v1/admin/notices')
      return { data: { isSuccess: true, result: {} } };
    const input = body as AdminCreateNoticeRequest;
    const status = input.isDraft
      ? 'DRAFT'
      : input.isScheduled
        ? 'SCHEDULED'
        : 'PUBLISHED';
    serverItems = [
      {
        ...items[0],
        postId: 6000,
        title: input.title,
        content: input.content,
        status,
        isNew: status === 'PUBLISHED',
      },
      ...serverItems,
    ];
    return {
      data: {
        isSuccess: true,
        result: {
          postId: 6000,
          imageUploadUrls: input.images.map(
            (_, index) => `https://upload.test/${index}`
          ),
          isDraft: input.isDraft,
          isScheduled: input.isScheduled,
          scheduledAt: input.scheduledAt,
        },
      },
    };
  });
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  globalThis.URL = NativeURL;
  globalThis.fetch = nativeFetch;
});

describe('실제 목록 조회 경로', () => {
  test('같은 작성자의 공지를 다시 선택해도 미적용 검색어를 지우고 닉네임을 다시 표시한다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general?keywordAuthor=운영리자&page=1');
    await screen.findByText('서버 공지 1', { exact: true });
    await user.clear(screen.getByLabelText('작성자 검색 (닉네임)'));
    await user.type(screen.getByLabelText('작성자 검색 (닉네임)'), '개발리자');
    await user.type(screen.getByLabelText('게시글 검색'), '미적용 검색어');
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    await user.click(screen.getByRole('menuitem', { name: '작성한 공지글' }));
    expect(screen.getByLabelText('작성자 검색 (닉네임)')).toHaveValue(
      '운영리자'
    );
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
    expect(
      new URLSearchParams(router.state.location.search).get('keywordAuthor')
    ).toBe('운영리자');
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBeNull();
  });

  test('게시판·상태·정렬은 즉시 적용하고 미적용 검색어는 유지한다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general?page=3');
    await screen.findByText('서버 공지 23');
    const list = screen.getByRole('region', { name: '공지사항 목록' });
    expect(within(list).getByRole('status')).toHaveTextContent('23');
    expect(
      within(screen.getByRole('form', { name: '공지사항 검색' })).queryByRole(
        'status'
      )
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('게시글 검색'), '서버 공지 1');
    await user.click(screen.getByRole('button', { name: '커뮤니티' }));
    await user.click(screen.getByRole('button', { name: '게시' }));
    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '조회수순' }));
    expect(
      Object.fromEntries(new URLSearchParams(router.state.location.search))
    ).toMatchObject({
      page: '1',
      group: '커뮤니티',
      status: 'published',
      sort: 'views',
    });
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBeNull();
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('서버 공지 1');
    expect(screen.getAllByRole('row')).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '검색' }));
    const applied = new URLSearchParams(router.state.location.search);
    expect(Object.fromEntries(applied)).toMatchObject({
      page: '1',
      keyword: '서버 공지 1',
      group: '커뮤니티',
      status: 'published',
      sort: 'views',
    });
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(axiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('시작·종료일과 정렬을 바꾸면 검색 버튼 없이 조합하고 날짜 해제 시에도 정렬을 유지한다', async () => {
    serverItems = items.slice(0, 6).map((item, index) => ({
      ...item,
      isNew: false,
      updatedAt: `2026-${index === 5 ? '10-01' : `09-${['01', '02', '03', '04', '30'][index]}`}T12:00:00`,
      viewCount: [8, 2, 9, 4, 7, 3][index],
    }));
    const user = userEvent.setup();
    const router = renderPage(
      '/notices/general?startDate=2026-09-02&endDate=2026-09-30'
    );
    await screen.findByText('서버 공지 2');
    const ids = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0].textContent);
    expect(ids()).toEqual(['4999', '4998', '4997', '4996']);
    await user.type(screen.getByLabelText('게시글 검색'), '미적용 검색어');
    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '조회수순' }));
    expect(ids()).toEqual(['4998', '4996', '4997', '4999']);
    expect(
      Object.fromEntries(new URLSearchParams(router.state.location.search))
    ).toMatchObject({
      startDate: '2026-09-02',
      endDate: '2026-09-30',
      sort: 'views',
      page: '1',
    });
    await user.click(screen.getByRole('button', { name: '수정 시작일' }));
    await user.click(screen.getByRole('button', { name: /2026년 9월 3일/ }));
    expect(ids()).toEqual(['4998', '4996', '4997']);
    await user.click(screen.getByRole('button', { name: '수정 종료일' }));
    await user.click(screen.getByRole('button', { name: /2026년 9월 4일/ }));
    expect(ids()).toEqual(['4998', '4997']);
    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '오래된순' }));
    expect(ids()).toEqual(['4997', '4998']);
    expect(
      Object.fromEntries(new URLSearchParams(router.state.location.search))
    ).toMatchObject({
      startDate: '2026-09-03',
      endDate: '2026-09-04',
      sort: 'oldest',
    });
    await user.click(screen.getByRole('button', { name: '수정 종료일' }));
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    expect(ids()).toEqual(['4995', '4996', '4997', '4998']);
    expect(
      new URLSearchParams(router.state.location.search).get('endDate')
    ).toBeNull();
    expect(new URLSearchParams(router.state.location.search).get('sort')).toBe(
      'oldest'
    );
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBeNull();
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('미적용 검색어');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(
      screen.getByText('조건에 맞는 공지사항이 없습니다.')
    ).toBeInTheDocument();
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBe('미적용 검색어');
  });

  test('한글 조합 Enter는 검색하지 않고 일반 Enter로 적용하며 초기화는 편집 중인 값도 지운다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general?keyword=서버%20공지%2023');
    await screen.findByText('서버 공지 23');
    const input = screen.getByLabelText('게시글 검색');
    await user.clear(input);
    await user.type(input, '서버 공지 19');
    expect(
      fireEvent.keyDown(input, {
        key: 'Enter',
        isComposing: true,
        keyCode: 229,
      })
    ).toBe(false);
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBe('서버 공지 23');
    expect(screen.getByText('서버 공지 23')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBe('서버 공지 19');
    expect(screen.getByText('서버 공지 19')).toBeInTheDocument();
    await user.type(screen.getByLabelText('게시글 검색'), '편집 중');
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
    expect(router.state.location.search).toBe('?page=1');
    expect(screen.getAllByRole('row')).toHaveLength(11);
    // 적용된 URL이 이미 초기 상태여도 아직 검색하지 않은 입력은 초기화합니다.
    await user.type(
      screen.getByLabelText('게시글 검색'),
      '아직 검색하지 않은 값'
    );
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
  });

  test('페이지 이동은 편집 중인 검색어를 적용하지 않고 작성자 바로가기·URL 이동은 검색창에 동기화한다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general?page=2');
    await screen.findByText('서버 공지 11');
    await user.type(screen.getByLabelText('게시글 검색'), '미적용 검색어');
    await user.click(screen.getByRole('link', { name: '3' }));
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('미적용 검색어');
    expect(
      new URLSearchParams(router.state.location.search).get('keyword')
    ).toBeNull();
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    await user.click(screen.getByRole('menuitem', { name: '작성한 공지글' }));
    expect(screen.getByLabelText('작성자 검색 (닉네임)')).toHaveValue(
      '운영리자'
    );
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
    await act(() =>
      router.navigate(
        '/notices/general?keyword=서버%20공지%2022&keywordAuthor=개발리자'
      )
    );
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('서버 공지 22');
    expect(screen.getByLabelText('작성자 검색 (닉네임)')).toHaveValue(
      '개발리자'
    );
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await act(() => router.navigate(-1));
    expect(screen.getByLabelText('작성자 검색 (닉네임)')).toHaveValue(
      '운영리자'
    );
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
  });

  test('모든 서버 페이지를 기다린 뒤 개수·10개 페이지네이션과 전체 범위 검색을 적용한다', async () => {
    const user = userEvent.setup();
    let finish!: (value: ReturnType<typeof response>) => void;
    const deferred = new Promise<ReturnType<typeof response>>((resolve) => {
      finish = resolve;
    });
    vi.mocked(axiosInstance.get).mockImplementation(async (_path, config) =>
      (config?.params as { page: number } | undefined)?.page === 1
        ? deferred
        : response((config?.params as { page: number } | undefined)?.page ?? 0)
    );
    renderPage();
    expect(screen.getByText('조회 중…')).toBeInTheDocument();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByText('서버 공지 1', { exact: true })
    ).not.toBeInTheDocument();
    await act(async () => {
      finish(response(1));
    });
    await screen.findByText('서버 공지 1', { exact: true });
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByText('23', { selector: 'span' })).toBeInTheDocument();
    expect(
      vi
        .mocked(axiosInstance.get)
        .mock.calls.map(
          ([, config]) => (config?.params as { page: number } | undefined)?.page
        )
    ).toEqual([0, 1, 2]);
    await user.click(screen.getByRole('link', { name: '3' }));
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getByText('서버 공지 23')).toBeInTheDocument();
    await user.type(screen.getByLabelText('게시글 검색'), '서버 공지 23');
    expect(screen.getAllByRole('row')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(axiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('서버의 NEW를 모두 표시·검색하고 작성자 ID 없이 닉네임으로 작성 공지를 조회한다', async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText('서버 공지 1', { exact: true });
    expect(screen.getAllByText('NEW', { selector: 'span' })).toHaveLength(10);
    await user.click(screen.getByRole('button', { name: 'NEW' }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(screen.getByText('11', { selector: 'span' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await user.click(screen.getByRole('menuitem', { name: '작성한 공지글' }));
    expect(screen.getByLabelText('작성자 검색 (닉네임)')).toHaveValue(
      '운영리자'
    );
    expect(
      new URLSearchParams(router.state.location.search).get('author')
    ).toBeNull();
    expect(
      screen.queryByRole('menuitem', { name: '회원 정보' })
    ).not.toBeInTheDocument();
    for (const row of screen.getAllByRole('row').slice(1)) {
      expect(
        within(row).getByRole('button', { name: / 수정$/ })
      ).toBeDisabled();
      expect(
        within(row).getByRole('button', { name: '운영리자' })
      ).toBeInTheDocument();
    }
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('중간 페이지가 실패하면 일부 데이터나 샘플 대신 오류를 표시하고 다시 조회한다', async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce(response(0))
      .mockRejectedValueOnce(new Error('서버 오류'));
    renderPage();
    await screen.findByRole('alert');
    expect(screen.getByText('개수 확인 불가')).toBeInTheDocument();
    expect(
      screen.queryByText('서버 공지 1', { exact: true })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '1' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 조회' }));
    await screen.findByText('서버 공지 1', { exact: true });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('실제 빈 목록은 빈 상태로 표시하고 다른 탭에서는 공지 API를 호출하지 않는다', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue(response(0, []));
    const router = renderPage('/elsewhere');
    expect(axiosInstance.get).not.toHaveBeenCalled();
    await act(() => router.navigate('/notices/general'));
    await screen.findByText('조건에 맞는 공지사항이 없습니다.');
    expect(axiosInstance.get).toHaveBeenCalledOnce();
  });

  test('수정은 비활성화하고 새 공지 작성은 필수 항목을 검증한다', async () => {
    const router = renderPage('/notices/general/5000/edit');
    expect(
      screen.getByRole('heading', { name: '공지 수정은 준비 중입니다.' })
    ).toBeInTheDocument();
    await act(() => router.navigate('/notices/general/new'));
    expect(screen.getByRole('button', { name: '게시' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '임시저장' })).toBeEnabled();
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '게시판을 선택해 주세요.'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test.each(['published', 'draft', 'scheduled'] as const)(
    '%s를 서버에 저장한 뒤 실제 응답 목록을 다시 조회한다',
    async (status) => {
      const user = userEvent.setup();
      const router = renderPage('/notices/general/new');
      await user.click(screen.getByRole('button', { name: '공지사항' }));
      await user.type(
        screen.getByRole('textbox', { name: /제목/ }),
        '작성 API 연결 확인'
      );
      await user.type(
        screen.getByRole('textbox', { name: '내용' }),
        '본문도 저장'
      );
      let scheduledAt: string | null = null;
      if (status === 'scheduled') {
        await user.click(screen.getByRole('button', { name: '예약' }));
        await user.click(
          screen.getByRole('button', { name: '예약 게시 일시' })
        );
        await user.click(
          screen.getByRole('button', { name: '다음 달로 이동' })
        );
        const month = screen
          .getByRole('grid')
          .getAttribute('aria-label')!
          .match(/(\d+)년 (\d+)월/)!;
        await user.click(
          screen.getByRole('button', {
            name: new RegExp(`${month[1]}년 ${Number(month[2])}월 1일`),
          })
        );
        scheduledAt = `${month[1]}-${month[2].padStart(2, '0')}-01T00:00:00`;
      }
      await user.click(
        screen.getByRole('button', {
          name:
            status === 'draft'
              ? '임시저장'
              : status === 'scheduled'
                ? '예약 게시'
                : '게시',
        })
      );
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: status === 'draft' ? '임시저장' : '저장',
        })
      );
      await screen.findByRole('heading', { name: '일반 공지 관리' });
      await screen.findByText('작성 API 연결 확인');
      expect(axiosInstance.post).toHaveBeenCalledExactlyOnceWith(
        '/v1/admin/notices',
        expect.objectContaining({
          isDraft: status === 'draft',
          isScheduled: status === 'scheduled',
          scheduledAt,
          title: '작성 API 연결 확인',
          content: '<p>본문도 저장</p>',
          images: [],
        })
      );
      expect(
        new URLSearchParams(router.state.location.search).get('status')
      ).toBe(status === 'published' ? null : status);
    }
  );

  test('API 실패 시 입력을 유지하고 저장 중 제출 연타를 막는다', async () => {
    const user = userEvent.setup();
    renderPage('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '실패해도 남는 제목'
    );
    let fail!: (reason: Error) => void;
    vi.mocked(axiosInstance.post).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        })
    );
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    expect(screen.getByRole('button', { name: '저장 중…' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /제목/ })).toBeDisabled();
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    await act(async () => {
      fail(
        Object.assign(new Error('등록 실패'), {
          isAxiosError: true,
          response: { status: 400, data: { message: '등록 실패' } },
        })
      );
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('등록 실패');
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '실패해도 남는 제목'
    );
    expect(screen.getByRole('button', { name: '게시' })).toBeEnabled();
  });

  test('저장 응답이 유실되면 입력을 보존하고 중복 저장 대신 새 창의 목록 확인을 안내한다', async () => {
    vi.mocked(axiosInstance.post).mockRejectedValueOnce(
      new Error('Network Error')
    );
    const user = userEvent.setup();
    renderPage('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '응답 유실 제목'
    );
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '저장 결과를 확인하지 못했습니다.'
    );
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '응답 유실 제목'
    );
    const checkList = screen.getByRole('link', {
      name: '목록에서 확인 (새 창)',
    });
    expect(checkList).toHaveAttribute('target', '_blank');
    expect(checkList).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.queryByRole('button', { name: '임시저장' })
    ).not.toBeInTheDocument();
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('첨부 삭제와 작성 화면 이탈 시 객체 URL을 해제하며 순서 이동 시에는 유지한다', async () => {
    let index = 0;
    globalThis.URL = class extends NativeURL {
      static createObjectURL = vi.fn(() => `blob:preview-${++index}`);
      static revokeObjectURL = vi.fn();
    };
    const user = userEvent.setup();
    const router = renderPage('/notices/general/new');
    await user.upload(screen.getByLabelText('이미지 파일 선택'), [
      new File(['a'], 'A.png', { type: 'image/png' }),
      new File(['b'], 'B.png', { type: 'image/png' }),
    ]);
    await user.click(screen.getByRole('button', { name: 'B.png 앞으로 이동' }));
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'A.png 삭제' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '삭제' })
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      'blob:preview-1'
    );
    await act(() => router.navigate('/notices/general'));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '나가기' })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenLastCalledWith('blob:preview-2');
  });

  test('첨부 실패 뒤에는 입력을 잠그고 새 POST 없이 남은 업로드만 재시도한다', async () => {
    globalThis.URL = class extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:upload');
      static revokeObjectURL = vi.fn();
    };
    const uploads = vi
      .fn()
      .mockResolvedValue({ ok: true })
      .mockRejectedValueOnce(new Error('업로드 실패'));
    globalThis.fetch = uploads;
    const user = userEvent.setup();
    renderPage('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '첨부 재시도 확인'
    );
    await user.upload(screen.getByLabelText('이미지 파일 선택'), [
      new File(['1'], 'one.png', { type: 'image/png' }),
      new File(['2'], 'two.png', { type: 'image/png' }),
    ]);
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '공지 6000번은 생성되었습니다.'
    );
    expect(screen.getByRole('textbox', { name: /제목/ })).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: '첨부 처리 다시 시도' })
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '다시 시도',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    await screen.findByText('첨부 재시도 확인');
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(uploads).toHaveBeenCalledTimes(3);
  });

  test('저장 응답·파일 업로드·재시도 대기 중과 지연 drop에서 최초 첨부 순서를 유지한다', async () => {
    globalThis.URL = class extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:locked-upload');
      static revokeObjectURL = vi.fn();
    };
    let rejectUpload!: (error: Error) => void;
    const firstUpload = new Promise((_resolve, reject) => {
      rejectUpload = reject;
    });
    const uploads = vi
      .fn()
      .mockResolvedValue({ ok: true })
      .mockReturnValueOnce(firstUpload);
    globalThis.fetch = uploads;
    const acknowledgement = {
      data: {
        isSuccess: true,
        result: {
          postId: 6000,
          imageUploadUrls: ['https://upload.test/0', 'https://upload.test/1'],
          isDraft: true,
          isScheduled: false,
          scheduledAt: null,
        },
      },
    };
    let acknowledge!: (value: typeof acknowledgement) => void;
    vi.mocked(axiosInstance.post).mockReturnValueOnce(
      new Promise<typeof acknowledgement>((resolve) => {
        acknowledge = resolve;
      })
    );
    const user = userEvent.setup();
    renderPage('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '저장 중 순서 잠금'
    );
    await user.upload(screen.getByLabelText('이미지 파일 선택'), [
      new File(['a'], 'A.png', { type: 'image/png' }),
      new File(['b'], 'B.png', { type: 'image/png' }),
    ]);
    const list = () => screen.getByRole('list', { name: '첨부 순서' });
    const cards = () => within(list()).getAllByRole('listitem');
    const values = new Map<string, string>();
    const dataTransfer = {
      setData: (type: string, value: string) => values.set(type, value),
      getData: (type: string) => values.get(type) ?? '',
      effectAllowed: '',
      dropEffect: '',
    };
    // 저장 직전에 시작한 드래그의 데이터가 나중에 drop되어도 순서를 바꾸지 않습니다.
    fireEvent.dragStart(cards()[1], { dataTransfer });
    const assertLocked = () => {
      for (const card of cards())
        expect(card).toHaveAttribute('draggable', 'false');
      for (const button of within(list()).getAllByRole('button'))
        expect(button).toBeDisabled();
      fireEvent.drop(cards()[0], { dataTransfer });
      fireEvent.keyDown(cards()[1], { key: 'ArrowLeft' });
      fireEvent.click(
        screen.getByRole('button', { name: 'B.png 앞으로 이동' })
      );
      fireEvent.click(screen.getByRole('button', { name: 'A.png 삭제' }));
      expect(
        within(list())
          .getAllByRole('link')
          .map((link) => link.textContent)
      ).toEqual(['A.png', 'B.png']);
      expect(within(cards()[0]).getByText('썸네일')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    };
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    assertLocked();
    expect(uploads).not.toHaveBeenCalled();
    serverItems = [
      {
        ...items[0],
        postId: 6000,
        title: '저장 중 순서 잠금',
        status: 'DRAFT',
        isNew: false,
      },
      ...items,
    ];
    await act(async () => {
      acknowledge(acknowledgement);
    });
    await waitFor(() => expect(uploads).toHaveBeenCalledTimes(2));
    assertLocked();
    await act(async () => {
      rejectUpload(new Error('업로드 실패'));
    });
    await screen.findByRole('alert');
    expect(
      screen.getByRole('button', { name: '첨부 처리 다시 시도' })
    ).toBeEnabled();
    assertLocked();
    const sent = vi.mocked(axiosInstance.post).mock
      .calls[0][1] as AdminCreateNoticeRequest;
    expect(sent.images.map((image) => image.fileName)).toEqual([
      'A.png',
      'B.png',
    ]);
    await user.click(
      screen.getByRole('button', { name: '첨부 처리 다시 시도' })
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '다시 시도',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(
      uploads.mock.calls.map(([, options]) => (options.body as File).name)
    ).toEqual(['A.png', 'B.png', 'A.png']);
  });
});
