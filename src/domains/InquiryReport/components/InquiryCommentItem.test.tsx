import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import type { InquiryComment } from '@/shared/types';

import { getUserDetailAPI } from '@/apis';

import InquiryCommentItem from './InquiryCommentItem';

vi.mock('@/apis', () => ({ getUserDetailAPI: vi.fn() }));

const comment: InquiryComment = {
  id: 1,
  postId: 123,
  encryptedUserId: 'comment-author-id',
  userDisplay: '댓글 작성자',
  userRoleId: 2,
  isWriter: false,
  isWriterWithdrawn: false,
  content: '댓글 내용',
  createdAt: '2026-01-01T00:00:00',
  updatedAt: null,
  isVisible: true,
  isUpdated: false,
  isDeleted: false,
  children: [],
};

function renderComment(value = comment) {
  const onReplyStart = vi.fn();
  render(
    <MemoryRouter>
      <ul>
        <InquiryCommentItem
          comment={value}
          depth={0}
          editingCommentId={null}
          editingCommentValue=''
          replyParentId={null}
          onEditStart={vi.fn()}
          onEditCancel={vi.fn()}
          onEditSubmit={vi.fn()}
          onDelete={vi.fn()}
          onReplyStart={onReplyStart}
          onEditingValueChange={vi.fn()}
        />
      </ul>
    </MemoryRouter>
  );
  return { onReplyStart };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getUserDetailAPI).mockImplementation(async (encryptedUserId) => ({
    encryptedUserId,
    loginId: 'author',
    userName: '김송이',
    email: 'author@example.com',
    nickname: '작성자',
    userRoleId: 2,
    studentNumber: '20260000',
    major: '컴퓨터과학',
    birthday: '2000-01-01',
    pointBalance: 10,
    createdAt: comment.createdAt,
    authenticatedAt: null,
    totalWarningCount: 0,
    isBlacklist: false,
    blacklistStartDate: null,
    blacklistEndDate: null,
  }));
});

test.each([
  ['댓글 작성자', 'comment-author-id'],
  ['대댓글 작성자', 'reply-author-id'],
])(
  '%s는 해당 작성자의 암호화 ID로 조회하고 답글 작성을 시작하지 않는다',
  async (displayName, encryptedUserId) => {
    const user = userEvent.setup();
    const { onReplyStart } = renderComment({
      ...comment,
      children: [
        {
          ...comment,
          id: 2,
          userDisplay: '대댓글 작성자',
          encryptedUserId: 'reply-author-id',
        },
      ],
    });
    await user.click(screen.getByRole('button', { name: displayName }));
    expect(getUserDetailAPI).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
    expect(
      await screen.findByRole('dialog', { name: '회원 정보' })
    ).toBeInTheDocument();
    expect(getUserDetailAPI).toHaveBeenCalledWith(encryptedUserId);
    expect(onReplyStart).not.toHaveBeenCalled();
  }
);

test('암호화 ID가 없으면 userId나 표시명으로 회원을 추정하지 않는다', () => {
  renderComment({ ...comment, encryptedUserId: undefined, userId: '42' });
  expect(screen.getByText(comment.userDisplay)).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: comment.userDisplay })
  ).not.toBeInTheDocument();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
});

test('탈퇴한 댓글 작성자는 ID가 있어도 탈퇴 배지만 표시한다', () => {
  renderComment({ ...comment, isWriterWithdrawn: true });
  expect(screen.getByText('탈퇴')).toBeInTheDocument();
  expect(screen.queryByText(comment.userDisplay)).not.toBeInTheDocument();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
});
