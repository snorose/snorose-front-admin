/** 실제 dev QA 회원에게 지급·차감하고 잔액을 검증합니다. 내역은 남습니다. */
import { expect, test } from './points.fixture';

test('[TC-ADM-PT-010] QA 회원에게 10포인트 지급 후 차감하면 잔액이 원래대로 돌아온다', async ({
  page,
  pointQa,
}) => {
  const { api, member, memo } = pointQa;
  await page.goto('/point/single');

  for (const difference of [10, -10]) {
    await page
      .getByPlaceholder('아이디 또는 학번을 입력해주세요.')
      .fill(member.loginId);
    await page.getByRole('button', { name: '검색', exact: true }).click();
    await expect(page.locator('#loginId')).toHaveValue(member.loginId, {
      timeout: 15_000,
    });
    await expect(page.locator('#encryptedUserId')).not.toHaveValue('');
    const targetId = await page.locator('#encryptedUserId').inputValue();
    // 암호화 ID 문자열은 조회마다 달라질 수 있으므로 실제 회원을 재확인합니다.
    expect((await api.getMember(targetId)).loginId).toBe(member.loginId);
    await page.getByRole('combobox').click();
    await page
      .getByRole('option', {
        name:
          difference > 0
            ? '포인트 보상 - 기타 사유'
            : '포인트 차감 - 기타 사유',
        exact: true,
      })
      .click();
    await page.getByLabel('포인트 지급/차감량').fill(String(difference));
    await page
      .getByLabel('메모')
      .fill(`${memo} ${difference > 0 ? '지급' : '차감'}`);
    await page.getByRole('button', { name: '적용', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const responsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/v1/admin/points' &&
        response.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: '확인', exact: true }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.isSuccess).toBe(true);
    const request = response.request().postDataJSON();
    expect(request.encryptedUserId).toBe(targetId);
    expect(request.difference).toBe(difference);
    await expect(
      page.getByText('포인트 지급/차감이 완료되었어요.', { exact: true }).last()
    ).toBeVisible();
    await expect(page.locator('#encryptedUserId')).toHaveValue('');
    await expect(dialog).not.toBeVisible();
    await expect
      .poll(
        async () => (await api.getMember(member.encryptedUserId)).pointBalance
      )
      .toBe(member.pointBalance + (difference > 0 ? 10 : 0));
  }
});
