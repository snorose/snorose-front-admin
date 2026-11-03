import type { AdminPostRestoreResponse } from '../types/post';

export function getRestoreWarnings(result: AdminPostRestoreResponse): string[] {
  const warnings: string[] = [];
  const attachment = result.attachmentRestore;
  if (
    attachment.status === 'PARTIAL_FAILURE' ||
    attachment.status === 'FAILURE' ||
    attachment.failedAttachments.length > 0 ||
    attachment.thumbnailFailed
  )
    warnings.push('첨부파일 복구에 실패했습니다.');
  if (result.failedComments.length > 0) {
    warnings.push(
      `${result.failedComments.length}개의 댓글 복구에 실패했습니다.`
    );
  }
  return warnings;
}
