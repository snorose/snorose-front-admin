import type { Response } from '@playwright/test';

import { expect, test } from './point-freeze.fixture';

async function expectSuccess(response: Response) {
  const body = await response.json();
  expect(
    response.ok(),
    `일정 API 실패 (${response.status()}): ${body.message ?? '응답 메시지 없음'}`
  ).toBeTruthy();
  expect(body.isSuccess).toBe(true);
}

test('[TC-ADM-PF-006] QA 일정 등록·수정·삭제와 취소를 실제 API로 검증한다', async ({
  freezePage,
  freezeApi,
  freezeQa,
}) => {
  const title = `${freezeQa.prefix} 등록`;
  const changed = `${freezeQa.prefix} 수정`;
  await freezePage.goto();
  await freezePage.fill(title);
  const createPromise = freezePage.response('POST');
  await freezePage.form
    .getByRole('button', { name: '생성', exact: true })
    .click();
  const createResponse = await createPromise;
  await expectSuccess(createResponse);
  const payload = createResponse.request().postDataJSON();
  expect(payload.title).toBe(title);
  await expect(freezePage.row(title)).toBeVisible();
  const created = (await freezeApi.list()).find((item) => item.title === title);
  expect(created).toBeDefined();
  expect(created!.startAt.replace('T', ' ').slice(0, 19)).toBe(payload.startAt);
  expect(created!.endAt.replace('T', ' ').slice(0, 19)).toBe(payload.endAt);
  await expect(freezePage.form.getByLabel('일정 제목')).toHaveValue('');

  await freezePage.menu(title, '수정');
  let dialog = freezePage.page.getByRole('dialog');
  await expect(dialog.locator('#title')).toHaveValue(title);
  await dialog.locator('#title').fill(changed);
  await dialog.getByRole('button', { name: '취소', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(
    (await freezeApi.list()).find((item) => item.id === created!.id)?.title
  ).toBe(title);

  await freezePage.menu(title, '수정');
  dialog = freezePage.page.getByRole('dialog');
  await dialog.locator('#title').fill(changed);
  await freezePage.setTime(dialog, 1, '14', '45');
  const updatePromise = freezePage.response('PATCH');
  await dialog.getByRole('button', { name: '수정', exact: true }).click();
  const updateResponse = await updatePromise;
  await expectSuccess(updateResponse);
  await expect(dialog).not.toBeVisible();
  await expect(freezePage.row(changed)).toBeVisible();
  const updated = (await freezeApi.list()).find(
    (item) => item.id === created!.id
  );
  expect(updated?.title).toBe(changed);
  expect(updated?.endAt.replace('T', ' ').slice(0, 19)).toBe(
    updateResponse.request().postDataJSON().endAt
  );

  await freezePage.menu(changed, '삭제');
  dialog = freezePage.page.getByRole('dialog');
  await expect(dialog.getByText(changed, { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '취소', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await freezeApi.list()).some((item) => item.id === created!.id)).toBe(
    true
  );
  await freezePage.menu(changed, '삭제');
  const deletePromise = freezePage.response('DELETE');
  await freezePage.page
    .getByRole('dialog')
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await expectSuccess(await deletePromise);
  await expect(freezePage.row(changed)).toHaveCount(0);
  expect((await freezeApi.list()).some((item) => item.id === created!.id)).toBe(
    false
  );
});

test('[TC-ADM-PF-007] 시작일이 종료일보다 늦으면 등록을 거절한다', async ({
  freezePage,
  freezeApi,
  freezeQa,
}) => {
  const title = `${freezeQa.prefix} 날짜 역순`;
  await freezePage.goto();
  await freezePage.fill(title, 11, 10);
  const responsePromise = freezePage.response('POST');
  await freezePage.form
    .getByRole('button', { name: '생성', exact: true })
    .click();
  const response = await responsePromise;
  const body = await response.json();
  expect(
    response.status(),
    `날짜 검증 대신 다른 오류 발생: ${body.message ?? '응답 메시지 없음'}`
  ).toBe(400);
  expect(
    response.ok() && body.isSuccess === true,
    '역순 날짜 등록은 거절되어야 합니다.'
  ).toBe(false);
  await expect(
    freezePage.page.locator('[data-sonner-toast][data-type="error"]')
  ).toBeVisible();
  expect((await freezeApi.list()).some((item) => item.title === title)).toBe(
    false
  );
});
