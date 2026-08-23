/**
 * 문의·신고 실제 dev API 조회와 테스트 데이터 복구 요청을 담당합니다.
 * 인증 토큰은 저장된 Playwright 인증 상태에서만 읽고 오류 메시지에는 포함하지 않습니다.
 */
import { readFile } from 'node:fs/promises';

import type {
  AdminInquiryCommentListResult,
  AdminInquiryListResult,
  BaseResponse,
  InquiryComment,
  InquiryDetail,
  InquiryListItem,
  InquiryStatus,
} from '../../../src/shared/types';
import { E2E_AUTH_FILE, getE2EApiBaseUrl } from '../../shared/e2e-env';

const MAX_LIST_PAGES = 100;

export type LocatedInquiry = {
  item: InquiryListItem;
  pageNumber: number;
  rowIndex: number;
};

export class InquiryReportApi {
  private inquiries: InquiryListItem[] | null = null;
  private readonly details = new Map<number, InquiryDetail | null>();
  private readonly comments = new Map<number, InquiryComment[]>();

  private constructor(
    private readonly apiBaseUrl: string,
    private readonly accessToken: string
  ) {}

  static async create() {
    const storageState = JSON.parse(await readFile(E2E_AUTH_FILE, 'utf8')) as {
      cookies?: Array<{ name: string; value: string }>;
    };
    const accessToken = storageState.cookies?.find(
      ({ name }) => name === 'accessToken'
    )?.value;

    if (!accessToken) {
      throw new Error(
        '실서버 인증 정보에 accessToken이 없습니다. dev-auth를 먼저 실행해주세요.'
      );
    }
    return new InquiryReportApi(getE2EApiBaseUrl(), accessToken);
  }

  async getAllInquiries() {
    if (this.inquiries) return this.inquiries;

    const inquiries: InquiryListItem[] = [];
    for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
      const result = await this.request<AdminInquiryListResult>(
        'GET',
        `/v1/admin/inquiries?page=${page}`
      );
      inquiries.push(...result.data.map(normalizeListItem));
      if (!result.hasNext) {
        this.inquiries = inquiries;
        return inquiries;
      }
    }
    throw new Error('문의 및 신고 목록 조회가 최대 페이지 수를 초과했습니다.');
  }

  async findInquiry(postId: number): Promise<LocatedInquiry> {
    const inquiries = await this.getAllInquiries();
    const index = inquiries.findIndex((item) => item.postId === postId);

    if (index < 0) {
      throw new Error(
        `고정 QA ID ${postId}를 문의·신고 목록에서 찾을 수 없습니다.`
      );
    }
    return {
      item: inquiries[index],
      pageNumber: Math.floor(index / 10) + 1,
      rowIndex: index % 10,
    };
  }

  async getDetail(postId: number) {
    const detail = await this.tryGetDetail(postId);
    if (!detail) {
      throw new Error(`GET /v1/admin/inquiries/${postId} 상세 조회 실패`);
    }
    return detail;
  }

  async tryGetDetail(postId: number) {
    if (this.details.has(postId)) return this.details.get(postId) ?? null;

    try {
      const detail = normalizeDetail(
        await this.request<InquiryDetail>(
          'GET',
          `/v1/admin/inquiries/${postId}`
        )
      );
      this.details.set(postId, detail);
      return detail;
    } catch {
      this.details.set(postId, null);
      return null;
    }
  }

  async getComments(postId: number, refresh = false) {
    const cached = this.comments.get(postId);
    if (cached && !refresh) return cached;

    const result = await this.request<AdminInquiryCommentListResult>(
      'GET',
      `/v1/posts/${postId}/comments?page=0`
    );
    this.comments.set(postId, result.data);
    return result.data;
  }

  async updateStatus(postId: number, status: InquiryStatus) {
    await this.request('PATCH', `/v1/admin/inquiries/${postId}/status`, {
      status,
    });
    this.details.delete(postId);
    this.inquiries = null;
  }

  async deleteComment(postId: number, commentId: number) {
    await this.request('DELETE', `/v1/posts/${postId}/comments/${commentId}`);
    this.comments.delete(postId);
  }

  private async request<T>(method: string, path: string, data?: unknown) {
    let response: Response;

    try {
      response = await fetch(new URL(path, this.apiBaseUrl), {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data === undefined ? undefined : JSON.stringify(data),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new Error(`${method} ${path} 요청 실패`);
    }

    if (!response.ok) {
      throw new Error(`${method} ${path} 응답 실패 (${response.status})`);
    }

    let body: BaseResponse<T>;
    try {
      body = (await response.json()) as BaseResponse<T>;
    } catch {
      throw new Error(`${method} ${path} JSON 응답 파싱 실패`);
    }

    if (!body.isSuccess) {
      throw new Error(`${method} ${path} API 처리 실패 (${response.status})`);
    }
    return body.result;
  }
}

function normalizeListItem(item: InquiryListItem): InquiryListItem {
  return {
    ...item,
    group: item.group.toUpperCase() as InquiryListItem['group'],
  };
}

function normalizeDetail(detail: InquiryDetail): InquiryDetail {
  return {
    ...detail,
    group: detail.group.toUpperCase() as InquiryDetail['group'],
  };
}
