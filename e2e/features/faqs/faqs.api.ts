import type { APIRequestContext, BrowserContext } from '@playwright/test';

import type {
  Faq,
  FaqInput,
  FaqPage,
  FaqResult,
} from '../../../src/domains/Faqs/types';
import type { BaseResponse } from '../../../src/shared/types';
import { getE2EApiBaseUrl } from '../../shared/e2e-env';

const FAQ_PATH = '/v1/admin/support/faq';

export class FaqApi {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  static async create(context: BrowserContext) {
    const baseUrl = getE2EApiBaseUrl();
    const token = (await context.cookies()).find(
      (cookie) => cookie.name === 'accessToken'
    )?.value;
    if (!token) throw new Error('dev-auth의 인증 상태가 필요합니다.');
    return new FaqApi(context.request, baseUrl, token);
  }

  async list(page = 0) {
    const result = await this.call<FaqPage>('GET', `${FAQ_PATH}?page=${page}`);
    if (!Array.isArray(result.data) || typeof result.hasNext !== 'boolean')
      throw new Error('FAQ 목록 응답의 data·hasNext 형식을 확인해주세요.');
    return result;
  }

  async all() {
    const located: { faq: Faq; page: number }[] = [];
    const seen = new Set<number>();
    for (let page = 0; page < 200; page += 1) {
      const result = await this.list(page);
      const fresh = result.data.filter((faq) => !seen.has(faq.faqId));
      for (const faq of fresh) {
        seen.add(faq.faqId);
        located.push({ faq, page });
      }
      if (!result.hasNext) return located;
      if (!fresh.length)
        throw new Error('FAQ 다음 페이지가 반복되거나 비어 있습니다.');
    }
    throw new Error('FAQ 탐색이 200페이지를 초과했습니다.');
  }

  async find(faqId: number) {
    const all = await this.all();
    const index = all.findIndex((item) => item.faq.faqId === faqId);
    return index < 0
      ? null
      : { faq: all[index].faq, page: Math.floor(index / 10) };
  }

  async createForPagination(prefix: string, index: number) {
    if (
      !/^\[E2E:FAQ:[a-f0-9]{16}\]$/.test(prefix) ||
      !Number.isSafeInteger(index) ||
      index < 1
    )
      throw new Error('현재 실행의 QA FAQ만 생성할 수 있습니다.');
    return this.call<FaqResult>('POST', FAQ_PATH, {
      category: '기능 이용',
      question: `${prefix} ${index}`,
      answer: `페이지네이션 확인용 내용 ${index}`,
    });
  }

  async cleanup(prefix: string) {
    if (!/^\[E2E:FAQ:[a-f0-9]{16}\]$/.test(prefix))
      throw new Error('현재 실행에서 생성한 E2E FAQ만 정리할 수 있습니다.');
    // 페이지 이동 중 삭제로 항목이 밀리지 않도록 먼저 모든 대상 ID를 수집합니다.
    const targets = (await this.all()).filter(({ faq }) =>
      faq.question.startsWith(prefix)
    );
    const results = await Promise.allSettled(
      targets.map(({ faq }) => this.call('DELETE', `${FAQ_PATH}/${faq.faqId}`))
    );
    if (results.some((result) => result.status === 'rejected'))
      throw new Error(
        '일부 E2E FAQ 삭제에 실패했습니다. QA 데이터를 확인해주세요.'
      );
    if ((await this.all()).some(({ faq }) => faq.question.startsWith(prefix)))
      throw new Error('E2E FAQ가 정리 후에도 남아 있습니다.');
  }

  private async call<T>(
    method: 'GET' | 'DELETE' | 'POST',
    path: string,
    data?: FaqInput
  ): Promise<T> {
    const response = await this.request.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    });
    if (!response.ok())
      throw new Error(`${method} ${path} 실패 (${response.status()})`);
    const body = (await response.json()) as BaseResponse<T>;
    if (!body.isSuccess) throw new Error(`${method} ${path} 응답 실패`);
    return body.result;
  }
}
