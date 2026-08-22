/**
 * 실제 dev 데이터로 상태 변경과 댓글 CRUD TC 6개를 검증합니다.
 * 생성 데이터와 변경 상태는 fixture가 추적하며 테스트 종료 시 복구합니다.
 */
import type { Locator, Page } from '@playwright/test';

import type {
  BaseResponse,
  InquiryComment,
  InquiryStatus,
} from '../../../src/shared/types';
import {
  type LocatedInquiry,
  type RealInquiryFixture,
  expect,
  test,
} from './inquiry-report.fixture';
import {
  type InquiryReportPage,
  inquiryStatusLabel,
} from './inquiry-report.page';

test.describe('문의 및 신고 실제 API write QA', () => {
  test.beforeEach(async ({ realInquiry }) => {
    await realInquiry.cleanupStaleComments(realInquiry.qa.inquiryId);
  });

  test('[TC-ADM-IR-018] 상태 변경 모달에서 취소한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const status = await statusSelect(inquiryReport, located);
    const nextStatus =
      located.item.status === 'PENDING' ? '답변 완료' : '답변 전';

    await status.click();
    await page.getByRole('option', { name: nextStatus, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('상태 변경');
    await expect(dialog).toContainText(located.item.title);
    await expect(dialog).toContainText(nextStatus);
    await dialog.getByRole('button', { name: '취소' }).click();
    await expect(status).toContainText(inquiryStatusLabel(located.item.status));
  });

  test('[TC-ADM-IR-019] 답변 상태를 변경한 뒤 원래 상태로 복구한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const detail = await realInquiry.getDetail(located.item.postId);
    const originalStatus = detail.status;
    const nextStatus: InquiryStatus =
      originalStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    realInquiry.trackStatus(located.item.postId, originalStatus);
    const status = await statusSelect(inquiryReport, located);

    try {
      await inquiryReport.changeStatus(status, inquiryStatusLabel(nextStatus));
      await expect(
        page.getByText('문의 및 신고 상태가 변경되었습니다.')
      ).toBeVisible();
      await expect(status).toContainText(inquiryStatusLabel(nextStatus));

      const panel = await inquiryReport.openDetailAt(
        located.rowIndex,
        located.item.title
      );
      await expect(
        panel.getByRole('combobox', { name: '상태 변경' })
      ).toContainText(inquiryStatusLabel(nextStatus));
    } finally {
      await realInquiry.restoreStatus(located.item.postId, originalStatus);
    }

    await inquiryReport.goto(located.pageNumber);
    await expect(
      inquiryReport
        .rowAt(located.rowIndex)
        .getByRole('combobox', { name: /상태 변경/ })
    ).toContainText(inquiryStatusLabel(originalStatus));
  });

  test('[TC-ADM-IR-022] 댓글 입력 유효성과 등록 결과를 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const panel = await openFixedDetail(inquiryReport, located);
    const input = panel.getByPlaceholder('댓글을 입력하세요.');
    const submit = panel.getByRole('button', { name: '댓글 등록' });

    await expect(submit).toBeDisabled();
    await input.fill('   ');
    await expect(submit).toBeDisabled();
    await input.fill('가'.repeat(255));
    await expect(panel.getByText('255/255')).toBeVisible();
    await expect(submit).toBeEnabled();

    const content = marker('댓글');
    await input.fill(content);
    const responsePromise = mutationResponse(
      page,
      'POST',
      `/v1/posts/${located.item.postId}/comments`
    );
    await submit.click();
    const created = await responseResult<InquiryComment>(responsePromise);
    realInquiry.trackCreatedComment(located.item.postId, created.id);

    await expect(panel.getByText(content, { exact: true })).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('[TC-ADM-IR-023] 대댓글 선택·취소·등록을 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const rootComment = (
      await realInquiry.getComments(located.item.postId)
    ).find((comment) => comment.isVisible);
    test.skip(!rootComment, '공개 최상위 댓글 데이터가 필요합니다.');
    const panel = await openFixedDetail(inquiryReport, located);
    const parent = inquiryReport.commentArticle(panel, rootComment!.content);

    await parent.getByRole('button', { name: '대댓글 작성' }).click();
    await expect(parent).toHaveClass(/bg-slate-50/);
    await panel.getByRole('button', { name: '취소' }).click();
    await expect(panel.getByPlaceholder('댓글을 입력하세요.')).toBeVisible();

    await parent.getByRole('button', { name: '대댓글 작성' }).click();
    const content = marker('대댓글');
    await panel.getByPlaceholder('대댓글을 입력하세요.').fill(content);
    const responsePromise = mutationResponse(
      page,
      'POST',
      `/v1/posts/${located.item.postId}/comments`
    );
    await panel.getByRole('button', { name: '대댓글 등록' }).click();
    const created = await responseResult<InquiryComment>(responsePromise);
    realInquiry.trackCreatedComment(located.item.postId, created.id);
    await expect(panel.getByText(content, { exact: true })).toBeVisible();
  });

  test('[TC-ADM-IR-024] 어드민 댓글 수정을 취소한 뒤 저장한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const panel = await openFixedDetail(inquiryReport, located);
    const createdComment = await createTrackedUiComment(
      page,
      panel,
      inquiryReport,
      realInquiry,
      located.item.postId,
      '수정 대상'
    );
    const originalContent = createdComment.content;
    let article = createdComment.article;

    await inquiryReport.openCommentMenu(article, '수정');
    await article.getByRole('textbox').fill('취소할 댓글 수정');
    await article.getByRole('button', { name: '취소' }).click();
    await expect(article).toContainText(originalContent);

    await inquiryReport.openCommentMenu(article, '수정');
    const editedContent = marker('수정 완료');
    await article.getByRole('textbox').fill(editedContent);
    const responsePromise = mutationResponse(
      page,
      'PATCH',
      `/v1/posts/${located.item.postId}/comments/${createdComment.id}`
    );
    await article.getByRole('button', { name: '저장' }).click();
    await expectMutationSuccess(responsePromise);
    await expect(panel.getByText(editedContent, { exact: true })).toBeVisible();
    article = inquiryReport.commentArticle(panel, editedContent);
    await expect(article).toContainText(editedContent);
    await expect(article.getByText('수정됨', { exact: true })).toBeVisible();
  });

  test('[TC-ADM-IR-025] 어드민 댓글을 삭제 후 즉시 제외한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const located = await fixedInquiry(realInquiry);
    const panel = await openFixedDetail(inquiryReport, located);
    const createdComment = await createTrackedUiComment(
      page,
      panel,
      inquiryReport,
      realInquiry,
      located.item.postId,
      '삭제 대상'
    );
    const content = createdComment.content;
    const article = createdComment.article;
    const responsePromise = mutationResponse(
      page,
      'DELETE',
      `/v1/posts/${located.item.postId}/comments/${createdComment.id}`
    );
    await inquiryReport.openCommentMenu(article, '삭제');
    await expectMutationSuccess(responsePromise);
    realInquiry.markCommentDeleted(createdComment.id);

    await expect(panel.getByText(content, { exact: true })).toHaveCount(0);
    await expect(panel).not.toContainText('삭제된 댓글');
  });
});

