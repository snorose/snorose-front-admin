/**
 * 단일건 포인트 화면의 입력 안내·자동 입력·초기화·회원 검색을 검증합니다.
 * 실제 포인트 지급/차감은 실행하지 않습니다.
 */
import { type Page, expect, test } from '@playwright/test';

import { getE2EAdminCredentials } from '../../shared/e2e-env';

async function searchAdminMember(page: Page) {
  const { loginId } = getE2EAdminCredentials();
  await page.getByPlaceholder('아이디 또는 학번을 입력해주세요.').fill(loginId);
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('#loginId')).toHaveValue(loginId, {
    timeout: 15_000,
  });
  await expect(page.locator('#encryptedUserId')).not.toHaveValue('');
}

async function selectManualCategory(page: Page) {
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '기타', exact: true }).click();
}

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
    await searchAdminMember(page);
    await expect(page.locator('#studentNumber')).not.toHaveValue('');
  });

  for (const scenario of [
    { id: '006', difference: '10', displayed: '+10', action: '지급' },
    { id: '007', difference: '-10', displayed: '-10', action: '차감' },
  ]) {
    test(`[TC-ADM-PT-${scenario.id}] ${scenario.action} 확인창의 내용을 확인하고 취소한다`, async ({
      page,
    }) => {
      await searchAdminMember(page);
      const member = {
        loginId: await page.locator('#loginId').inputValue(),
        name: await page.locator('#userName').inputValue(),
        major: await page.locator('#major').inputValue(),
        studentNumber: await page.locator('#studentNumber').inputValue(),
      };
      const memo = `[E2E:POINT] ${scenario.action} 확인창 검증`;
      await selectManualCategory(page);
      await page.getByLabel('포인트 지급/차감량').fill(scenario.difference);
      await page.getByLabel('메모').fill(memo);
      await page.getByRole('button', { name: '적용', exact: true }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('heading', {
          name: '포인트 지급/차감 확인',
          exact: true,
        })
      ).toBeVisible();
      for (const [label, value] of [
        ['아이디', member.loginId],
        ['이름', member.name],
        ['학과', member.major],
        ['학번', member.studentNumber],
        ['포인트 유형', '기타'],
        ['포인트 지급/차감량', scenario.displayed],
        ['메모', memo],
      ]) {
        const row = dialog
          .getByText(`${label}:`, { exact: true })
          .locator('..');
        await expect(row).toHaveText(`${label}:${value}`);
      }

      // 확인 버튼은 누르지 않고 취소하여 실제 지급/차감을 하지 않습니다.
      await dialog.getByRole('button', { name: '취소', exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.locator('#loginId')).toHaveValue(member.loginId);
      await expect(page.getByLabel('포인트 지급/차감량')).toHaveValue(
        scenario.difference
      );
      await expect(page.getByLabel('메모')).toHaveValue(memo);
    });
  }

  test('[TC-ADM-PT-008] 메모가 없으면 확인창을 열지 않는다', async ({
    page,
  }) => {
    await searchAdminMember(page);
    await selectManualCategory(page);
    await page.getByLabel('포인트 지급/차감량').fill('10');
    await page.getByRole('button', { name: '적용', exact: true }).click();

    await expect(
      page.getByText('모든 필수 항목을 입력해주세요.', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('[TC-ADM-PT-009] 지급량이 0이면 확인창을 열지 않는다', async ({
    page,
  }) => {
    await searchAdminMember(page);
    await selectManualCategory(page);
    await page.getByLabel('포인트 지급/차감량').fill('0');
    await page.getByLabel('메모').fill('[E2E:POINT] 0 입력 검증');
    await page.getByRole('button', { name: '적용', exact: true }).click();

    await expect(
      page.getByText('유효한 포인트 지급/차감량을 입력해주세요.', {
        exact: true,
      })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
