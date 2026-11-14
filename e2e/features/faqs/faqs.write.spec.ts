import type { Response } from '@playwright/test';

import type { FaqInput, FaqResult } from '../../../src/domains/Faqs/types';
import { expect, test } from './faqs.fixture';

test('[TC-ADM-FAQ-015] 신규 카테고리를 팝업에서 추가하고 저장·필터·재선택한다', async ({
  page,
  faqPage,
  faqApi,
  faqQa,
}) => {
  await expectSuccess(await faqPage.goto());
  await faqPage.openCreate();
  await faqPage.editor.getByRole('combobox', { name: /^분류/ }).click();
  const addOption = page.getByRole('option', {
    name: '신규 카테고리 추가',
    exact: true,
  });
  await expect(page.getByRole('option').last()).toHaveText(
    '신규 카테고리 추가'
  );
  await expect(addOption.locator('[data-slot=badge]')).toHaveCount(0);
  await addOption.click();
  const popup = page.getByRole('dialog', {
    name: '신규 카테고리 추가',
    exact: true,
  });
  const category = `${faqQa.prefix} 분류`;
  await popup.getByLabel('카테고리 이름', { exact: false }).fill(category);
  await popup.getByRole('button', { name: '확인', exact: true }).click();
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText(category);
  const chip = faqPage.editor.getByRole('group', {
    name: '새로 추가한 카테고리',
    exact: true,
  });
  await chip
    .getByRole('button', { name: `${category} 카테고리 삭제`, exact: true })
    .click();
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText('분류를 선택해 주세요.');
  await faqPage.editor.getByRole('combobox', { name: /^분류/ }).click();
  await expect(
    page.getByRole('option', { name: category, exact: true })
  ).toHaveCount(0);
  await page.getByRole('option', { name: '가입 · 인증', exact: true }).click();
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText('가입 · 인증');
  await faqPage.editor.getByRole('combobox', { name: /^분류/ }).click();
  await page
    .getByRole('option', { name: '신규 카테고리 추가', exact: true })
    .click();
  await popup.getByLabel('카테고리 이름', { exact: false }).fill(category);
  await popup.getByRole('button', { name: '확인', exact: true }).click();
  const input = {
    category,
    question: `${faqQa.prefix} 새 분류 제목`,
    answer: '신규 카테고리 저장 확인',
  };
  await faqPage.fill(input);
  const createdResponse = faqPage.response('POST');
  await faqPage.editor
    .getByRole('button', { name: 'FAQ 등록', exact: true })
    .click();
  const created = await expectSuccess(await createdResponse);
  await expect(faqPage.editor).not.toBeVisible();
  const located = await faqApi.find(created.faqId);
  expect(located?.faq.faqCategory).toBe(category);
  await expectSuccess(await faqPage.goto());
  await page.getByRole('combobox', { name: '카테고리', exact: true }).click();
  await page.getByRole('option', { name: category, exact: true }).click();
  await expect(faqPage.rows).toHaveCount(1);
  await expect(faqPage.rows.first()).toContainText(input.question);
  await faqPage.openEdit(located!.faq);
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText(category);
  await faqPage.editor
    .getByRole('button', { name: '취소', exact: true })
    .click();
  await faqPage.openCreate();
  await faqPage.editor.getByRole('combobox', { name: /^분류/ }).click();
  await expect(
    page.getByRole('option', { name: category, exact: true })
  ).toBeVisible();
  await page.getByRole('option', { name: category, exact: true }).click();
});

