import type { APIRequestContext, BrowserContext } from '@playwright/test';

import type { BaseResponse, PointFreeze } from '../../../src/shared/types';
import { getE2EApiBaseUrl } from '../../shared/e2e-env';

export class PointFreezeApi {
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
    return new PointFreezeApi(context.request, baseUrl, token);
  }

  list() {
    return this.call<PointFreeze[]>('GET', '/v1/admin/points/point-freeze');
  }

  async cleanup(prefix: string) {
    if (!/^\[E2E:PF:[a-f0-9]{16}\]$/.test(prefix))
      throw new Error('E2E 일정만 정리할 수 있습니다.');
    const schedules = (await this.list()).filter((item) =>
      item.title.startsWith(prefix)
    );
    // 한 일정의 삭제가 실패해도 나머지 테스트 일정은 정리합니다.
    const results = await Promise.allSettled(
      schedules.map((item) =>
        this.call<void>('DELETE', `/v1/admin/points/point-freeze/${item.id}`)
      )
    );
    if (results.some((result) => result.status === 'rejected'))
      throw new Error(
        '일부 E2E 일정 삭제에 실패했습니다. QA 일정을 확인해주세요.'
      );
    if ((await this.list()).some((item) => item.title.startsWith(prefix)))
      throw new Error('E2E 일정이 정리 후에도 남아 있습니다.');
  }

  private async call<T>(method: 'GET' | 'DELETE', path: string): Promise<T> {
    const response = await this.request.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!response.ok())
      throw new Error(`${method} ${path} 실패 (${response.status()})`);
    const body = (await response.json()) as BaseResponse<T>;
    if (!body.isSuccess) throw new Error(`${method} ${path} 응답 실패`);
    return body.result;
  }
}