async function fixedInquiry(data: RealInquiryFixture) {
  const located = await data.findInquiry(data.qa.inquiryId);
  expect(located.item.group, 'E2E_QA_INQUIRY_ID는 문의여야 합니다.').toBe(
    'INQUIRY'
  );
  return located;
}

async function statusSelect(page: InquiryReportPage, data: LocatedInquiry) {
  await page.goto(data.pageNumber);
  return page.rowAt(data.rowIndex).getByRole('combobox', { name: /상태 변경/ });
}

async function openFixedDetail(
  page: InquiryReportPage,
  data: LocatedInquiry
): Promise<Locator> {
  const panel = await page.openDetailAt(
    data.rowIndex,
    data.item.title,
    data.pageNumber
  );
  await expect(panel).toContainText(data.item.title);
  return panel;
}

async function createTrackedUiComment(
  page: Page,
  panel: Locator,
  inquiryReport: InquiryReportPage,
  data: RealInquiryFixture,
  postId: number,
  label: string
) {
  const content = marker(label);
  await panel.getByPlaceholder('댓글을 입력하세요.').fill(content);
  const responsePromise = mutationResponse(
    page,
    'POST',
    `/v1/posts/${postId}/comments`
  );
  await panel.getByRole('button', { name: '댓글 등록' }).click();
  const created = await responseResult<InquiryComment>(responsePromise);
  data.trackCreatedComment(postId, created.id);
  await expect(panel.getByText(content, { exact: true })).toBeVisible();
  const article = await inquiryReport.stableCommentArticle(panel, content);
  return { id: created.id, content, article };
}

function marker(label: string) {
  return `[E2E:${Date.now()}-${test.info().workerIndex}] ${label}`;
}

function mutationResponse(page: Page, method: string, path: string) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === method &&
      new URL(response.url()).pathname === path
  );
}

async function responseResult<T>(
  responsePromise: ReturnType<Page['waitForResponse']>
) {
  const response = await responsePromise;
  expect(response.ok(), `${response.request().method()} API 응답`).toBe(true);
  return ((await response.json()) as BaseResponse<T>).result;
}

async function expectMutationSuccess(
  responsePromise: ReturnType<Page['waitForResponse']>
) {
  const response = await responsePromise;
  expect(response.ok(), `${response.request().method()} API 응답`).toBe(true);
}
