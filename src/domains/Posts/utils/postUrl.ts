import { getBoardKeyByName } from '@/shared/utils';

import type { AdminGetPostResponse } from '../types/post';

const USER_FRONT_BASE_URL = 'https://www.snorose.com';

export function buildOriginalPostUrl(
  post: Pick<AdminGetPostResponse, 'boardName' | 'isNotice' | 'postId'>
): string | null {
  let boardKey = getBoardKeyByName(post.boardName);

  if (!boardKey) return null;

  if (post.isNotice && (boardKey === 'event' || boardKey === 'exam-review')) {
    boardKey = `${boardKey}-notice`;
  }

  return `${USER_FRONT_BASE_URL}/board/${boardKey}/post/${post.postId}`;
}
