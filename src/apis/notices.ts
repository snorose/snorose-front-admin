import { isAxiosError } from 'axios';

import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
  AdminNoticeListItem,
  AdminNoticeListResult,
} from '@/domains/Notices/types';

function unwrap<T>(response: BaseResponse<T>): T {
  if (!response.isSuccess) throw new Error(response.message);
  return response.result;
}

export class NoticeCreateOutcomeUnknownError extends Error {
  constructor() {
    super(
      '서버의 저장 결과를 확인하지 못했습니다. 중복 등록을 막기 위해 다시 저장할 수 없습니다. 새 창의 목록에서 등록 여부를 확인해 주세요.'
    );
    this.name = 'NoticeCreateOutcomeUnknownError';
  }
}

export async function getAdminNotices(
  page = 0
): Promise<AdminNoticeListResult> {
  const { data } = await axiosInstance.get<BaseResponse<AdminNoticeListResult>>(
    '/v1/admin/notices',
    { params: { page } }
  );
  return unwrap(data);
}

// 조회 API는 page만 받으므로 전체 페이지를 수집한 뒤 화면의 검색·필터를 적용합니다.
export async function getAllAdminNotices(): Promise<AdminNoticeListItem[]> {
  const notices: AdminNoticeListItem[] = [];
  const seen = new Set<number>();
  for (let page = 0; ; page += 1) {
    const result = await getAdminNotices(page);
    const previousCount = notices.length;
    for (const notice of result.data) {
      if (seen.has(notice.postId)) continue;
      seen.add(notice.postId);
      notices.push(notice);
    }
    if (!result.hasNext) return notices;
    if (notices.length === previousCount)
      throw new Error('공지 목록의 다음 페이지를 확인할 수 없습니다.');
  }
}

export async function createAdminNotice(
  body: AdminCreateNoticeRequest
): Promise<AdminCreateNoticeResult> {
  let data: BaseResponse<AdminCreateNoticeResult>;
  try {
    ({ data } = await axiosInstance.post<BaseResponse<AdminCreateNoticeResult>>(
      '/v1/admin/notices',
      body
    ));
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status && status >= 400 && status < 500 && status !== 408) throw error;
    // 타임아웃·응답 유실·서버 오류에서는 이미 생성되었을 수 있으므로 재POST하지 않습니다.
    throw new NoticeCreateOutcomeUnknownError();
  }
  if (!data || typeof data.isSuccess !== 'boolean')
    throw new NoticeCreateOutcomeUnknownError();
  const result = unwrap(data);
  if (!result || !Number.isSafeInteger(result.postId) || result.postId <= 0)
    throw new NoticeCreateOutcomeUnknownError();
  return result;
}

// presigned URL에는 관리자 인증 인터셉터나 쿠키를 전달하지 않습니다.
export async function uploadNoticeFile(url: string, file: File) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.username || target.password)
    throw new Error(
      '첨부 업로드 주소를 확인할 수 없습니다. 관리자에게 문의해 주세요.'
    );
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PUT',
      body: file,
      credentials: 'omit',
      redirect: 'error',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error(
      `${file.name} 업로드 응답을 받지 못했습니다. 네트워크 상태를 확인한 뒤 첨부 처리를 다시 시도해 주세요.`
    );
  }
  if (response.status === 403)
    throw new Error(
      '첨부 업로드 주소가 만료되었거나 접근이 거절되었습니다. 공지 ID와 함께 관리자에게 문의해 주세요.'
    );
  if (!response.ok) throw new Error(`${file.name} 파일 업로드에 실패했습니다.`);
}

export async function createNoticeThumbnail(boardId: number, postId: number) {
  const { data } = await axiosInstance.post<BaseResponse<unknown>>(
    `/v1/boards/${boardId}/posts/${postId}/thumbnail`
  );
  unwrap(data);
}
