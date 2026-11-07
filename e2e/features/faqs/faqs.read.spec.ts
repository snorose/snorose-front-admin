import type { Request, Response } from '@playwright/test';

import { formatDateTimeToMinutes } from '../../../src/shared/utils/date-time-formatter';
import { expect, test } from './faqs.fixture';

test.describe('FAQ 실제 API read QA', () => {
  test('[TC-ADM-FAQ-001] 공통 표의 제목·작성자·날짜와 전체 건수가 실제 API와 일치한다', async ({
    page,
    faqPage,
    faqApi,
  }) => {
    await page.goto('/report/inquiry');
    const response = faqPage.response('GET', { page: 0 });
    await page.getByRole('link', { name: 'FAQ 관리', exact: true }).click();
    await expectSuccess(await response);
    const all = await faqApi.all();
    for (const name of ['ID', '분류', '제목', '작성자', '작성일시', '수정일시'])
      await expect(
        faqPage.table.getByRole('columnheader', { name, exact: true })
      ).toBeVisible();
    await expect(faqPage.rows).toHaveCount(Math.min(all.length, 10));
    for (const [index, { faq }] of all.slice(0, 10).entries()) {
      const cells = faqPage.rows.nth(index).getByRole('cell');
      await expect(cells.nth(0)).toHaveText(String(faq.faqId));
      await expect(cells.nth(1)).toHaveText(faq.faqCategory || '미분류');
      await expect(cells.nth(2)).toHaveText(faq.question);
      await expect(cells.nth(3)).toHaveText(faq.writer || '-');
      await expect(cells.nth(4)).toHaveText(
        formatDateTimeToMinutes(faq.createdAt)
      );
      await expect(cells.nth(5)).toHaveText(
        formatDateTimeToMinutes(faq.updatedAt)
      );
    }
    await expect(page.getByRole('status')).toHaveText(
      new RegExp(`총\\s*${all.length}\\s*건`)
    );
  });

  test('[TC-ADM-FAQ-002] 공통 번호형 페이지네이션으로 10개씩 이동한다', async ({
    page,
    faqPage,
    faqApi,
  }) => {
    await expectSuccess(await faqPage.goto());
    const all = await faqApi.all();
    if (all.length <= 10) {
      await expect(
        faqPage.pagination.getByRole('link', { name: '2', exact: true })
      ).toHaveCount(0);
      return;
    }
    await faqPage.pagination
      .getByRole('link', { name: '2', exact: true })
      .click();
    await expect(page).toHaveURL(/page=2/);
    await expect(faqPage.rows).toHaveCount(Math.min(10, all.length - 10));
    for (const [index, { faq }] of all.slice(10, 20).entries())
      await expect(
        faqPage.rows.nth(index).getByRole('cell').first()
      ).toHaveText(String(faq.faqId));
    await faqPage.pagination
      .getByRole('link', { name: '1', exact: true })
      .click();
    await expect(page).toHaveURL(/page=1/);
    await expect(faqPage.rows.first().getByRole('cell').first()).toHaveText(
      String(all[0].faq.faqId)
    );
  });

  for (const [index, missing] of ['분류', '제목', '내용'].entries()) {
    test(`[TC-ADM-FAQ-00${index + 3}] ${missing} 누락 시 작성 요청을 보내지 않는다`, async ({
      page,
      faqPage,
    }) => {
      await expectSuccess(await faqPage.goto());
      const writes: Request[] = [];
      page.on('request', (request) => {
        if (isFaqWrite(request)) writes.push(request);
      });
      await faqPage.openCreate();
      await faqPage.fill({
        category: missing === '분류' ? '' : '가입 · 인증',
        question: missing === '제목' ? '' : '필수 입력 확인',
        answer: missing === '내용' ? '' : '저장하지 않는 내용',
      });
      await faqPage.editor
        .getByRole('button', { name: 'FAQ 등록', exact: true })
        .click();
      if (missing === '분류')
        await expect(faqPage.editor.getByRole('alert')).toHaveText(
          '분류, 제목, 내용을 모두 입력해 주세요.'
        );
      else {
        const field = faqPage.editor.getByLabel(new RegExp(`^${missing}`));
        await expect(field).toBeFocused();
        expect(
          await field.evaluate(
            (element) =>
              (element as HTMLInputElement | HTMLTextAreaElement).validity
                .valueMissing
          )
        ).toBe(true);
      }
      expect(writes).toHaveLength(0);
    });
  }

  test('[TC-ADM-FAQ-006] 공백만 입력하면 안내를 표시하고 요청을 보내지 않는다', async ({
    page,
    faqPage,
  }) => {
    await expectSuccess(await faqPage.goto());
    const writes: Request[] = [];
    page.on('request', (request) => {
      if (isFaqWrite(request)) writes.push(request);
    });
    await faqPage.openCreate();
    await faqPage.fill({ category: '가입 · 인증', question: ' ', answer: ' ' });
    await faqPage.editor
      .getByRole('button', { name: 'FAQ 등록', exact: true })
      .click();
    await expect(faqPage.editor.getByRole('alert')).toHaveText(
      '분류, 제목, 내용을 모두 입력해 주세요.'
    );
    expect(writes).toHaveLength(0);
  });

  test('[TC-ADM-FAQ-007] 취소 확인에서 계속 작성하면 내용을 유지하고 작성 취소하면 닫힌다', async ({
    page,
    faqPage,
  }) => {
    await expectSuccess(await faqPage.goto());
    const writes: Request[] = [];
    page.on('request', (request) => {
      if (isFaqWrite(request)) writes.push(request);
    });
    await faqPage.openCreate();
    await faqPage.fill({
      category: '가입 · 인증',
      question: '취소 확인',
      answer: '첫 줄\n\nhttps://example.com/help',
    });
    await faqPage.editor
      .getByRole('button', { name: '취소', exact: true })
      .click();
    const confirm = page.getByRole('dialog', {
      name: '작성을 취소하시겠습니까?',
      exact: true,
    });
    await confirm
      .getByRole('button', { name: '계속 작성', exact: true })
      .click();
    await expect(faqPage.editor.getByLabel(/^내용/)).toHaveValue(
      '첫 줄\n\nhttps://example.com/help'
    );
    await faqPage.editor
      .getByRole('button', { name: '취소', exact: true })
      .click();
    await confirm
      .getByRole('button', { name: '작성 취소', exact: true })
      .click();
    await expect(faqPage.editor).not.toBeVisible();
    expect(writes).toHaveLength(0);
  });

  test('[TC-ADM-FAQ-008] 잘못된 페이지를 보정하고 새로고침으로 전체 목록을 재조회한다', async ({
    page,
    faqPage,
    faqApi,
  }) => {
    const response = faqPage.response('GET', { page: 0 });
    await page.goto('/report/faq?page=-5');
    await expectSuccess(await response);
    await expect(page).toHaveURL(/page=1/);
    const refreshed = faqPage.response('GET', { page: 0 });
    await page.getByRole('button', { name: '새로고침', exact: true }).click();
    await expectSuccess(await refreshed);
    const all = await faqApi.all();
    await expect(page.getByRole('status')).toHaveText(
      new RegExp(`총\\s*${all.length}\\s*건`)
    );
  });

  test('[TC-ADM-FAQ-010] 작성자는 회원 메뉴 없이 텍스트로 표시한다', async ({
    faqPage,
    faqApi,
  }) => {
    await expectSuccess(await faqPage.goto());
    const all = await faqApi.all();
    for (const [index, { faq }] of all.slice(0, 10).entries()) {
      const writerCell = faqPage.rows.nth(index).getByRole('cell').nth(3);
      await expect(writerCell).toHaveText(
        faq.writer?.trim() ? faq.writer : '-'
      );
      await expect(writerCell.getByRole('button')).toHaveCount(0);
      await expect(writerCell.getByRole('link')).toHaveCount(0);
    }
  });

  test('[TC-ADM-FAQ-011] 행 바로 아래에 내용을 펼치고 수정 버튼을 표시하며 다시 누르면 접힌다', async ({
    page,
    faqPage,
    faqApi,
  }) => {
    await expectSuccess(await faqPage.goto());
    const first = (await faqApi.all())[0]?.faq;
    test.skip(!first, 'FAQ가 1건 이상 필요합니다.');
    await expect(faqPage.detail).toHaveCount(0);
    await faqPage.select(first!);
    await expect(faqPage.detail).toBeVisible();
    const row = faqPage.row(first!.faqId);
    await expect(
      row
        .locator('xpath=following-sibling::tr[1]')
        .getByRole('region', { name: 'FAQ 내용', exact: true })
    ).toBeVisible();
    await expect(
      faqPage.detail.getByRole('region', { name: '내용', exact: true })
    ).toHaveText(first!.answer);
    await expect(
      faqPage.detail.getByRole('button', { name: 'FAQ 수정', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await row
      .getByRole('button', { name: first!.question, exact: true })
      .click();
    await expect(faqPage.detail).toHaveCount(0);
  });
  test('[TC-ADM-FAQ-013] 작성 중 뒤로 가기를 확인하고 입력 보존 또는 이탈을 선택한다', async ({
    page,
    faqPage,
  }) => {
    await page.goto('/member/info');
    await page.getByRole('link', { name: 'FAQ 관리', exact: true }).click();
    const writes: Request[] = [];
    page.on('request', (request) => {
      if (isFaqWrite(request)) writes.push(request);
    });
    await faqPage.openCreate();
    await faqPage.editor
      .getByRole('textbox', { name: /^제목/ })
      .fill('E2E 저장하지 않은 제목');
    await page.goBack();
    const confirmation = page.getByRole('dialog', {
      name: '작성을 취소하시겠습니까?',
      exact: true,
    });
    await expect(confirmation).toBeVisible();
    await expect(page).toHaveURL(/\/report\/faq$/);
    await confirmation
      .getByRole('button', { name: '계속 작성', exact: true })
      .click();
    await expect(
      faqPage.editor.getByRole('textbox', { name: /^제목/ })
    ).toHaveValue('E2E 저장하지 않은 제목');
    await page.goBack();
    await confirmation
      .getByRole('button', { name: '작성 취소', exact: true })
      .click();
    await expect(page).toHaveURL(/\/member\/info$/);
    await expect(faqPage.editor).toHaveCount(0);
    expect(writes).toHaveLength(0);
  });
});
function isFaqWrite(request: Request) {
  return (
    /^\/v1\/admin\/support\/faq(?:\/\d+)?$/.test(
      new URL(request.url()).pathname
    ) && ['POST', 'PATCH', 'DELETE'].includes(request.method())
  );
}
async function expectSuccess(response: Response) {
  expect(response.status(), `${response.request().method()} API 상태`).toBe(
    200
  );
  expect((await response.json()).isSuccess).toBe(true);
}
