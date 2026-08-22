/**
 * 문의·신고 화면의 locator와 반복 사용자 동작을 모은 Page Object입니다.
 * 검증 조건은 spec에 남기고 화면 조작만 이곳에서 재사용합니다.
 */
import type { Locator, Page } from '@playwright/test';

export class InquiryReportPage {
  constructor(readonly page: Page) {}

  get table() {
    return this.page.getByRole('table');
  }

  get dataRows() {
    return this.table.locator('tbody tr');
  }

  get filterTriggers() {
    return this.page.locator('[data-slot="select-trigger"]').filter({
      hasNot: this.page.locator('[aria-label$="상태 변경"]'),
    });
  }

  get detailPanel() {
    return this.page
      .getByRole('button', { name: '닫기' })
      .locator('xpath=ancestor::div[contains(@class,"overflow-y-auto")][1]');
  }

  async goto(pageNumber = 1) {
    await this.page.goto(`/report/inquiry?page=${pageNumber}`);
  }

  async enterFromSidebar() {
    await this.page.goto('/member/info');
    await this.page.getByRole('button', { name: '문의 및 신고' }).click();
    await this.page.getByRole('link', { name: '문의 및 신고' }).click();
  }

  rowAt(index: number) {
    return this.dataRows.nth(index);
  }

  async selectFilter(index: number, option: string) {
    await this.filterTriggers.nth(index).click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  async clearFilter(index: number) {
    await this.filterTriggers
      .nth(index)
      .locator('..')
      .locator(':scope > button')
      .nth(1)
      .click();
  }

  async openDetailAt(
    rowIndex: number,
    expectedTitle: string,
    pageNumber?: number
  ) {
    if (pageNumber !== undefined) await this.goto(pageNumber);
    const row = this.rowAt(rowIndex);
    const title = row.getByText(expectedTitle, { exact: true });
    await title.waitFor();
    await title.click();
    return this.detailPanel;
  }

  async closeDetail() {
    await this.page.getByRole('button', { name: '닫기' }).click();
  }

  async openPopup(link: Locator) {
    const popupPromise = this.page.waitForEvent('popup');
    await link.click();
    return await popupPromise;
  }

  async changeStatus(trigger: Locator, nextStatus: string) {
    await trigger.click();
    await this.page
      .getByRole('option', { name: nextStatus, exact: true })
      .click();
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: '변경' })
      .click();
  }

  commentArticle(panel: Locator, content: string) {
    return panel
      .getByText(content, { exact: true })
      .locator('xpath=ancestor::article[1]');
  }

  async stableCommentArticle(panel: Locator, content: string) {
    await panel.getByText(content, { exact: true }).waitFor();
    const articles = panel.locator('article');
    const texts = await articles.allTextContents();
    const index = texts.findIndex((text) => text.includes(content));

    if (index < 0) throw new Error(`댓글을 찾을 수 없습니다: ${content}`);
    return articles.nth(index);
  }

  async openCommentMenu(article: Locator, item: '수정' | '삭제') {
    await article.getByRole('button', { name: '댓글 더보기' }).click();
    await this.page.getByRole('menuitem', { name: item }).click();
  }
}

export function inquiryStatusLabel(status: 'PENDING' | 'COMPLETED' | 'HOLD') {
  if (status === 'PENDING') return '답변 전';
  if (status === 'COMPLETED') return '답변 완료';
  return '보류';
}