test('[TC-ADM-FAQ-009] 실제 작성·수정·삭제와 취소·재조회·줄바꿈·URL 보존을 확인한다', async ({
  page,
  faqPage,
  faqApi,
  faqQa,
}) => {
  test.setTimeout(90_000);
  await expectSuccess(await faqPage.goto());
  const input: FaqInput = {
    category: '가입 · 인증',
    question: `${faqQa.prefix} 등록`,
    answer:
      '첫 번째 안내입니다.\n\n1️⃣ 설정을 확인해 주세요.\nhttps://example.com/help?from=faq&test=1',
  };
  await faqPage.openCreate();
  await faqPage.fill(input);
  const createResponse = faqPage.response('POST');
  await faqPage.editor
    .getByRole('button', { name: 'FAQ 등록', exact: true })
    .click();
  const createdResponse = await createResponse;
  const created = await expectSuccess(createdResponse);
  expect(createdResponse.request().postDataJSON()).toEqual(input);
  expect(Number.isSafeInteger(created.faqId) && created.faqId > 0).toBe(true);
  await expect(faqPage.editor).not.toBeVisible();
  await expect(
    page.getByText('FAQ가 등록되었습니다.', { exact: true })
  ).toBeVisible();
  const located = await faqApi.find(created.faqId);
  expect(located).not.toBeNull();
  expect(located!.faq).toMatchObject({
    faqId: created.faqId,
    faqCategory: input.category,
    question: input.question,
    answer: input.answer,
  });
  // 서버 정렬 기준을 가정하지 않고 생성한 ID가 있는 페이지로 이동합니다.
  await expectSuccess(await faqPage.goto(located!.page + 1));
  await expect(faqPage.row(created.faqId)).toContainText(input.question);

  await faqPage.openEdit(located!.faq);
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText(input.category);
  await expect(faqPage.editor.getByLabel(/^내용/)).toHaveValue(input.answer);
  await faqPage.editor.getByLabel(/^제목/).fill(`${faqQa.prefix} 취소`);
  await faqPage.editor
    .getByRole('button', { name: '취소', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: '작성을 취소하시겠습니까?', exact: true })
    .getByRole('button', { name: '작성 취소', exact: true })
    .click();
  await expect(faqPage.editor).not.toBeVisible();
  expect((await faqApi.find(created.faqId))?.faq.question).toBe(input.question);

  const updated: FaqInput = {
    category: '시험후기',
    question: `${faqQa.prefix} 수정`,
    answer: '수정한 안내입니다.\n\nhttps://example.com/updated#faq',
  };
  await faqPage.openEdit(located!.faq);
  await faqPage.fill(updated);
  const updateResponse = faqPage.response('PATCH', { faqId: created.faqId });
  await faqPage.editor
    .getByRole('button', { name: '수정사항 저장', exact: true })
    .click();
  const updatedResponse = await updateResponse;
  expect((await expectSuccess(updatedResponse)).faqId).toBe(created.faqId);
  expect(updatedResponse.request().postDataJSON()).toEqual(updated);
  await expect(faqPage.editor).not.toBeVisible();
  const persisted = await faqApi.find(created.faqId);
  expect(persisted?.faq).toMatchObject({
    faqCategory: updated.category,
    question: updated.question,
    answer: updated.answer,
  });
  await expectSuccess(await faqPage.goto(persisted!.page + 1));
  await expect(faqPage.row(created.faqId)).toContainText(updated.question);
  await faqPage.openEdit(persisted!.faq);
  await expect(
    faqPage.editor.getByRole('combobox', { name: /^분류/ })
  ).toHaveText(updated.category);
  await expect(faqPage.editor.getByLabel(/^내용/)).toHaveValue(updated.answer);
  await faqPage.editor
    .getByRole('button', { name: '취소', exact: true })
    .click();
  await expect(faqPage.editor).not.toBeVisible();

  let deleteDialog = await faqPage.openDelete(persisted!.faq);
  await expect(
    deleteDialog.getByText(updated.question, { exact: true })
  ).toBeVisible();
  await deleteDialog.getByRole('button', { name: '취소', exact: true }).click();
  await expect(deleteDialog).not.toBeVisible();
  expect(await faqApi.find(created.faqId)).not.toBeNull();
  deleteDialog = await faqPage.openDelete(persisted!.faq);
  const deleteResponse = faqPage.response('DELETE', { faqId: created.faqId });
  await deleteDialog.getByRole('button', { name: '삭제', exact: true }).click();
  expect((await expectSuccess(await deleteResponse)).faqId).toBe(created.faqId);
  await expect(deleteDialog).not.toBeVisible();
  await expect(
    page.getByText('FAQ가 삭제되었습니다.', { exact: true })
  ).toBeVisible();
  await expect(faqPage.row(created.faqId)).toHaveCount(0);
  expect(await faqApi.find(created.faqId)).toBeNull();
});

test('[TC-ADM-FAQ-012] QA 데이터로 번호형 페이지 이동과 행 펼침·선택 해제를 확인한다', async ({
  page,
  faqPage,
  faqApi,
  faqQa,
}) => {
  test.setTimeout(90_000);
  for (let index = 1; index <= 11; index += 1)
    await faqApi.createForPagination(faqQa.prefix, index);
  const all = await faqApi.all();
  await expectSuccess(await faqPage.goto());
  await expect(faqPage.rows).toHaveCount(10);
  await faqPage.select(all[0].faq);
  await expect(faqPage.detail).toBeVisible();
  await faqPage.pagination
    .getByRole('link', { name: '2', exact: true })
    .click();
  await expect(page).toHaveURL(/page=2/);
  await expect(faqPage.detail).toHaveCount(0);
  await expect(faqPage.rows).toHaveCount(Math.min(10, all.length - 10));
  for (const [index, item] of all.slice(10, 20).entries())
    await expect(faqPage.rows.nth(index).getByRole('cell').first()).toHaveText(
      String(item.faq.faqId)
    );
  await faqPage.select(all[10].faq);
  await expect(
    faqPage.detail.getByRole('region', { name: '내용', exact: true })
  ).toHaveText(all[10].faq.answer);
  await faqPage.pagination
    .getByRole('link', { name: '1', exact: true })
    .click();
  await expect(page).toHaveURL(/page=1/);
  await expect(faqPage.detail).toHaveCount(0);
});

async function expectSuccess(response: Response): Promise<FaqResult> {
  expect(response.status(), `${response.request().method()} FAQ API 상태`).toBe(
    200
  );
  const body = await response.json();
  expect(body.isSuccess).toBe(true);
  return body.result;
}
