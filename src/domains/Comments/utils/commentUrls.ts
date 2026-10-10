import { PATHS } from '@/shared/constants';

export function parseCommentId(value: string): number | null {
  const id = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function buildCommentDetailUrl(commentId: number, postId?: number) {
  return postId === undefined
    ? `${PATHS.POST_COMMENTS}/${commentId}`
    : `${PATHS.POST_MANAGE}/${postId}?${new URLSearchParams({
        commentId: String(commentId),
      })}`;
}
