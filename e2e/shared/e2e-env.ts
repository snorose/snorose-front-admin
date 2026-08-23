/**
 * E2E 환경변수를 로드·검증하고 실서버 테스트가 dev API에서만 실행되도록 제한합니다.
 */
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

export const E2E_AUTH_FILE = 'playwright/.auth/admin.json';

for (const envFile of ['.env', '.env.e2e.local']) {
  if (existsSync(envFile)) loadEnvFile(envFile);
}

export function getE2EAdminCredentials() {
  const loginId = process.env.E2E_ADMIN_LOGIN_ID?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD?.trim();

  if (!loginId || !password) {
    throw new Error(
      '.env.e2e.local에 E2E_ADMIN_LOGIN_ID와 E2E_ADMIN_PASSWORD를 입력해주세요.'
    );
  }

  return { loginId, password };
}

export function getE2EApiBaseUrl() {
  const apiBaseUrl = process.env.VITE_API_BASE_URL?.trim();

  if (!apiBaseUrl) {
    throw new Error('.env에 VITE_API_BASE_URL을 입력해주세요.');
  }

  if (new URL(apiBaseUrl).hostname !== 'dev.snorose.com') {
    throw new Error(
      `실서버 변경 E2E는 dev.snorose.com에서만 실행할 수 있습니다: ${apiBaseUrl}`
    );
  }

  return apiBaseUrl.replace(/\/$/, '');
}

export function getE2EQaRecordIds() {
  return {
    inquiryId: getPositiveInteger('E2E_QA_INQUIRY_ID'),
    reportId: getPositiveInteger('E2E_QA_REPORT_ID'),
  };
}

function getPositiveInteger(name: string) {
  const value = process.env[name]?.trim();
  const parsed = Number(value);

  if (!value || !Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`.env.e2e.local에 ${name}를 양의 정수 ID로 입력해주세요.`);
  }
  return parsed;
}
