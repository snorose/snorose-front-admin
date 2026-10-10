import type { AdminPostRestoreResponse } from '../types/post';

export function getRestoreWarnings(result: AdminPostRestoreResponse): string[] {
  const warnings: string[] = [];
  const attachment = result.attachmentRestore;
  if (
    attachment.status === 'PARTIAL_FAILURE' ||
    attachment.status === 'FAILURE' ||
    attachment.failedAttachments.length > 0
  ) {
    warnings.push(
      `첨부파일 복구 실패: ${attachment.failedAttachments.map((item) => `${item.attachmentId} (${item.failedComponents.join(', ')})`).join(', ') || '첨부파일 복구 결과를 확인해 주세요'}`
    );
  }
  if (attachment.thumbnailFailed) warnings.push('썸네일 복구 실패');
  if (result.failedComments.length > 0) {
    warnings.push(
      `하위 댓글 복구 실패: ${result.failedComments.map((item) => `${item.commentId} (${item.reason})`).join(', ')}`
    );
  }
  return warnings;
}
