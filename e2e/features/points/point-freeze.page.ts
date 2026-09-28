import type { Locator, Page } from '@playwright/test';

export class PointFreezePage {
  readonly form: Locator;
  constructor(readonly page: Page) {
    this.form = page.locator('article').filter({
      has: page.getByRole('heading', {
        name: '미지급 일정 생성',
        exact: true,
      }),
    });
  }

  async goto() {
    await this.page.goto('/point/freeze');
  }
  row(title: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: title, exact: true }),
    });
  }

  async selectDate(kind: '시작' | '종료', day: number) {
    await this.form
      .getByRole('button', { name: `${kind} 날짜 선택`, exact: true })
      .click();
    const calendar = this.page.locator(
      '[data-slot="popover-content"][data-state="open"] [data-slot="calendar"]'
    );
    await calendar
      .getByRole('button', { name: 'Go to the Next Month', exact: true })
      .click();
    await calendar
      .locator('button[data-day]')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .click();
  }

  async setTime(scope: Locator, index: 0 | 1, hour: string, minute: string) {
    await scope
      .getByRole('combobox')
      .nth(index * 2)
      .click();
    await this.page
      .getByRole('option', { name: `${hour}시`, exact: true })
      .click();
    await scope
      .getByRole('combobox')
      .nth(index * 2 + 1)
      .click();
    await this.page
      .getByRole('option', { name: `${minute}분`, exact: true })
      .click();
  }

  async fill(title: string, startDay = 10, endDay = 11) {
    await this.form.getByLabel('일정 제목').fill(title);
    await this.selectDate('시작', startDay);
    await this.selectDate('종료', endDay);
    await this.setTime(this.form, 0, '12', '15');
    await this.setTime(this.form, 1, '13', '30');
  }

  async menu(title: string, action: '수정' | '삭제') {
    await this.row(title)
      .getByRole('button', { name: 'Open menu', exact: true })
      .click();
    await this.page
      .getByRole('menuitem', { name: action, exact: true })
      .click();
  }

  response(method: 'GET' | 'POST' | 'PATCH' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        /^\/v1\/admin\/points\/point-freeze(?:\/\d+)?$/.test(
          new URL(response.url()).pathname
        ) && response.request().method() === method
    );
  }
}
