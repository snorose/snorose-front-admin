import { bulkDeleteComments, searchComments } from '@/apis';

export async function deletePostComments(postId: number, memo: string) {
  const commentIds: number[] = [];
  let page = 1;
  let totalPage = 1;

  do {
    const result = await searchComments(page, {
      searchQuery: String(postId),
      searchScope: 'POST_ID',
      sortTypes: ['CREATED_AT'],
      sortDirection: 'ASC',
    });
    const aliveCommentIds = result.data
      .filter(
        (comment) =>
          comment.deletedAt == null &&
          !comment.adminCommonStatuses?.includes('ADMIN_DELETED') &&
          !comment.adminCommonStatuses?.includes('USER_DELETED')
      )
      .map((comment) => comment.commentId);
    commentIds.push(...aliveCommentIds);
    totalPage = result.totalPage ?? 1;
    page += 1;
  } while (page <= totalPage);

  if (commentIds.length > 0) {
    const bulkResult = await bulkDeleteComments(commentIds, memo);
    if (bulkResult.failedCount > 0) {
      throw new Error('댓글 일부 삭제에 실패했습니다.');
    }
  }
}
