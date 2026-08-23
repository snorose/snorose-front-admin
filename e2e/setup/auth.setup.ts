/**
 * 실제 dev 어드민으로 한 번 로그인하고 후속 TC가 재사용할 인증 상태를 저장합니다.
 */
import { expect, test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import { E2E_AUTH_FILE, getE2EAdminCredentials } from '../shared/e2e-env';

setup('실제 어드민 계정으로 로그인한다', async ({ page }) => {
  const { loginId, password } = getE2EAdminCredentials();

  await page.goto('/');
  await page.getByPlaceholder('스노로즈 아이디').fill(loginId);
  await page.getByPlaceholder('스노로즈 비밀번호').fill(password);

  const loginRequestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/v1/users/login') && request.method() === 'POST'
  );

  await page.getByRole('button', { name: '로그인', exact: true }).click();

  const loginRequest = await loginRequestPromise;
  const loginResponse = await loginRequest.response();
  if (!loginResponse) {
    throw new Error(
      '로그인 API 네트워크 실패: dev API 상태와 localhost:5173 CORS 허용 여부를 확인해주세요.'
    );
  }
  const responseBody = (await loginResponse.json().catch(() => null)) as {
    isSuccess?: boolean;
    message?: string;
  } | null;

  if (!loginResponse.ok() || responseBody?.isSuccess === false) {
    throw new Error(
      `로그인 API 실패 (${loginResponse.status()}): ${responseBody?.message ?? '서버 응답 메시지 없음'}`
    );
  }

  await expect(page).toHaveURL(/\/member\/info$/, { timeout: 10_000 });
  await mkdir(dirname(E2E_AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: E2E_AUTH_FILE });
});
