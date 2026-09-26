/**
 * 단일건 포인트 화면의 입력 안내·자동 입력·초기화·회원 검색을 검증합니다.
 * 실제 포인트 지급/차감은 실행하지 않습니다.
 */
import { expect, test } from '@playwright/test';

import { getE2EAdminCredentials } from '../../shared/e2e-env';

test.describe('단일건 포인트 지급/차감 read QA', () => {
  test.beforeEach(async ({ page }) => {
    // 기존 dev-auth 프로젝트에서 저장한 로그인 상태로 화면에 진입합니다.
    await page.goto('/point/single');
    await expect(
      page.getByRole('heading', {
        name: '단일건 포인트 지급/차감',
        exact: true,
      })
    ).toBeVisible();
  });

  test('[TC-ADM-PT-001] 필수 항목 없이 적용하면 안내가 표시된다', async ({
    page,
  }) => {
    // 입력값이 없는 상태에서 적용을 누릅니다.
    await page.getByRole('button', { name: '적용', exact: true }).click();

    // 실제 지급 확인창 대신 필수 입력 안내가 표시되어야 합니다.
    await expect(
      page.getByText('모든 필수 항목을 입력해주세요.', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('[TC-ADM-PT-002] 빈 검색어로 검색하면 안내가 표시된다', async ({
    page,
  }) => {
    await page.getByRole('button', { name: '검색', exact: true }).click();

    await expect(
      page.getByText('검색어를 입력해주세요.', { exact: true })
    ).toBeVisible();
    await expect(page.locator('#encryptedUserId')).toHaveValue('');
  });

  test('[TC-ADM-PT-003] 일반 신고 보상을 선택하면 지급량이 10으로 고정된다', async ({
    page,
  }) => {
    await page.getByRole('combobox').click();
    await page
      .getByRole('option', {
        name: '일반 신고 보상 (호칭, 도배 등)',
        exact: true,
      })
      .click();

    await expect(page.getByLabel('포인트 지급/차감량')).toHaveValue('10');
    await expect(page.getByLabel('포인트 지급/차감량')).toHaveAttribute(
      'readonly',
      ''
    );

    // 직접 입력 유형으로 바꾸면 고정값이 지워지고 입력할 수 있어야 합니다.
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '기타', exact: true }).click();
    await expect(page.getByLabel('포인트 지급/차감량')).toHaveValue('');
    await expect(page.getByLabel('포인트 지급/차감량')).toBeEditable();
  });

  test('[TC-ADM-PT-004] 초기화하면 검색어와 포인트 입력값이 지워진다', async ({
    page,
  }) => {
    const search = page.getByPlaceholder('아이디 또는 학번을 입력해주세요.');
    await search.fill('E2E-초기화-확인');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '기타', exact: true }).click();
    await page.getByLabel('포인트 지급/차감량').fill('10');
    await page.getByLabel('메모').fill('[E2E:POINT] 초기화 확인');

    await page.getByRole('button', { name: '초기화', exact: true }).click();

    await expect(search).toHaveValue('');
    await expect(page.getByRole('combobox')).toHaveText(
      '포인트 유형을 선택해주세요'
    );
    await expect(page.getByLabel('포인트 지급/차감량')).toHaveValue('');
    await expect(page.getByLabel('메모')).toHaveValue('');
    await expect(page.locator('#encryptedUserId')).toHaveValue('');
  });

  test('[TC-ADM-PT-005] 로그인한 어드민 아이디로 검색하면 해당 회원 정보가 표시된다', async ({
    page,
  }) => {
    const { loginId } = getE2EAdminCredentials();

    await page
      .getByPlaceholder('아이디 또는 학번을 입력해주세요.')
      .fill(loginId);
    await page.getByRole('button', { name: '검색', exact: true }).click();

    await expect(page.locator('#loginId')).toHaveValue(loginId, {
      timeout: 15_000,
    });
    await expect(page.locator('#encryptedUserId')).not.toHaveValue('');
    await expect(page.locator('#studentNumber')).not.toHaveValue('');
  });
});
