import type { Locator, Page } from '@playwright/test';

import type { Faq, FaqInput } from '../../../src/domains/Faqs/types';

export class FaqManagementPage {
  readonly table: Locator;
  readonly editor: Locator;
  readonly rows: Locator;
  readonly detail: Locator;
  readonly pagination: Locator;

  constructor(readonly page: Page) {
    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody tr[data-faq-id]');
    this.detail = page.getByRole('region', { name: 'FAQ 내용', exact: true });
    this.editor = page.getByRole('dialog', { name: /^FAQ (작성|수정)$/ });
    this.pagination = page.getByRole('navigation', { name: '페이지네이션' });
  }

  async goto(currentPage = 1) {
    const response = this.response('GET', { page: 0 });
    await this.page.goto(`/report/faq?page=${currentPage}`);
    return response;
  }

  row(faqId: number) {
    return this.table.locator('tbody tr').filter({
      has: this.page.locator('td:first-child').filter({
        hasText: new RegExp(`^${faqId}$`),
      }),
    });
  }

  async openCreate() {
    await this.page
      .getByRole('button', { name: 'FAQ 작성하기', exact: true })
      .click();
  }

  async select(faq: Pick<Faq, 'faqId' | 'question'>) {
    const trigger = this.row(faq.faqId).getByRole('button', {
      name: faq.question,
      exact: true,
    });
    if ((await trigger.getAttribute('aria-expanded')) !== 'true')
      await trigger.click();
  }

  async openEdit(faq: Pick<Faq, 'faqId' | 'question'>) {
    await this.select(faq);
    await this.detail
      .getByRole('button', { name: 'FAQ 수정', exact: true })
      .click();
  }

  async openDelete(faq: Pick<Faq, 'faqId' | 'question'>) {
    await this.select(faq);
    await this.detail
      .getByRole('button', { name: 'FAQ 삭제', exact: true })
      .click();
    return this.page.getByRole('dialog', {
      name: 'FAQ를 삭제하시겠습니까?',
      exact: true,
    });
  }

  async fill(input: FaqInput) {
    if (input.category) {
      await this.editor.getByRole('combobox', { name: /^분류/ }).click();
      await this.page
        .getByRole('option', { name: input.category, exact: true })
        .click();
    }
    await this.editor.getByLabel(/^제목/).fill(input.question);
    await this.editor.getByLabel(/^내용/).fill(input.answer);
  }

  response(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    options: { faqId?: number; page?: number } = {}
  ) {
    return this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      const path =
        options.faqId === undefined
          ? '/v1/admin/support/faq'
          : `/v1/admin/support/faq/${options.faqId}`;
      return (
        url.pathname === path &&
        response.request().method() === method &&
        (options.page === undefined ||
          Number(url.searchParams.get('page') ?? 0) === options.page)
      );
    });
  }
}
