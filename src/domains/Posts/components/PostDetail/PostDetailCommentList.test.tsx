import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AdminCommentResult } from '@/domains/Comments/types';

import { searchComments } from '@/apis/comments';

import PostDetailCommentList from './PostDetailCommentList';

vi.mock('@/apis/comments', () => ({
  searchComments: vi.fn(),
}));

vi.mock('./PostDetailCommentReportCard', () => ({
  default: ({ commentId }: { commentId: number }) => (
    <div>댓글 {commentId} 신고 내역</div>
  ),
}));

vi.mock('./PostDetailCommentSanctionCard', () => ({
  default: ({ commentId }: { commentId: number }) => (
    <div>댓글 {commentId} 제재 내역</div>
  ),
}));

const COMMENT: AdminCommentResult = {
  encryptedUserId: 'encrypted-user-id',
  boardId: 22,
  commentId: 10,
  postId: 1,
  parentId: null,
  nickname: '눈송이',
  reportCount: 0,
  adminCommonStatuses: ['VISIBLE'],
  isVisible: true,
  isKeywordExist: false,
  createdAt: '2026-09-12T12:00:00',
  content: '선택할 댓글',
};

describe('PostDetailCommentList', () => {
  beforeEach(() => {
    vi.mocked(searchComments).mockResolvedValue({
      hasNext: false,
      totalPage: 1,
      totalCount: 1,
      data: [COMMENT],
    });
  });

  test('댓글을 클릭하면 같은 행의 신고 및 제재 내역을 표시한다', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostDetailCommentList postId={1} commentCount={1} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await user.click(await screen.findByText('선택할 댓글'));

    expect(screen.getAllByText('댓글 10 신고 내역')).toHaveLength(2);
    expect(screen.getAllByText('댓글 10 제재 내역')).toHaveLength(2);
  });
});
