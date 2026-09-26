import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import type { MemberInfo } from '../../../src/shared/types';
import { getE2EAdminCredentials } from '../../shared/e2e-env';
import { PointsApi } from './points.api';

type PointQa = { api: PointsApi; member: MemberInfo; memo: string };

async function restoreQaBalance({ api, member, memo }: PointQa) {
  const current = await api.getMember(member.encryptedUserId);
  const difference = member.pointBalance - current.pointBalance;
  if (difference !== 0) {
    // 다른 작업의 변경분을 덮어쓰지 않도록 이 테스트의 증감 범위만 복구합니다.
    if (Math.abs(difference) !== 10)
      throw new Error(
        '예상 범위를 벗어난 QA 잔액 변경입니다. 자동 복구를 중단합니다.'
      );
    await api.restoreBalance(
      member.encryptedUserId,
      difference,
      `${memo} 잔액 복구`
    );
  }
  await expect
    .poll(
      async () => (await api.getMember(member.encryptedUserId)).pointBalance
    )
    .toBe(member.pointBalance);
}

export const test = base.extend<{ pointQa: PointQa }>({
  pointQa: async ({ context }, use) => {
    const loginId = process.env.E2E_QA_POINT_LOGIN_ID?.trim();
    if (!loginId)
      throw new Error('.env.e2e.local에 E2E_QA_POINT_LOGIN_ID를 설정해주세요.');
    if (loginId === getE2EAdminCredentials().loginId)
      throw new Error(
        '포인트 write 테스트는 로그인 계정과 다른 QA 회원을 사용해야 합니다.'
      );
    const api = await PointsApi.create(context);
    const member = await api.findMember(loginId);
    const memo = `[E2E:POINT:${randomUUID()}]`;
    try {
      await use({ api, member, memo });
    } finally {
      await restoreQaBalance({ api, member, memo });
    }
  },
});

export { expect } from '@playwright/test';
