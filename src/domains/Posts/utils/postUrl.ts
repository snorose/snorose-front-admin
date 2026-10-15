import { getBoardKeyByName } from '@/shared/utils';

import type { AdminGetPostResponse } from '../types/post';

export function buildOriginalPostUrl(
  post: Pick<AdminGetPostResponse, 'boardName' | 'isNotice' | 'postId'>
): string | null {
  let boardKey = getBoardKeyByName(post.boardName);

  // 문의·신고는 상세의 group으로 /inquiry, /report를 구분해야 한다.
  if (!boardKey || boardKey === 'support') return null;

  if (post.isNotice && (boardKey === 'event' || boardKey === 'exam-review')) {
    boardKey = `${boardKey}-notice`;
  }

  return `/board/${boardKey}/post/${post.postId}`;
}
