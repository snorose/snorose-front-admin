import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { restorePost } from '@/apis';

import type { AdminPostRestoreResponse } from '../types/post';
import { getRestoreWarnings } from '../utils/restoreResult';
import { useRestorePost } from './useRestorePost';

vi.mock('@/apis', () => ({ restorePost: vi.fn() }));
const result: AdminPostRestoreResponse = {
  post: {
    postId: 10,
    encryptedUserId: 'writer',
    boardName: '함박눈방',
    title: '제목',
    content: '내용',
    commentCount: 1,
    viewCount: 0,
    likeCount: 0,
    scrapCount: 0,
    reportCount: 0,
    isNotice: false,
    isVisible: true,
    isKeywordExist: false,
    adminCommonStatuses: ['VISIBLE'],
    createdAt: '2026-10-10T10:00:00',
  },
  attachmentRestore: {
    status: 'PARTIAL_FAILURE',
    restoredAttachmentIds: [],
    failedAttachments: [{ attachmentId: 7, failedComponents: ['ORIGINAL'] }],
    thumbnailFailed: true,
  },
  restoredCommentIds: [],
  failedComments: [{ commentId: 8, reason: 'USER_NOT_FOUND' }],
};
function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return renderHook(() => useRestorePost(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}
describe('게시글 일괄 복구', () => {
  it('각 단건 요청에 같은 메모를 보내고 실패한 게시글을 구분한다', async () => {
    vi.mocked(restorePost)
      .mockReset()
      .mockResolvedValueOnce(result)
      .mockRejectedValueOnce(new Error('실패'));
    const hook = setup();
    await act(async () => {
      const response = await hook.result.current.mutateAsync({
        postIds: [10, 20],
        memo: '오삭제 복구',
      });
      expect(response.restoredIds).toEqual([10]);
      expect(response.failedIds).toEqual([20]);
      expect(response.restored).toEqual([result]);
    });
    expect(restorePost).toHaveBeenNthCalledWith(1, 10, '오삭제 복구');
    expect(restorePost).toHaveBeenNthCalledWith(2, 20, '오삭제 복구');
  });
  it('모두 성공하면 실패 목록이 비어 있다', async () => {
    vi.mocked(restorePost).mockReset().mockResolvedValue(result);
    const hook = setup();
    await act(async () => {
      const response = await hook.result.current.mutateAsync({
        postIds: [10, 20],
        memo: '복구',
      });
      expect(response.restoredIds).toEqual([10, 20]);
      expect(response.failedIds).toEqual([]);
    });
  });
  it('모든 요청이 실패하면 오류로 처리한다', async () => {
    vi.mocked(restorePost).mockReset().mockRejectedValue(new Error('실패'));
    const hook = setup();
    await act(async () => {
      await expect(
        hook.result.current.mutateAsync({ postIds: [10], memo: '복구' })
      ).rejects.toThrow('게시글 복구에 실패했습니다.');
    });
  });
  it('첨부파일 구성 요소·썸네일·댓글 실패 사유를 안내한다', () => {
    expect(getRestoreWarnings(result).join(' ')).toContain('7 (ORIGINAL)');
    expect(getRestoreWarnings(result).join(' ')).toContain('썸네일');
    expect(getRestoreWarnings(result).join(' ')).toContain(
      '8 (USER_NOT_FOUND)'
    );
  });
});
