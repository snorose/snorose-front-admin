import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bulkDeleteComments, searchComments } from '@/apis';

import { deletePostComments } from './deletePostComments';

vi.mock('@/apis', () => ({
  searchComments: vi.fn(),
  bulkDeleteComments: vi.fn(),
}));

const comment = (commentId: number, extra = {}) => ({
  commentId,
  deletedAt: null,
  adminCommonStatuses: [],
  ...extra,
});

describe('게시글 댓글 일괄 삭제', () => {
  beforeEach(() => vi.resetAllMocks());

  it('모든 페이지를 조회하고 이미 삭제된 댓글은 제외한다', async () => {
    vi.mocked(searchComments)
      .mockResolvedValueOnce({
        totalPage: 2,
        data: [
          comment(1),
          comment(2, { deletedAt: '2026-01-01' }),
          comment(3, { adminCommonStatuses: ['USER_DELETED'] }),
        ],
      } as never)
      .mockResolvedValueOnce({ totalPage: 2, data: [comment(4)] } as never);
    vi.mocked(bulkDeleteComments).mockResolvedValue({
      failedCount: 0,
    } as never);
    await deletePostComments(10, '삭제 사유');
    expect(searchComments).toHaveBeenNthCalledWith(
      2,
      2,
      expect.objectContaining({ searchQuery: '10', searchScope: 'POST_ID' })
    );
    expect(bulkDeleteComments).toHaveBeenCalledWith([1, 4], '삭제 사유');
  });

  it('댓글이 없으면 삭제 API를 호출하지 않는다', async () => {
    vi.mocked(searchComments).mockResolvedValue({
      totalPage: 0,
      data: [],
    } as never);
    await deletePostComments(10, '사유');
    expect(bulkDeleteComments).not.toHaveBeenCalled();
  });

  it('댓글 일부 삭제 실패를 호출자에게 전달한다', async () => {
    vi.mocked(searchComments).mockResolvedValue({
      totalPage: 1,
      data: [comment(1)],
    } as never);
    vi.mocked(bulkDeleteComments).mockResolvedValue({
      failedCount: 1,
    } as never);
    await expect(deletePostComments(10, '사유')).rejects.toThrow(
      '댓글 일부 삭제'
    );
  });
});
