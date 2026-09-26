import type { APIRequestContext, BrowserContext } from '@playwright/test';

import type {
  AdminUserListResult,
  BaseResponse,
  MemberInfo,
} from '../../../src/shared/types';
import { getE2EApiBaseUrl } from '../../shared/e2e-env';

export class PointsApi {
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
    return new PointsApi(context.request, baseUrl, token);
  }

  async findMember(loginId: string) {
    const matches = new Map<string, MemberInfo>();
    for (let page = 0; page < 100; page += 1) {
      const result = await this.call<AdminUserListResult>(
        'GET',
        `/v2/admin/users?keyword=${encodeURIComponent(loginId)}&page=${page}`
      );
      for (const member of result.data) {
        if (member.loginId === loginId) {
          matches.set(
            member.encryptedUserId,
            await this.getMember(member.encryptedUserId)
          );
        }
      }
      if (!result.hasNext) {
        if (matches.size !== 1)
          throw new Error(
            '포인트 QA 아이디와 정확히 일치하는 회원이 한 명이어야 합니다.'
          );
        return [...matches.values()][0];
      }
    }
    throw new Error('QA 회원 검색이 최대 페이지 수를 초과했습니다.');
  }

  async getMember(id: string) {
    const member = await this.call<MemberInfo>(
      'GET',
      `/v1/admin/users/${encodeURIComponent(id)}`
    );
    if (!Number.isSafeInteger(member.pointBalance))
      throw new Error('회원 잔액을 정수로 확인할 수 없습니다.');
    return member;
  }

  async assertStudentNumberAbsent(studentNumber: string) {
    for (let page = 0; page < 100; page += 1) {
      const result = await this.call<AdminUserListResult>(
        'GET',
        `/v2/admin/users?keyword=${encodeURIComponent(studentNumber)}&page=${page}`
      );
      if (
        result.data.some((member) => member.studentNumber === studentNumber)
      ) {
        throw new Error(
          '실패 행 검증용 학번이 실제 회원에게 존재합니다. 지급 전에 테스트를 중단합니다.'
        );
      }
      if (!result.hasNext) return;
    }
    throw new Error('실패 행 학번 확인이 최대 페이지 수를 초과했습니다.');
  }

  async restoreBalance(id: string, difference: number, memo: string) {
    await this.call<void>('POST', '/v1/admin/points', {
      encryptedUserId: id,
      difference,
      category: 'POINT_REWARD_ETC',
      source: 'ADMIN',
      memo,
    });
  }

  private async call<T>(
    method: 'GET' | 'POST',
    path: string,
    data?: unknown
  ): Promise<T> {
    const response = await this.request.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    });
    if (!response.ok())
      throw new Error(
        `${method} ${path.split('?')[0]} 실패 (${response.status()})`
      );
    const body = (await response.json()) as BaseResponse<T>;
    if (!body.isSuccess)
      throw new Error(`${method} ${path.split('?')[0]} 응답 실패`);
    return body.result;
  }
}
