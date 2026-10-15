import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { InquiryDetail, InquiryGroup } from '@/shared/types';

import type { AdminGetPostResponse } from '@/domains/Posts/types';

import { getPost } from '@/apis';
import { getComment } from '@/apis/comments';
import { getAdminInquiryDetailAPI } from '@/apis/inquiries';

import PostCommentDetailPage from './PostCommentDetailPage';
import PostDetailPage from './PostDetailPage';

vi.hoisted(() => {
  vi.stubEnv('VITE_USER_FRONT_BASE_URL', 'https://front.dev.snorose.com');
});
afterAll(() => vi.unstubAllEnvs());

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getPost: vi.fn(),
}));
vi.mock('@/apis/inquiries', () => ({ getAdminInquiryDetailAPI: vi.fn() }));
vi.mock('@/apis/comments', () => ({ getComment: vi.fn() }));
vi.mock('@/domains/Posts/components/PostDetail/PostDetailInfoPanel', () => ({
  default: () => null,
}));
vi.mock('@/domains/Posts/components/PostDetail/PostDetailManageCard', () => ({
  default: () => null,
}));
vi.mock('@/domains/Posts/components/PostDetail/PostDetailReportCard', () => ({
  default: () => null,
}));
vi.mock(
  '@/domains/Posts/components/PostDetail/PostDetailStatusLogCard',
  () => ({ default: () => null })
);
vi.mock(
  '@/domains/Posts/components/PostDetail/PostDetailBlacklistCard',
  () => ({ default: () => null })
);
vi.mock('@/domains/Posts/components/PostDetail/PostDetailCommentList', () => ({
  default: ({ focusedCommentId }: { focusedCommentId?: number | null }) => (
    <output aria-label='연결된 댓글'>{focusedCommentId}</output>
  ),
}));

const post: AdminGetPostResponse = {
  postId: 1725805,
  encryptedUserId: 'mock',
  boardName: '문의게시판/신고게시판',
  title: '문의 및 신고',
  content: '내용',
  commentCount: 1,
  viewCount: 0,
  likeCount: 0,
  scrapCount: 0,
  reportCount: 0,
  isNotice: false,
  isVisible: true,
  isKeywordExist: false,
  adminCommonStatuses: [],
  createdAt: '2026-10-15T12:00:00',
};

const inquiry = (group: InquiryGroup): InquiryDetail => ({
  inquiryId: post.postId,
  userRoleId: 1,
  isWriter: true,
  encryptedUserId: 'mock',
  userLoginId: 'mock',
  category: 'ETC',
  title: '문의 및 신고',
  content: '내용',
  reportCause: null,
  target: null,
  targetPostId: 0,
  targetBoardId: 0,
  group,
  subGroup: group === 'REPORT' ? 'POST_REPORT' : 'ETC_INQUIRY',
  status: 'PENDING',
  commentCount: 0,
  createdAt: '2026-10-15T12:00:00',
  updatedAt: null,
  isEdited: false,
  isWriterWithdrawn: false,
  attachments: [],
});

function CurrentLocation() {
  const location = useLocation();
  return (
    <output aria-label='현재 경로'>
      {location.pathname + location.search}
    </output>
  );
}

function renderPage(url = `/posts/manage/${post.postId}`) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path='/posts/manage/:postId' element={<PostDetailPage />} />
          <Route
            path='/posts/comments/:commentId'
            element={<PostCommentDetailPage />}
          />
        </Routes>
        <CurrentLocation />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return client;
}

const originalLink = () => screen.queryByRole('link', { name: /^원본 게시글/ });

describe('게시글·댓글에서 문의·신고 원문 열기', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPost).mockResolvedValue(post);
    vi.mocked(getComment).mockResolvedValue({
      encryptedUserId: 'mock',
      boardId: 13,
      commentId: 123,
      postId: post.postId,
      parentId: null,
      nickname: '익명',
      reportCount: 0,
      isVisible: true,
      isKeywordExist: false,
      createdAt: post.createdAt,
      content: '댓글',
    });
  });

  test.each([
    ['INQUIRY', false],
    ['REPORT', false],
    ['INQUIRY', true],
    ['REPORT', true],
  ] as const)(
    '%s 원문을 댓글 경유 %s에서도 전용 경로로 연결한다',
    async (group, viaComment) => {
      vi.mocked(getAdminInquiryDetailAPI).mockResolvedValue(inquiry(group));
      const client = renderPage(viaComment ? '/posts/comments/123' : undefined);
      await waitFor(() =>
        expect(originalLink()).toHaveAttribute(
          'href',
          `https://front.dev.snorose.com/${group === 'REPORT' ? 'report' : 'inquiry'}/${post.postId}`
        )
      );
      expect(getAdminInquiryDetailAPI).toHaveBeenCalledWith(post.postId);
      expect(originalLink()).toHaveAttribute('target', '_blank');
      if (viaComment) {
        expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
          `/posts/manage/${post.postId}?commentId=123`
        );
        expect(screen.getByLabelText('연결된 댓글')).toHaveTextContent('123');
      }
      client.clear();
    }
  );

  test('문의·신고 상세 조회 중이나 실패 시 잘못된 일반 게시판 링크를 표시하지 않는다', async () => {
    let reject!: (error: Error) => void;
    vi.mocked(getAdminInquiryDetailAPI).mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail;
      })
    );
    const client = renderPage();
    await waitFor(() => expect(getAdminInquiryDetailAPI).toHaveBeenCalled());
    expect(originalLink()).not.toBeInTheDocument();
    await act(async () => reject(new Error('조회 실패')));
    await waitFor(() => expect(client.isFetching()).toBe(0));
    expect(originalLink()).not.toBeInTheDocument();
    client.clear();
  });

  test('다른 문의·신고 ID의 상세로 링크를 만들지 않는다', async () => {
    vi.mocked(getAdminInquiryDetailAPI).mockResolvedValue({
      ...inquiry('REPORT'),
      inquiryId: 999,
    });
    const client = renderPage();
    await waitFor(() => expect(getAdminInquiryDetailAPI).toHaveBeenCalled());
    await waitFor(() => expect(client.isFetching()).toBe(0));
    expect(originalLink()).not.toBeInTheDocument();
    client.clear();
  });

  test('일반 게시판은 기존 경로를 사용하고 문의·신고를 추가 조회하지 않는다', async () => {
    vi.mocked(getPost).mockResolvedValue({ ...post, boardName: '함박눈방' });
    const client = renderPage();
    await waitFor(() =>
      expect(originalLink()).toHaveAttribute(
        'href',
        `https://front.dev.snorose.com/board/large-snow/post/${post.postId}`
      )
    );
    expect(getAdminInquiryDetailAPI).not.toHaveBeenCalled();
    client.clear();
  });
});
