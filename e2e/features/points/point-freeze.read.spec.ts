import { expect, test } from './point-freeze.fixture';

test.describe('포인트 미지급 일정 read QA', () => {
  test.beforeEach(async ({ freezePage }) => {
    const response = freezePage.response('GET');
    await freezePage.goto();
    expect((await response).ok()).toBeTruthy();
    await expect(
      freezePage.page.getByRole('heading', {
        name: '미지급 일정 관리',
        exact: true,
      })
    ).toBeVisible();
  });

  test('[TC-ADM-PF-001] 실제 API의 일정 목록과 표가 일치한다', async ({
    freezePage,
    freezeApi,
  }) => {
    const schedules = await freezeApi.list();
    const table = freezePage.page.getByRole('table');
    for (const name of [
      '번호',
      '상태',
      '일정 제목',
      '시작 일시',
      '종료 일시',
      '생성 일시',
      '수정 일시',
      '더보기',
    ]) {
      await expect(
        table.getByRole('columnheader', { name, exact: true })
      ).toBeVisible();
    }
    await expect(table.locator('tbody tr')).toHaveCount(
      Math.max(schedules.length, 1)
    );
    if (!schedules.length)
      await expect(
        table.getByText('등록된 일정이 없습니다.', { exact: true })
      ).toBeVisible();
    for (const item of schedules) {
      const row = table.getByRole('row').filter({
        has: freezePage.page.getByRole('cell', {
          name: item.title,
          exact: true,
        }),
      });
      await expect(row).toHaveCount(
        schedules.filter((schedule) => schedule.title === item.title).length
      );
    }
  });

  for (const scenario of [
    { id: '002', missing: '제목' },
    { id: '003', missing: '시작 날짜' },
    { id: '004', missing: '종료 날짜' },
  ]) {
    test(`[TC-ADM-PF-${scenario.id}] ${scenario.missing} 누락 시 필수 입력 안내가 표시된다`, async ({
      freezePage,
    }) => {
      if (scenario.missing !== '제목')
        await freezePage.form
          .getByLabel('일정 제목')
          .fill('[E2E:POINT-FREEZE] 입력 검증');
      if (scenario.missing !== '시작 날짜')
        await freezePage.selectDate('시작', 10);
      if (scenario.missing !== '종료 날짜')
        await freezePage.selectDate('종료', 11);
      await freezePage.form
        .getByRole('button', { name: '생성', exact: true })
        .click();
      await expect(
        freezePage.page.getByText('모든 필수 항목을 입력해주세요.', {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        freezePage.form.getByRole('button', { name: '초기화', exact: true })
      ).toBeVisible();
    });
  }

  test('[TC-ADM-PF-005] 초기화하면 제목·날짜·시간이 초기 상태로 돌아온다', async ({
    freezePage,
  }) => {
    await freezePage.fill('[E2E:POINT-FREEZE] 초기화 검증');
    await freezePage.form
      .getByRole('button', { name: '초기화', exact: true })
      .click();
    await expect(freezePage.form.getByLabel('일정 제목')).toHaveValue('');
    await expect(
      freezePage.form.getByRole('button', {
        name: '시작 날짜 선택',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      freezePage.form.getByRole('button', {
        name: '종료 날짜 선택',
        exact: true,
      })
    ).toBeVisible();
    for (let index = 0; index < 4; index += 1)
      await expect(freezePage.form.getByRole('combobox').nth(index)).toHaveText(
        index % 2 === 0 ? '00시' : '00분'
      );
  });
});
