import { type BrowserContext, expect } from '@playwright/test';

import type {
  AdminNoticeListItem,
  AdminNoticeListResult,
  AdminUpdateNoticeResult,
} from '../../../src/domains/Notices/types';
import type { BaseResponse } from '../../../src/shared/types';
import { getE2EApiBaseUrl } from '../../shared/e2e-env';

export interface UserNotice {
  postId: number;
  title: string;
  thumbnailUrl: string | null;
}

export interface UserNoticeDetail {
  postId: number;
  title: string;
  content: string;
  isNotice: boolean;
  attachments: {
    id: number;
    type: 'PHOTO' | 'VIDEO';
    fileName: string;
    url: string | null;
  }[];
}

export class NoticesApi {
  private readonly baseUrl = getE2EApiBaseUrl();

  constructor(private readonly context: BrowserContext) {}

  private async get(path: string) {
    const token = (await this.context.cookies()).find(
      (cookie) => cookie.name === 'accessToken'
    )?.value;
    if (!token) throw new Error('dev-auth 인증 상태가 필요합니다.');
    return this.context.request.get(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15_000,
    });
  }

  async all() {
    const items: AdminNoticeListItem[] = [];
    const seen = new Set<number>();
    let totalPage = 1;
    for (let page = 0; page < totalPage && page < 200; page += 1) {
      const response = await this.get(`/v1/admin/notices?page=${page}`);
      expect(response.status(), '실제 공지 목록 API HTTP 상태').toBe(200);
      const body =
        (await response.json()) as BaseResponse<AdminNoticeListResult>;
      expect(body.isSuccess, '실제 공지 목록 API 성공 여부').toBe(true);
      if (page === 0) totalPage = Math.max(1, body.result.totalPage);
      const previousCount = items.length;
      for (const item of body.result.data) {
        if (seen.has(item.postId)) continue;
        seen.add(item.postId);
        items.push(item);
      }
      if (!body.result.hasNext || page + 1 >= totalPage) return items;
      if (items.length === previousCount)
        throw new Error('공지 목록의 다음 페이지가 반복됩니다.');
    }
    throw new Error('공지 목록 조회가 200페이지를 초과했습니다.');
  }

  async find(postId: number) {
    return (await this.all()).find((item) => item.postId === postId);
  }

  /** 이 테스트가 새로 만든 QA 공지만 비공개로 정리합니다. */
  async ensureQaHidden(postId: number, titlePrefix: string) {
    const item = await this.find(postId);
    if (
      item &&
      (!titlePrefix.startsWith('[E2E:NOTICE:') ||
        !item.title.startsWith(titlePrefix))
    )
      throw new Error('이 테스트가 작성한 공지만 비공개로 정리할 수 있습니다.');
    if (!item || !['PUBLISHED', 'SCHEDULED'].includes(item.status)) return;
    const token = (await this.context.cookies()).find(
      (cookie) => cookie.name === 'accessToken'
    )?.value;
    if (!token) throw new Error('QA 정리에 필요한 인증 상태가 없습니다.');
    const response = await this.context.request.patch(
      `${this.baseUrl}/v1/admin/notices/${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { isVisible: false },
      }
    );
    expect(
      response.status(),
      `테스트가 생성한 공지 ${postId} 비공개 정리`
    ).toBe(200);
    const body =
      (await response.json()) as BaseResponse<AdminUpdateNoticeResult>;
    expect(body.isSuccess, 'QA 비공개 처리 성공 여부').toBe(true);
    expect(body.result.status, 'QA 정리 후 상태').toBe('PRIVATE');
  }

  async userNotices(boardId = 12) {
    const response = await this.get(`/v1/notices/boards/${boardId}`);
    expect(response.status(), '유저단 공지 목록 HTTP 상태').toBe(200);
    const body = (await response.json()) as BaseResponse<UserNotice[]>;
    expect(body.isSuccess, '유저단 공지 목록 성공 여부').toBe(true);
    expect(Array.isArray(body.result)).toBe(true);
    return body.result;
  }

  async detail(postId: number, boardId = 12) {
    const response = await this.get(`/v1/boards/${boardId}/posts/${postId}`);
    if (response.status() === 404) return null;
    expect(response.status(), '유저단 공지 상세 HTTP 상태').toBe(200);
    const body = (await response.json()) as BaseResponse<UserNoticeDetail>;
    expect(body.isSuccess, '유저단 공지 상세 성공 여부').toBe(true);
    return body.result;
  }
}
