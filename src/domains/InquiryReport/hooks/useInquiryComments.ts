import { useQuery } from '@tanstack/react-query';

import type { InquiryComment } from '@/shared/types';

import { getAdminInquiryCommentsAPI } from '@/apis/inquiries';

const MAX_COMMENT_PAGE_REQUESTS = 100;

export const useInquiryComments = (postId: number | null) => {
  return useQuery({
    queryKey: ['inquiryComments', postId],
    queryFn: async ({ signal }) => {
      const comments: InquiryComment[] = [];
      const seen = new Set<number>();

      for (let page = 0; page < MAX_COMMENT_PAGE_REQUESTS; page += 1) {
        signal.throwIfAborted();
        const response = await getAdminInquiryCommentsAPI(
          postId!,
          { page },
          signal
        );
        const fresh = response.data.filter((comment) => !seen.has(comment.id));
        for (const comment of fresh) {
          seen.add(comment.id);
          comments.push(comment);
        }
        if (!response.hasNext) return { hasNext: false, data: comments };
        if (!fresh.length) {
          throw new Error('댓글 목록의 다음 페이지를 확인할 수 없습니다.');
        }
      }
      throw new Error('댓글 목록을 불러오는 요청 수가 초과되었습니다.');
    },
    enabled: postId !== null,
  });
};
