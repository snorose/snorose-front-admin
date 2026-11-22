import { isAxiosError } from 'axios';

import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
  AdminNoticeListItem,
  AdminNoticeListResult,
  AdminUpdateNoticeRequest,
  AdminUpdateNoticeResult,
} from '@/domains/Notices/types';
import { getNoticeFileType } from '@/domains/Notices/utils/attachments';

import { getAllUsersAPI } from './users';

// 공지 목록에는 작성자 ID가 없으므로 회원 검색 결과의 닉네임을 정확히 대조합니다.
export async function getNoticeAuthorId(nickname: string): Promise<string> {
  if (!nickname.trim()) throw new Error('작성자 정보를 확인할 수 없습니다.');
  const matches = new Set<string>();
  const seen = new Set<string>();
  for (let page = 0; ; page += 1) {
    const result = await getAllUsersAPI({ keyword: nickname, page });
    const previousCount = seen.size;
    for (const member of result.data) {
      if (!member.encryptedUserId) continue;
      seen.add(member.encryptedUserId);
      if (member.nickname === nickname) matches.add(member.encryptedUserId);
    }
    if (matches.size > 1)
      throw new Error(
        '같은 닉네임의 회원이 여러 명이라 작성자를 확인할 수 없습니다.'
      );
    if (!result.hasNext) break;
    if (seen.size === previousCount)
      throw new Error('회원 검색의 다음 페이지를 확인할 수 없습니다.');
  }
  const [id] = matches;
  if (!id) throw new Error('작성자의 회원 정보를 찾을 수 없습니다.');
  return id;
}

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

export class NoticeUpdateOutcomeUnknownError extends Error {
  constructor() {
    super(
      '서버의 수정 결과를 확인하지 못했습니다. 첨부 중복 추가를 막기 위해 다시 저장할 수 없습니다. 새 창의 목록에서 반영 여부를 확인해 주세요.'
    );
    this.name = 'NoticeUpdateOutcomeUnknownError';
  }
}

export async function updateAdminNotice(
  postId: number,
  body: AdminUpdateNoticeRequest
): Promise<AdminUpdateNoticeResult> {
  let data: BaseResponse<AdminUpdateNoticeResult>;
  try {
    ({ data } = await axiosInstance.patch<
      BaseResponse<AdminUpdateNoticeResult>
    >(`/v1/admin/notices/${postId}`, body));
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status && status >= 400 && status < 500 && status !== 408) throw error;
    throw new NoticeUpdateOutcomeUnknownError();
  }
  if (!data || typeof data.isSuccess !== 'boolean')
    throw new NoticeUpdateOutcomeUnknownError();
  const result = unwrap(data);
  if (
    !result ||
    result.postId !== postId ||
    !['PUBLISHED', 'SCHEDULED', 'DRAFT', 'PRIVATE'].includes(result.status)
  )
    throw new NoticeUpdateOutcomeUnknownError();
  return result;
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

// 검색·정렬 API가 없으므로 조건이 있는 목록에서만 전체 페이지를 수집합니다.
export async function getAllAdminNotices(): Promise<AdminNoticeListItem[]> {
  const notices: AdminNoticeListItem[] = [];
  const seen = new Set<number>();
  let totalPage = 1;
  for (let page = 0; page < totalPage; page += 1) {
    const result = await getAdminNotices(page);
    if (page === 0) totalPage = Math.max(1, result.totalPage);
    const previousCount = notices.length;
    for (const notice of result.data) {
      if (seen.has(notice.postId)) continue;
      seen.add(notice.postId);
      notices.push(notice);
    }
    if (!result.hasNext || page + 1 >= totalPage) return notices;
    if (notices.length === previousCount)
      throw new Error('공지 목록의 다음 페이지를 확인할 수 없습니다.');
  }
  return notices;
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
      headers: {
        'Content-Type': getNoticeFileType(file) || 'application/octet-stream',
      },
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error(
      `${file.name} 업로드 응답을 받지 못했습니다. 네트워크 연결과 공지 목록의 저장 상태를 확인해 주세요.`
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
