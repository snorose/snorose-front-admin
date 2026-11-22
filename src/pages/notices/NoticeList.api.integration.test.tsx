import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom';

import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
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
import { toast } from 'sonner';
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

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
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
          { path: '/member/info/:memberKey', element: <p>작성자 회원 상세</p> },
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
  vi.mocked(axiosInstance.get).mockImplementation(async (path, config) => {
    if (String(path).startsWith('/v1/admin/users/'))
      return {
        data: {
          result: {
            encryptedUserId: String(path).split('/').at(-1),
            userName: '운영자',
            loginId: 'admin',
            studentNumber: '20260000',
            nickname: '운영리자',
            pointBalance: 10,
            totalWarningCount: 0,
            isBlacklist: false,
          },
        },
      };
    if (String(path).startsWith('/v1/admin/posts/')) {
      const item = serverItems.find(
        (item) => item.postId === Number(String(path).split('/').at(-1))
      )!;
      return {
        data: {
          result: {
            ...item,
            isNotice: true,
            category: '일반',
            encryptedUserId: 'server-author',
            createdAt: item.updatedAt,
          },
        },
      };
    }
    return response(
      (config?.params as { page: number } | undefined)?.page ?? 0
    );
  });
  vi.mocked(axiosInstance.patch).mockImplementation(async (url, body) => {
    const id = Number(String(url).split('/').at(-1));
    const input =
      body as import('@/domains/Notices/types').AdminUpdateNoticeRequest;
    serverItems = serverItems.map((item) =>
      item.postId !== id
        ? item
        : {
            ...item,
            title: input.title ?? item.title,
            content: input.content ?? item.content,
            status: input.scheduledAt
              ? 'SCHEDULED'
              : input.isVisible === undefined
                ? item.status
                : input.isVisible
                  ? 'PUBLISHED'
                  : 'PRIVATE',
          }
    );
    const item = serverItems.find((item) => item.postId === id)!;
    return {
      data: {
        isSuccess: true,
        result: {
          postId: id,
          imageUploadUrls: [],
          status: item.status,
          scheduledAt:
            item.status === 'SCHEDULED'
              ? (input.scheduledAt ?? '2030-01-01T09:00:00')
              : null,
        },
      },
    };
  });
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
  test.each([
    ['USER_DELETED', '유저 삭제', 'PUBLISHED'],
    ['ADMIN_DELETED', '어드민 삭제', 'PUBLISHED'],
    ['USER_DELETED', '유저 삭제', 'PRIVATE'],
    ['ADMIN_DELETED', '어드민 삭제', 'PRIVATE'],
  ] as const)(
    '%s / %s / %s 공지는 제목·본문을 읽기 전용으로 표시하고 하단 변경 버튼을 비활성화한다',
    async (deletionStatus, label, status) => {
      serverItems[0] = { ...serverItems[0], status };
      const normalGet = vi.mocked(axiosInstance.get).getMockImplementation()!;
      vi.mocked(axiosInstance.get).mockImplementation(async (...args) => {
        if (!String(args[0]).startsWith('/v1/admin/posts/'))
          return normalGet(...args);
        return {
          data: {
            result: {
              ...serverItems[0],
              isNotice: true,
              adminCommonStatuses: [deletionStatus],
            },
          },
        };
      });
      const user = userEvent.setup();
      const router = renderPage('/notices/general/5000/edit');
      await screen.findByRole('heading', { name: '공지사항 조회' });
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(
        screen.getByText('삭제된 공지는 읽기 전용으로 표시됩니다.')
      ).toBeInTheDocument();
      const title = screen.getByRole('textbox', { name: /제목/ });
      expect(title).toHaveValue('서버 공지 1');
      expect(title).toBeDisabled();
      const content = screen.getByRole('textbox', { name: '내용' });
      expect(content).toHaveTextContent('서버 본문 1');
      await waitFor(() =>
        expect(content).toHaveAttribute('contenteditable', 'false')
      );
      expect(content).toHaveAttribute('aria-readonly', 'true');
      for (const name of [
        status === 'PRIVATE' ? '공개' : '비공개',
        status === 'PRIVATE' ? '비공개로 저장' : '수정사항 반영',
      ]) {
        const button = screen.getByRole('button', { name });
        expect(button).toBeDisabled();
        await user.click(button);
      }
      if (status === 'PUBLISHED')
        expect(screen.getByRole('button', { name: '예약' })).toBeDisabled();
      await user.type(title, '변경 시도');
      expect(title).toHaveValue('서버 공지 1');
      fireEvent.submit(title.closest('form')!);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(axiosInstance.patch).not.toHaveBeenCalled();
      expect(axiosInstance.post).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: '목록으로' }));
      await screen.findByRole('heading', { name: '일반 공지 관리' });
      expect(router.state.location.pathname).toBe('/notices/general');
    }
  );

  test('다른 창에서 임시저장 공지를 게시한 뒤 돌아오면 최신 서버 순서로 목록을 갱신한다', async () => {
    serverItems[22] = { ...serverItems[22], status: 'DRAFT' };
    renderPage();
    await screen.findByText('서버 공지 1', { selector: 'tbody p' });
    try {
      focusManager.setFocused(false);
      const published = {
        ...serverItems[22],
        status: 'PUBLISHED' as const,
        isNew: true,
        updatedAt: '2026-11-22T23:36:34',
      };
      serverItems = [
        published,
        ...serverItems.filter((item) => item.postId !== published.postId),
      ];
      await act(async () => focusManager.setFocused(true));
      await screen.findByText('서버 공지 23', { selector: 'tbody p' });
      expect(
        within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0]
      ).toHaveTextContent('4978');
      expect(
        vi
          .mocked(axiosInstance.get)
          .mock.calls.filter(([url]) => url === '/v1/admin/notices')
          .map(
            ([, config]) =>
              (config?.params as { page: number } | undefined)?.page
          )
      ).toEqual([0, 0]);
    } finally {
      focusManager.setFocused(undefined);
    }
  });

  test.each([
    ['PUBLISHED', 'PRIVATE', '공개', '비공개'],
    ['PRIVATE', 'PUBLISHED', '비공개', '공개'],
  ] as const)(
    '목록을 연 뒤 %s에서 %s로 변경된 공지는 최신 상태에 맞는 전환 버튼을 표시한다',
    async (initialStatus, latestStatus, expectedAction, previousAction) => {
      serverItems[0] = { ...serverItems[0], status: initialStatus };
      const user = userEvent.setup();
      renderPage();
      clients.at(-1)!.setDefaultOptions({
        queries: { retry: false, gcTime: 0, staleTime: 300_000 },
      });
      await screen.findByText('서버 공지 1', { selector: 'tbody p' });
      serverItems[0] = { ...serverItems[0], status: latestStatus };
      await user.click(screen.getByRole('link', { name: '서버 공지 1 수정' }));
      await screen.findByRole('heading', { name: '공지사항 수정' });
      expect(
        screen.getByRole('button', { name: expectedAction })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: previousAction })
      ).not.toBeInTheDocument();
      expect(
        vi
          .mocked(axiosInstance.get)
          .mock.calls.filter(([url]) => url === '/v1/admin/notices')
          .map(
            ([, config]) =>
              (config?.params as { page: number } | undefined)?.page
          )
      ).toEqual([0, 0]);
      await user.click(screen.getByRole('button', { name: expectedAction }));
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
      );
      await screen.findByRole('heading', { name: '일반 공지 관리' });
      expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
        '/v1/admin/notices/5000',
        { isVisible: latestStatus === 'PRIVATE' }
      );
    }
  );

  test('상태 변경으로 공지가 캐시된 마지막 페이지에서 이동해도 최신 상태를 찾는다', async () => {
    const user = userEvent.setup();
    renderPage('/notices/general?page=3');
    await screen.findByText('서버 공지 21', { selector: 'tbody p' });
    const moved = { ...serverItems[20], status: 'PRIVATE' as const };
    serverItems = [
      moved,
      ...serverItems.filter((item) => item.postId !== moved.postId),
    ];
    await user.click(screen.getByRole('link', { name: '서버 공지 21 수정' }));
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(screen.getByRole('button', { name: '공개' })).toBeInTheDocument();
    expect(
      vi
        .mocked(axiosInstance.get)
        .mock.calls.filter(([url]) => url === '/v1/admin/notices')
        .map(
          ([, config]) => (config?.params as { page: number } | undefined)?.page
        )
    ).toEqual([2, 2, 0]);
  });

  test('홍보의 이전 서버 표기에도 현재 게시판을 선택하고 제목만 수정한다', async () => {
    serverItems[0] = { ...serverItems[0], boardId: 25, boardName: '홍보' };
    const user = userEvent.setup();
    renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(screen.getByRole('button', { name: '홍보게시판' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.queryByText('카테고리', { selector: 'legend' })
    ).not.toBeInTheDocument();
    const title = screen.getByRole('textbox', { name: /제목/ });
    await user.clear(title);
    await user.type(title, '홍보게시판 공지 수정');
    await user.click(screen.getByRole('button', { name: '수정사항 반영' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
      '/v1/admin/notices/5000',
      { title: '홍보게시판 공지 수정' }
    );
    expect(
      screen.getByText('홍보게시판', { selector: 'tbody *' })
    ).toBeInTheDocument();
  });

  test('기존 공지의 제목·본문·카테고리만 PATCH하고 알 수 없는 첨부는 유지한다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(
      screen.getByRole('button', { name: '이미지 업로드' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '동영상 업로드' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: '예약' })).toBeDisabled();
    await user.clear(screen.getByRole('textbox', { name: /제목/ }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '실제 수정 제목'
    );
    await user.clear(screen.getByRole('textbox', { name: '내용' }));
    await user.type(screen.getByRole('textbox', { name: '내용' }), '수정 본문');
    await user.click(screen.getByRole('button', { name: '회계' }));
    await user.click(screen.getByRole('button', { name: '수정사항 반영' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(router.state.location.pathname).toBe('/notices/general');
    expect(await screen.findByText('실제 수정 제목')).toBeInTheDocument();
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
      '/v1/admin/notices/5000',
      { title: '실제 수정 제목', content: '<p>수정 본문</p>', category: '회계' }
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test.each(['DRAFT', 'SCHEDULED', 'PRIVATE'] as const)(
    '%s의 내용을 수정해도 첨부와 기존 예약·공개 상태를 임의로 바꾸지 않는다',
    async (status) => {
      serverItems[0] = { ...serverItems[0], status };
      const user = userEvent.setup();
      renderPage('/notices/general/5000/edit');
      await screen.findByRole('heading', { name: '공지사항 수정' });
      if (status === 'DRAFT')
        expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
      else
        expect(
          screen.queryByRole('button', { name: '삭제' })
        ).not.toBeInTheDocument();
      if (status === 'SCHEDULED')
        expect(screen.getByText('기존 예약을 유지합니다.')).toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: /제목/ }), ' 수정');
      await user.click(
        screen.getByRole('button', {
          name:
            status === 'DRAFT'
              ? '임시저장'
              : status === 'SCHEDULED'
                ? '예약 게시'
                : '비공개로 저장',
        })
      );
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: status === 'DRAFT' ? '임시저장' : '저장',
        })
      );
      await screen.findByRole('heading', { name: '일반 공지 관리' });
      expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
        '/v1/admin/notices/5000',
        { title: '서버 공지 1 수정' }
      );
      expect(axiosInstance.post).not.toHaveBeenCalled();
    }
  );

  test.each(['PUBLISHED', 'SCHEDULED', 'PRIVATE'] as const)(
    '%s의 공개·비공개 전환에는 예약 시각을 함께 보내지 않는다',
    async (status) => {
      serverItems[0] = { ...serverItems[0], status };
      const user = userEvent.setup();
      renderPage('/notices/general/5000/edit');
      await screen.findByRole('heading', { name: '공지사항 수정' });
      await user.click(
        screen.getByRole('button', {
          name: status === 'PRIVATE' ? '공개' : '비공개',
        })
      );
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
      );
      await screen.findByRole('heading', { name: '일반 공지 관리' });
      expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
        '/v1/admin/notices/5000',
        { isVisible: status === 'PRIVATE' }
      );
    }
  );

  test('예약 변경을 선택하면 날짜가 필요하며 취소하면 원래 예약을 유지한다', async () => {
    serverItems[0] = { ...serverItems[0], status: 'SCHEDULED' };
    const user = userEvent.setup();
    renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지사항 수정' });
    await user.click(screen.getByRole('button', { name: '예약 시각 변경' }));
    await user.click(screen.getByRole('button', { name: '예약 게시' }));
    expect(screen.getByRole('alert')).toHaveTextContent('날짜와 시간을 선택');
    expect(axiosInstance.patch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '기존 예약 유지' }));
    await user.type(screen.getByRole('textbox', { name: /제목/ }), ' 수정');
    await user.click(screen.getByRole('button', { name: '예약 게시' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
      '/v1/admin/notices/5000',
      { title: '서버 공지 1 수정' }
    );
  });

  test('수정 응답 유실 시 입력과 상태 전환을 잠그고 PATCH를 재전송하지 않는다', async () => {
    vi.mocked(axiosInstance.patch).mockRejectedValue(
      new TypeError('응답 유실')
    );
    const user = userEvent.setup();
    renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지사항 수정' });
    await user.type(screen.getByRole('textbox', { name: /제목/ }), ' 수정');
    await user.click(screen.getByRole('button', { name: '수정사항 반영' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '저장' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '수정 결과를 확인하지 못했습니다'
    );
    expect(screen.getByRole('textbox', { name: /제목/ })).toBeDisabled();
    expect(
      screen.getByRole('link', { name: '목록에서 확인 (새 창)' })
    ).toHaveAttribute('target', '_blank');
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(axiosInstance.patch).toHaveBeenCalledOnce();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('상세 조회 실패 시 빈 폼으로 수정하지 않고 다시 조회할 수 있다', async () => {
    const normalGet = vi.mocked(axiosInstance.get).getMockImplementation()!;
    vi.mocked(axiosInstance.get).mockImplementation((...args) =>
      String(args[0]).startsWith('/v1/admin/posts/')
        ? Promise.reject(new Error('상세 조회 실패'))
        : normalGet(...args)
    );
    const user = userEvent.setup();
    renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지를 불러오지 못했습니다.' });
    expect(
      screen.queryByRole('textbox', { name: /제목/ })
    ).not.toBeInTheDocument();
    vi.mocked(axiosInstance.get).mockImplementation(normalGet);
    await user.click(screen.getByRole('button', { name: '다시 조회' }));
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(axiosInstance.patch).not.toHaveBeenCalled();
  });

  test('작성자 조회 중 다른 페이지로 이동하면 늦은 응답이 화면을 바꾸지 않는다', async () => {
    let complete!: () => void;
    vi.mocked(axiosInstance.get).mockImplementation(async (url, config) => {
      if (url === '/v2/admin/users') {
        await new Promise<void>((resolve) => {
          complete = resolve;
        });
        return {
          data: {
            result: {
              data: [{ nickname: '운영리자', encryptedUserId: 'late-author' }],
              hasNext: false,
            },
          },
        };
      }
      return response(
        (config?.params as { page: number } | undefined)?.page ?? 0
      );
    });
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText('서버 공지 1', { exact: true });
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
    await act(async () => {
      await router.navigate('/elsewhere');
    });
    await act(async () => complete());
    expect(router.state.location.pathname).toBe('/elsewhere');
  });

  test('목록에 작성자 ID가 없어도 정확한 회원의 기존 팝업을 열고 버튼으로 상세에 이동한다', async () => {
    const normalGet = vi.mocked(axiosInstance.get).getMockImplementation()!;
    vi.mocked(axiosInstance.get).mockImplementation(async (url, config) => {
      if (url === '/v2/admin/users')
        return {
          data: {
            result: {
              data: [
                { nickname: '운영리자2', encryptedUserId: 'wrong' },
                { nickname: '운영리자', encryptedUserId: 'correct-author' },
              ],
              hasNext: false,
            },
          },
        };
      return normalGet(url, config);
    });
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText('서버 공지 1', { exact: true });
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent)
    ).toEqual(['회원 정보', '작성한 공지글']);
    await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
    const dialog = await screen.findByRole('dialog', { name: '회원 정보' });
    expect(dialog).toHaveTextContent('운영자');
    expect(router.state.location.pathname).toBe('/notices/general');
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/v1/admin/users/correct-author'
    );
    await user.click(
      within(dialog).getByRole('button', { name: '유저 상세 페이지로 이동' })
    );
    await screen.findByText('작성자 회원 상세');
    expect(router.state.location.pathname).toBe('/member/info/correct-author');
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('하위 게시판은 대분류에 따라 활성화하고 대분류 변경 시 이전 선택을 지운다', async () => {
    const user = userEvent.setup();
    const router = renderPage('/notices/general?status=published&sort=views');
    await screen.findByText('서버 공지 11', { exact: true });
    const group = () => screen.getByRole('combobox', { name: '게시판' });
    const subBoard = () =>
      screen.getByRole('combobox', { name: '하위 게시판' });
    const params = () => new URLSearchParams(router.state.location.search);
    expect(subBoard()).toBeDisabled();
    await user.type(screen.getByLabelText('게시글 검색'), '미적용 검색어');
    await user.click(group());
    await user.click(screen.getByRole('option', { name: '커뮤니티' }));
    expect(subBoard()).toBeEnabled();
    expect(subBoard()).toHaveTextContent('전체');
    await user.click(subBoard());
    await user.click(screen.getByRole('option', { name: '첫눈온방' }));
    expect(params().get('board')).toBe('첫눈온방');
    expect(screen.getAllByRole('row')).toHaveLength(11);
    await user.click(group());
    await user.click(screen.getByRole('option', { name: '공식 게시판' }));
    expect(subBoard()).toHaveTextContent('전체');
    expect(params().get('board')).toBeNull();
    await user.click(subBoard());
    expect(
      screen.queryByRole('option', { name: '첫눈온방' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: '총학생회' }));
    await user.click(group());
    await user.click(screen.getByRole('option', { name: '공지사항' }));
    expect(subBoard()).toBeDisabled();
    expect(subBoard()).toHaveTextContent('해당 없음');
    expect(params().get('board')).toBe('공지사항');
    await user.click(group());
    await user.click(screen.getByRole('option', { name: '커뮤니티' }));
    expect(subBoard()).toBeEnabled();
    expect(subBoard()).toHaveTextContent('전체');
    expect(params().get('board')).toBeNull();
    await user.click(group());
    await user.click(screen.getByRole('option', { name: '전체' }));
    expect(subBoard()).toBeDisabled();
    expect(params().get('group')).toBeNull();
    expect(params().get('board')).toBeNull();
    expect(params().get('status')).toBe('published');
    expect(params().get('sort')).toBe('views');
    expect(params().get('keyword')).toBeNull();
    expect(screen.getByLabelText('게시글 검색')).toHaveValue('미적용 검색어');
    expect(axiosInstance.get).toHaveBeenCalledTimes(3);
  });

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
    await user.click(screen.getByRole('combobox', { name: '게시판' }));
    await user.click(screen.getByRole('option', { name: '커뮤니티' }));
    await user.click(screen.getByRole('combobox', { name: '상태' }));
    await user.click(screen.getByRole('option', { name: '게시' }));
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
    expect(axiosInstance.get).toHaveBeenCalledTimes(4);
    await user.click(screen.getByRole('combobox', { name: '상태' }));
    await user.click(screen.getByRole('option', { name: '전체' }));
    expect(
      new URLSearchParams(router.state.location.search).get('status')
    ).toBeNull();
    await user.click(screen.getByRole('combobox', { name: '구분' }));
    await user.click(screen.getByRole('option', { name: '일반' }));
    expect(new URLSearchParams(router.state.location.search).get('kind')).toBe(
      'normal'
    );
    await user.click(screen.getByRole('combobox', { name: '구분' }));
    await user.click(screen.getByRole('option', { name: '전체' }));
    const cleared = new URLSearchParams(router.state.location.search);
    expect(cleared.get('kind')).toBeNull();
    expect(cleared.get('sort')).toBe('views');
    expect(cleared.get('keyword')).toBe('서버 공지 1');
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

  test('서버의 총 48건·5페이지를 표시하고 선택한 페이지만 조회한다', async () => {
    serverItems = Array.from({ length: 48 }, (_, index) => ({
      ...items[index % items.length],
      postId: 6000 - index,
      title: `목록 공지 ${index + 1}`,
    }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('목록 공지 1', { exact: true });
    expect(screen.getByText('48', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(axiosInstance.get).toHaveBeenCalledExactlyOnceWith(
      '/v1/admin/notices',
      { params: { page: 0 } }
    );
    await user.click(screen.getByRole('link', { name: '5' }));
    await screen.findByText('목록 공지 41', { exact: true });
    expect(screen.getAllByRole('row')).toHaveLength(9);
    expect(
      vi
        .mocked(axiosInstance.get)
        .mock.calls.map(
          ([, config]) => (config?.params as { page: number } | undefined)?.page
        )
    ).toEqual([0, 4]);
    await user.click(screen.getByRole('link', { name: '목록 공지 41 수정' }));
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(
      vi
        .mocked(axiosInstance.get)
        .mock.calls.filter(([path]) => path === '/v1/admin/notices')
        .map(
          ([, config]) => (config?.params as { page: number } | undefined)?.page
        )
    ).toEqual([0, 4, 4]);
  });

  test('작성 화면 진입은 공지 목록을 미리 조회하지 않는다', () => {
    renderPage('/notices/general/new');
    expect(
      screen.getByRole('heading', { name: '공지사항 작성' })
    ).toBeInTheDocument();
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  test('검색 조건을 적용한 경우에만 전체 페이지를 수집해 전체 글을 검색한다', async () => {
    let finish!: (value: ReturnType<typeof response>) => void;
    const deferred = new Promise<ReturnType<typeof response>>((resolve) => {
      finish = resolve;
    });
    vi.mocked(axiosInstance.get).mockImplementation(async (_path, config) =>
      (config?.params as { page: number } | undefined)?.page === 1
        ? deferred
        : response((config?.params as { page: number } | undefined)?.page ?? 0)
    );
    renderPage('/notices/general?keyword=서버 공지 23');
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByText('서버 공지 1', { exact: true })
    ).not.toBeInTheDocument();
    await act(async () => {
      finish(response(1));
    });
    await screen.findByText('서버 공지 23', { exact: true });
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('총 1건');
    expect(
      vi
        .mocked(axiosInstance.get)
        .mock.calls.map(
          ([, config]) => (config?.params as { page: number } | undefined)?.page
        )
    ).toEqual([0, 1, 2]);
  });

  test('서버의 NEW를 모두 표시·검색하고 작성자 ID 없이 닉네임으로 작성 공지를 조회한다', async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText('서버 공지 1', { exact: true });
    expect(screen.getAllByText('NEW', { selector: 'span' })).toHaveLength(10);
    await user.click(screen.getByRole('combobox', { name: '구분' }));
    await user.click(screen.getByRole('option', { name: 'NEW' }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(screen.getByText('11', { selector: 'span' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    await user.click(screen.getAllByRole('button', { name: '운영리자' })[0]);
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
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
      expect(within(row).getByRole('link', { name: / 수정$/ })).toHaveAttribute(
        'href',
        expect.stringMatching(/\/edit$/)
      );
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
    renderPage('/notices/general?keyword=서버 공지 1');
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

  test('공지 상세를 불러와 수정하고 새 공지 작성은 필수 항목을 검증한다', async () => {
    const router = renderPage('/notices/general/5000/edit');
    await screen.findByRole('heading', { name: '공지사항 수정' });
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '서버 공지 1'
    );
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
    expect(toast.error).toHaveBeenCalledExactlyOnceWith('등록 실패');
    expect(toast.success).not.toHaveBeenCalled();
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

  test('첨부 실패 뒤에는 재시도 없이 오류를 알리고 중복 전송을 막는다', async () => {
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
      '첨부 실패 확인'
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
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^공지 6000번은 생성되었습니다\. 일부 첨부 업로드에 실패했습니다\./
      )
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /제목/ })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: '첨부 처리 다시 시도' })
    ).not.toBeInTheDocument();
    const checkList = screen.getByRole('link', {
      name: '목록에서 확인 (새 창)',
    });
    expect(checkList).toHaveAttribute('href', '/notices/general');
    expect(checkList).toHaveAttribute('target', '_blank');
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(uploads).toHaveBeenCalledTimes(2);
    expect(toast.success).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '목록에서 저장 상태를 확인해 주세요.'
    );
    expect(screen.getByRole('dialog')).not.toHaveTextContent('다시 시도');
  });

  test('첨부 형식 오류도 공통 오류 토스트로 알리고 저장 요청을 보내지 않는다', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderPage('/notices/general/new');
    await user.upload(
      screen.getByLabelText('이미지 파일 선택'),
      new File(['pdf'], 'unsupported.pdf', { type: 'application/pdf' })
    );
    const error = await screen.findByRole('alert');
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(error.textContent);
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('.jpng는 이미지 MIME이어도 선택 즉시 제외하고 토스트로 알린다', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderPage('/notices/general/new');
    const input = screen.getByLabelText('이미지 파일 선택');
    expect(input).toHaveAttribute('accept', '.jpg,.jpeg,.png,.jfif,.bmp,.webp');
    expect(screen.getByLabelText('동영상 파일 선택')).toHaveAttribute(
      'accept',
      '.mp4,.mov'
    );
    await user.upload(
      input,
      new File(['image'], '잘못된.jpng', { type: 'image/png' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'JPG, JPEG, PNG'
    );
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('JPG, JPEG, PNG')
    );
    expect(
      screen.queryByRole('img', { name: '잘못된.jpng' })
    ).not.toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('저장 응답·파일 업로드·업로드 실패 후와 지연 drop에서 최초 첨부 순서를 유지한다', async () => {
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
      screen.queryByRole('button', { name: '첨부 처리 다시 시도' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '목록에서 확인 (새 창)' })
    ).toHaveAttribute('target', '_blank');
    assertLocked();
    const sent = vi.mocked(axiosInstance.post).mock
      .calls[0][1] as AdminCreateNoticeRequest;
    expect(sent.images.map((image) => image.fileName)).toEqual([
      'A.png',
      'B.png',
    ]);
    fireEvent.submit(
      screen.getByRole('textbox', { name: /제목/ }).closest('form')!
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(
      uploads.mock.calls.map(([, options]) => (options.body as File).name)
    ).toEqual(['A.png', 'B.png']);
  });
});
