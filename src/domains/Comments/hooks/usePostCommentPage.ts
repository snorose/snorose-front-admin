import { useQuery, useQueryClient } from '@tanstack/react-query';

import { searchComments } from '@/apis/comments';

import type { AdminCommentResult } from '../types/comment';

// 시간순 목록의 페이지 경계를 조회해 댓글의 원래 위치를 찾는다.
// 탐색 중 조회한 페이지는 기존 목록 쿼리와 캐시를 공유한다.
export function usePostCommentPage(
  postId: number,
  comment: AdminCommentResult | undefined,
  enabled: boolean
) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['postComments', postId, 'page-of', comment?.commentId],
    enabled: enabled && Boolean(comment),
    staleTime: 0,
    gcTime: 0,
    queryFn: async ({ signal }) => {
      if (!comment) throw new Error('댓글을 선택해주세요.');
      // 위치를 다시 찾을 때는 해당 게시글의 오래된 목록 캐시를 새로 조회한다.
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'postComments' &&
          query.queryKey[1] === postId &&
          typeof query.queryKey[2] === 'number',
        refetchType: 'none',
      });
      const readPage = (page: number) => {
        signal.throwIfAborted();
        return queryClient.fetchQuery({
          queryKey: ['postComments', postId, page],
          queryFn: () =>
            searchComments(page, {
              searchQuery: String(postId),
              searchScope: 'POST_ID',
              sortTypes: ['CREATED_AT'],
              sortDirection: 'ASC',
            }),
        });
      };
      const containsComment = (page: Awaited<ReturnType<typeof readPage>>) =>
        page.data.some((item) => item.commentId === comment.commentId);
      const first = await readPage(1);
      if (containsComment(first)) return 1;
      const totalPage = first.totalPage ?? 1;
      const targetTime = Date.parse(comment.createdAt);
      let left = 2;
      let right = totalPage;

      // 동일 시간 댓글은 여러 페이지에 걸칠 수 있어 가장 이른 후보부터 확인한다.
      while (left <= right && Number.isFinite(targetTime)) {
        const middle = Math.floor((left + right) / 2);
        const page = await readPage(middle);
        if (containsComment(page)) return middle;
        const last = page.data.at(-1);
        if (last && Date.parse(last.createdAt) < targetTime) left = middle + 1;
        else right = middle - 1;
      }

      for (let pageNumber = left; pageNumber <= totalPage; pageNumber += 1) {
        const page = await readPage(pageNumber);
        if (containsComment(page)) return pageNumber;
        if (page.data[0] && Date.parse(page.data[0].createdAt) > targetTime) {
          break;
        }
      }
      return null;
    },
  });
}
