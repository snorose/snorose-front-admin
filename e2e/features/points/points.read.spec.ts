/**
 * 단일건 포인트 화면의 필수 입력 안내를 검증합니다.
 * 실제 포인트 지급/차감은 실행하지 않습니다.
 */
import { expect, test } from '@playwright/test';

test.describe('단일건 포인트 지급/차감 read QA', () => {
  test('[TC-ADM-PT-001] 필수 항목 없이 적용하면 안내가 표시된다', async ({
    page,
  }) => {
    // 기존 dev-auth 프로젝트에서 저장한 로그인 상태로 화면에 진입합니다.
    await page.goto('/point/single');
    await expect(
      page.getByRole('heading', {
        name: '단일건 포인트 지급/차감',
        exact: true,
      })
    ).toBeVisible();

    // 입력값이 없는 상태에서 적용을 누릅니다.
    await page.getByRole('button', { name: '적용', exact: true }).click();

    // 실제 지급 확인창 대신 필수 입력 안내가 표시되어야 합니다.
    await expect(
      page.getByText('모든 필수 항목을 입력해주세요.', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
