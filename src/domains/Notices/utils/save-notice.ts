import {
  NoticeCreateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  uploadNoticeFile,
} from '@/apis/notices';

import type { NoticeForm, NoticeSaveProgress, NoticeStatus } from '../types';
import { toCreateNoticeRequest } from './api.mapper';

export async function saveNewNotice(
  form: NoticeForm,
  status: NoticeStatus,
  progress: NoticeSaveProgress
) {
  if (progress.createOutcomeUnknown)
    throw new NoticeCreateOutcomeUnknownError();
  if (status === 'private')
    throw new Error('새 공지는 게시·예약·임시저장으로 저장해 주세요.');
  const files = form.attachments.map((attachment) => {
    if (!attachment.file)
      throw new Error(`${attachment.name} 파일을 다시 첨부해 주세요.`);
    return attachment.file;
  });
  const request = toCreateNoticeRequest(form, status);
  if (
    progress.request &&
    JSON.stringify(progress.request) !== JSON.stringify(request)
  )
    throw new Error('이미 생성된 공지의 첨부 처리만 다시 시도할 수 있습니다.');
  if (!progress.result) {
    try {
      progress.result = await createAdminNotice(request);
    } catch (error) {
      if (error instanceof NoticeCreateOutcomeUnknownError)
        progress.createOutcomeUnknown = true;
      throw error;
    }
    progress.request = request;
  }
  const { postId, imageUploadUrls } = progress.result;
  if (
    !Array.isArray(imageUploadUrls) ||
    imageUploadUrls.length !== files.length
  )
    throw new Error(
      '첨부 업로드 주소를 확인할 수 없습니다. 공지 ID와 함께 관리자에게 문의해 주세요.'
    );
  const uploads = await Promise.allSettled(
    files.map(async (file, index) => {
      if (progress.uploaded.has(index)) return;
      await uploadNoticeFile(imageUploadUrls[index], file);
      progress.uploaded.add(index);
    })
  );
  const failed = uploads.find((upload) => upload.status === 'rejected');
  if (failed)
    throw new Error(
      `일부 첨부 업로드에 실패했습니다. ${failed.reason instanceof Error ? failed.reason.message : '첨부 처리를 다시 시도해 주세요.'}`
    );
  // 비공개인 임시저장·예약 글은 유저단 썸네일 API의 조회 대상이 아닙니다.
  if (status === 'published' && files.length > 0 && !progress.thumbnailReady) {
    await createNoticeThumbnail(request.boardId, postId);
    progress.thumbnailReady = true;
  }
  return progress.result;
}
