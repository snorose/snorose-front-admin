import {
  NoticeCreateOutcomeUnknownError,
  NoticeUpdateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  updateAdminNotice,
  uploadNoticeFile,
} from '@/apis/notices';

import type {
  Notice,
  NoticeForm,
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';
import { toCreateNoticeRequest, toUpdateNoticeRequest } from './api.mapper';

export async function saveNewNotice(
  form: NoticeForm,
  status: NoticeStatus,
  progress: NoticeSaveProgress
) {
  if (progress.createOutcomeUnknown)
    throw new NoticeCreateOutcomeUnknownError();
  if (progress.result)
    throw new Error(
      '이미 생성된 공지입니다. 목록에서 저장 상태를 확인해 주세요.'
    );
  if (status === 'private')
    throw new Error('새 공지는 게시·예약·임시저장으로 저장해 주세요.');
  const files = form.attachments.map((attachment) => {
    if (!attachment.file)
      throw new Error(`${attachment.name} 파일을 다시 첨부해 주세요.`);
    return attachment.file;
  });
  const request = toCreateNoticeRequest(form, status);
  try {
    progress.result = await createAdminNotice(request);
  } catch (error) {
    if (error instanceof NoticeCreateOutcomeUnknownError)
      progress.createOutcomeUnknown = true;
    throw error;
  }
  const { postId, imageUploadUrls } = progress.result;
  await uploadFiles(files, imageUploadUrls);
  // 비공개인 임시저장·예약 글은 유저단 썸네일 API의 조회 대상이 아닙니다.
  if (status === 'published' && files.length > 0) {
    await createNoticeThumbnail(request.boardId, postId);
  }
  return progress.result;
}

async function uploadFiles(files: File[], urls: string[]) {
  if (!Array.isArray(urls) || urls.length !== files.length)
    throw new Error(
      '첨부 업로드 주소를 확인할 수 없습니다. 공지 ID와 함께 관리자에게 문의해 주세요.'
    );
  const uploads = await Promise.allSettled(
    files.map((file, index) => uploadNoticeFile(urls[index], file))
  );
  const failed = uploads.find((upload) => upload.status === 'rejected');
  if (failed)
    throw new Error(
      `일부 첨부 업로드에 실패했습니다. ${failed.reason instanceof Error ? failed.reason.message : '목록에서 저장 상태를 확인해 주세요.'}`
    );
}

export async function saveEditedNotice(
  original: Notice,
  form: NoticeForm,
  status: NoticeStatus,
  progress: NoticeSaveProgress
) {
  if (original.deletionStatus)
    throw new Error('삭제된 공지는 수정할 수 없습니다.');
  if (progress.updateOutcomeUnknown)
    throw new NoticeUpdateOutcomeUnknownError();
  if (progress.updateResult)
    throw new Error(
      '이미 수정된 공지입니다. 목록에서 저장 상태를 확인해 주세요.'
    );
  const request = toUpdateNoticeRequest(original, form, status);
  const files = request.images
    ? form.attachments.flatMap((attachment) =>
        attachment.file ? [attachment.file] : []
      )
    : [];
  try {
    progress.updateResult = await updateAdminNotice(original.id, request);
  } catch (error) {
    if (error instanceof NoticeUpdateOutcomeUnknownError)
      progress.updateOutcomeUnknown = true;
    throw error;
  }
  const {
    postId,
    imageUploadUrls,
    status: savedStatus,
  } = progress.updateResult;
  await uploadFiles(files, imageUploadUrls);
  if (
    savedStatus === 'PUBLISHED' &&
    (original.status !== 'published' || request.images !== undefined)
  ) {
    await createNoticeThumbnail(request.boardId ?? original.boardId, postId);
  }
  return progress.updateResult;
}
