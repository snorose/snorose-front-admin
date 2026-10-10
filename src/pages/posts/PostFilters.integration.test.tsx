import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { BOARD_OPTIONS } from '@/shared/utils';

import { getCommentChildrenList, searchComments, searchPosts } from '@/apis';

import PostCommentPage from './PostCommentPage';
import PostManagePage from './PostManagePage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  searchPosts: vi.fn(),
  searchComments: vi.fn(),
  getCommentChildrenList: vi.fn(),
}));

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.resetAllMocks();
  const result = { data: [], totalCount: 0, totalPage: 8, hasNext: false };
  vi.mocked(searchPosts).mockResolvedValue(result);
  vi.mocked(searchComments).mockResolvedValue(result);
  vi.mocked(getCommentChildrenList).mockResolvedValue(result);
});

function LocationControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid='location'>{location.search}</output>
      <button onClick={() => navigate(-1)}>이전 URL</button>
      <button onClick={() => navigate(1)}>다음 URL</button>
    </>
  );
}

function renderPage(Page: typeof PostManagePage, entries: string[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <Page />
        <LocationControls />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const urlParams = () =>
  new URLSearchParams(screen.getByTestId('location').textContent ?? '');

describe('게시글·댓글 필터 URL와 요청 연결', () => {
  test('게시글 URL의 선택을 복원하고 숨은 조건·false를 보존해 1페이지에서 검색한다', async () => {
    const user = userEvent.setup();
    const board = BOARD_OPTIONS[0];
    renderPage(PostManagePage, [
      `/posts/manage?boardId=${board.value}&adminCommonStatuses=VISIBLE,ADMIN_HIDDEN&encryptedUserId=user-id&isVisible=false&isKeywordExist=false&sortTypes=VIEW_COUNT&sortDirection=DESC&startDate=2026-10-01&page=4`,
    ]);
    expect(screen.getByRole('combobox', { name: '게시판' })).toHaveTextContent(
      board.label
    );
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '관리 상태 2개'
    );
    expect(
      screen.getByRole('combobox', { name: '의심 키워드' })
    ).toHaveTextContent('의심 키워드 없음');
    expect(
      screen.getByRole('button', { name: '작성 시작일' })
    ).toHaveTextContent('2026-10-01');
    await waitFor(() =>
      expect(searchPosts).toHaveBeenCalledWith(
        4,
        expect.objectContaining({
          boardId: board.value,
          sortTypes: ['VIEW_COUNT'],
        })
      )
    );
    const calls = vi.mocked(searchPosts).mock.calls.length;
    await user.click(screen.getByRole('button', { name: '관리 상태' }));
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: '어드민 비공개' })
    );
    await user.keyboard('{Escape}');
    expect(searchPosts).toHaveBeenCalledTimes(calls);
    await user.type(
      screen.getByRole('textbox', { name: '게시글 검색' }),
      '검색어{Enter}'
    );
    await waitFor(() =>
      expect(searchPosts).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({
          boardId: board.value,
          adminCommonStatuses: ['VISIBLE'],
          encryptedUserId: 'user-id',
          isVisible: false,
          isKeywordExist: false,
          sortTypes: ['VIEW_COUNT'],
          startDate: '2026-10-01',
          keywordPost: '검색어',
        })
      )
    );
    expect(urlParams().get('page')).toBe('1');
    expect(urlParams().get('isKeywordExist')).toBe('false');
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '노출'
    );
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(screen.getByTestId('location')).toHaveTextContent('?page=1');
    expect(screen.getByRole('combobox', { name: '게시판' })).toHaveTextContent(
      '전체'
    );
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '전체'
    );
    await waitFor(() =>
      expect(searchPosts).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({
          boardId: undefined,
          encryptedUserId: undefined,
          isVisible: undefined,
          keywordPost: undefined,
        })
      )
    );
  });

  test('댓글 URL의 다중 값·정렬을 유지하고 선택 해제와 초기화를 요청에 반영한다', async () => {
    const user = userEvent.setup();
    const boards = BOARD_OPTIONS.slice(0, 2);
    renderPage(PostCommentPage, [
      `/posts/comments?boardIds=${boards.map((b) => b.value).join(',')}&adminCommonStatuses=VISIBLE,SANCTIONED&sortTypes=REPORT_COUNT,LIKE_COUNT&sortDirection=DESC&isReported=false&isKeywordExist=false&searchScope=POST_ID&searchQuery=42&page=3`,
    ]);
    expect(screen.getByRole('button', { name: '게시판' })).toHaveTextContent(
      '게시판 2개'
    );
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '관리 상태 2개'
    );
    expect(
      screen.getByRole('combobox', { name: '댓글 검색 범위' })
    ).toHaveTextContent('게시글 ID');
    await waitFor(() =>
      expect(searchComments).toHaveBeenCalledWith(
        3,
        expect.objectContaining({
          boardIds: boards.map((b) => b.value),
          sortTypes: ['REPORT_COUNT', 'LIKE_COUNT'],
          isReported: false,
        })
      )
    );
    const calls = vi.mocked(searchComments).mock.calls.length;
    await user.click(screen.getByRole('button', { name: '게시판' }));
    await user.click(screen.getByRole('menuitem', { name: '선택 해제' }));
    await user.keyboard('{Escape}');
    expect(searchComments).toHaveBeenCalledTimes(calls);
    await user.type(
      screen.getByRole('textbox', { name: '게시자 검색 (아이디/닉네임/학번)' }),
      '작성자{Enter}'
    );
    await waitFor(() =>
      expect(searchComments).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({
          sortTypes: ['REPORT_COUNT', 'LIKE_COUNT'],
          isReported: false,
          isKeywordExist: false,
          keywordAuthor: '작성자',
        })
      )
    );
    expect(urlParams().has('boardIds')).toBe(false);
    expect(urlParams().get('adminCommonStatuses')).toBe('VISIBLE,SANCTIONED');
    expect(urlParams().get('page')).toBe('1');
    expect(screen.getByRole('button', { name: '게시판' })).toHaveTextContent(
      '전체'
    );
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(urlParams().toString()).toBe('searchScope=CONTENT&page=1');
    expect(screen.getByRole('textbox', { name: '댓글 검색' })).toHaveValue('');
    await waitFor(() =>
      expect(searchComments).toHaveBeenLastCalledWith(1, {
        searchScope: 'CONTENT',
      })
    );
  });

  test('댓글의 대댓글 진입 후 검색하면 parentId를 제거하고 일반 검색으로 복귀한다', async () => {
    const user = userEvent.setup();
    renderPage(PostCommentPage, ['/posts/comments?parentId=42&page=2']);
    await waitFor(() =>
      expect(getCommentChildrenList).toHaveBeenCalledWith(42, 1)
    );
    expect(searchComments).not.toHaveBeenCalled();
    await user.type(
      screen.getByRole('textbox', { name: '댓글 검색' }),
      '내용{Enter}'
    );
    await waitFor(() =>
      expect(searchComments).toHaveBeenCalledWith(1, {
        searchScope: 'CONTENT',
        searchQuery: '내용',
      })
    );
    expect(urlParams().has('parentId')).toBe(false);
    expect(urlParams().get('page')).toBe('1');
  });

  test('URL 이력 이동 시 댓글 선택 표시를 다시 복원한다', async () => {
    const user = userEvent.setup();
    const [first, second] = BOARD_OPTIONS;
    renderPage(PostCommentPage, [
      `/posts/comments?boardIds=${first.value}&adminCommonStatuses=VISIBLE`,
      `/posts/comments?boardIds=${second.value}&adminCommonStatuses=SANCTIONED`,
    ]);
    expect(screen.getByRole('button', { name: '게시판' })).toHaveTextContent(
      second.label
    );
    await user.click(screen.getByRole('button', { name: '이전 URL' }));
    expect(screen.getByRole('button', { name: '게시판' })).toHaveTextContent(
      first.label
    );
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '노출'
    );
    await user.click(screen.getByRole('button', { name: '다음 URL' }));
    expect(screen.getByRole('button', { name: '게시판' })).toHaveTextContent(
      second.label
    );
    expect(screen.getByRole('button', { name: '관리 상태' })).toHaveTextContent(
      '징계'
    );
  });

  test('댓글 행의 ID 더블클릭으로 바뀐 검색 조건과 대댓글 조회를 연결한다', async () => {
    const user = userEvent.setup();
    const result = {
      data: [
        {
          encryptedUserId: 'user-id',
          boardId: 21,
          commentId: 1,
          postId: 42,
          parentId: 9,
          nickname: '눈송이',
          reportCount: 0,
          isVisible: true,
          isKeywordExist: false,
          createdAt: '2026-10-01T12:00:00',
          content: '댓글 내용',
        },
      ],
      totalCount: 1,
      totalPage: 8,
      hasNext: false,
    };
    vi.mocked(searchComments).mockResolvedValue(result);
    vi.mocked(getCommentChildrenList).mockResolvedValue(result);
    renderPage(PostCommentPage, [
      '/posts/comments?boardIds=21&isReported=false&page=3',
    ]);
    await user.dblClick(await screen.findByRole('cell', { name: '042' }));
    await waitFor(() =>
      expect(searchComments).toHaveBeenLastCalledWith(1, {
        boardIds: [21],
        isReported: false,
        searchScope: 'POST_ID',
        searchQuery: '42',
      })
    );
    expect(
      screen.getByRole('combobox', { name: '댓글 검색 범위' })
    ).toHaveTextContent('게시글 ID');
    expect(screen.getByRole('textbox', { name: '댓글 검색' })).toHaveValue(
      '42'
    );
    await user.dblClick(screen.getByRole('cell', { name: '009' }));
    await waitFor(() =>
      expect(getCommentChildrenList).toHaveBeenLastCalledWith(9, 0)
    );
    expect(urlParams().get('parentId')).toBe('9');
    expect(urlParams().get('page')).toBe('1');
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(urlParams().has('parentId')).toBe(false);
    await waitFor(() =>
      expect(searchComments).toHaveBeenLastCalledWith(1, {
        searchScope: 'CONTENT',
      })
    );
  });
});
