import { isWithdrawnInquiryAuthor } from '../../../src/domains/InquiryReport/utils/inquiryAuthorUtils';
import type {
  AdminInquiryListResult,
  BaseResponse,
} from '../../../src/shared/types';
import { expect, test } from './inquiry-report.fixture';

test('[TC-ADM-IR-029] 검색 패널 안의 필터를 즉시 적용하고 학번·아이디·내용을 searchKey로 조회한다', async ({
  page,
  inquiryReport,
  inquiryReportApi,
}) => {
  const inquiries = await inquiryReportApi.getAllInquiries();
  const index = inquiries.findIndex(
    (item) =>
      item.encryptedUserId?.trim() &&
      !isWithdrawnInquiryAuthor(item) &&
      ['PENDING', 'COMPLETED'].includes(item.status)
  );
  expect(
    index,
    '검색을 확인할 정상 작성자의 문의·신고가 필요합니다.'
  ).toBeGreaterThanOrEqual(0);
  const item = inquiries[index];
  const detail = await inquiryReportApi.getDetail(item.postId);
  await inquiryReport.goto(Math.floor(index / 10) + 1);
  const row = inquiryReport.rowAt(index % 10);
  await expect(row).toContainText(String(item.postId));
  await row
    .getByRole('cell')
    .nth(3)
    .getByRole('button', { name: item.userLoginId, exact: true })
    .click();
  const memberResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname.startsWith('/v1/admin/users/')
  );
  await page.getByRole('menuitem', { name: '회원 정보', exact: true }).click();
  const response = await memberResponse;
  expect(response.status()).toBe(200);
  const member = (await response.json()).result as { studentNumber: string };
  await page
    .getByRole('dialog', { name: '회원 정보', exact: true })
    .getByRole('button', { name: '닫기', exact: true })
    .click();
  const form = page.getByRole('form', {
    name: '문의 및 신고 검색',
    exact: true,
  });
  await expect(form.getByRole('combobox')).toHaveCount(3);
  const input = form.getByLabel('통합 검색', { exact: true });
  await input.fill('미적용 검색어');
  const groupResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.pathname === '/v1/admin/inquiries' &&
      url.searchParams.get('group') === item.group &&
      url.searchParams.get('page') === '0'
    );
  });
  await form.getByRole('combobox', { name: '유형', exact: true }).click();
  await page
    .getByRole('option', {
      name: { INQUIRY: '문의', REPORT: '신고', ETC: '기타' }[item.group],
      exact: true,
    })
    .click();
  const filteredResponse = await groupResponse;
  expect(filteredResponse.status()).toBe(200);
  expect(new URL(filteredResponse.url()).searchParams.has('searchKey')).toBe(
    false
  );
  await expect(input).toHaveValue('미적용 검색어');
  await form.getByRole('combobox', { name: '답변여부', exact: true }).click();
  await page
    .getByRole('option', {
      name: item.status === 'COMPLETED' ? '답변 완료' : '답변 전',
      exact: true,
    })
    .click();
  const keys = [
    ...new Set([
      member.studentNumber,
      item.userLoginId,
      detail.content.trim().slice(0, 30),
    ]),
  ];
  for (const key of keys) {
    expect(key).toBeTruthy();
    await input.fill(key);
    const searchResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname === '/v1/admin/inquiries' &&
        url.searchParams.get('searchKey') === key &&
        url.searchParams.get('page') === '0'
      );
    });
    await form.getByRole('button', { name: '검색', exact: true }).click();
    const result = await searchResponse;
    expect(result.status()).toBe(200);
    expect(new URL(result.url()).searchParams.has('status')).toBe(false);
    await expect(
      inquiryReport.table
        .getByRole('cell', { name: item.title, exact: true })
        .first()
    ).toBeVisible();
    await expect(input).toHaveValue(key);
  }
  const missing = `__no_matching_inquiry_${Date.now()}__`;
  await input.fill(missing);
  await form.getByRole('button', { name: '검색', exact: true }).click();
  await expect(
    page.getByText('필터 조건에 해당하는 항목이 없습니다.', { exact: true })
  ).toBeVisible();
  await form
    .getByRole('button', { name: '검색 조건 초기화', exact: true })
    .click();
  await expect(input).toHaveValue('');
  await expect(
    form.getByRole('combobox', { name: '유형', exact: true })
  ).toHaveText('유형 전체');
  await expect(
    form.getByRole('combobox', { name: '답변여부', exact: true })
  ).toHaveText('답변 전체');
  await expect(inquiryReport.dataRows.first()).toContainText(
    String(inquiries[0].postId)
  );
});

test('[TC-ADM-IR-027] 목록 작성자의 공통 메뉴에서 암호화 ID로 실제 회원 정보를 조회한다', async ({
  page,
  inquiryReport,
  inquiryReportApi,
}) => {
  const inquiries = await inquiryReportApi.getAllInquiries();
  const index = inquiries.findIndex(
    (item) => item.encryptedUserId?.trim() && !isWithdrawnInquiryAuthor(item)
  );
  expect(
    index,
    '회원 조회 가능한 암호화 ID를 가진 작성자가 필요합니다.'
  ).toBeGreaterThanOrEqual(0);
  const item = inquiries[index];
  const listResponses: Promise<BaseResponse<AdminInquiryListResult>>[] = [];
  page.on('response', (response) => {
    if (
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname === '/v1/admin/inquiries'
    ) {
      listResponses.push(response.json());
    }
  });
  await inquiryReport.goto(Math.floor(index / 10) + 1);
  const row = inquiryReport.rowAt(index % 10);
  await expect(row).toContainText(String(item.postId));
  // 암호화 ID는 응답마다 달라질 수 있어 화면이 받은 목록의 ID를 검증합니다.
  const loaded = await Promise.all(listResponses);
  const displayedItem = loaded
    .flatMap((body) => body.result.data)
    .find((entry) => entry.postId === item.postId);
  expect(displayedItem).toBeDefined();
  await row
    .getByRole('button', { name: item.userLoginId || '-', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: '문의·신고 상세 닫기', exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole('menuitem', { name: '작성 게시글', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: '제재하기', exact: true })
  ).toBeVisible();
  const memberResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname.startsWith('/v1/admin/users/')
  );
  await page.getByRole('menuitem', { name: '회원 정보', exact: true }).click();
  const response = await memberResponse;
  expect(new URL(response.url()).pathname).toBe(
    new URL(`/v1/admin/users/${displayedItem!.encryptedUserId}`, response.url())
      .pathname
  );
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.isSuccess).toBe(true);
  expect(body.result.loginId).toBe(item.userLoginId);
  const modal = page.getByRole('dialog', { name: '회원 정보', exact: true });
  await expect(modal).toBeVisible();
  await expect(
    modal.getByText(body.result.loginId, { exact: true })
  ).toBeVisible();
  await modal
    .getByRole('button', { name: '유저 상세 페이지로 이동', exact: true })
    .click();
  await expect(page).toHaveURL(
    new URL(
      `/member/info/${displayedItem!.encryptedUserId}`,
      page.url()
    ).toString()
  );
});

test('[TC-ADM-IR-028] 담당자를 작성일 다음에 표시하고 일반 화면과 상세 선택 상태에서 표가 가로로 넘치지 않는다', async ({
  page,
  inquiryReport,
  inquiryReportApi,
}) => {
  const inquiries = await inquiryReportApi.getAllInquiries();
  expect(
    inquiries.length,
    '목록 레이아웃을 확인할 문의·신고가 필요합니다.'
  ).toBeGreaterThan(0);
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await inquiryReport.goto();
    const table = inquiryReport.table;
    await expect(table.getByRole('columnheader')).toHaveText([
      'postId',
      '유형',
      '카테고리',
      '작성자 아이디',
      '답변여부',
      '제목',
      '작성일',
      '담당자',
    ]);
    const rows = inquiryReport.dataRows;
    await expect(rows).toHaveCount(Math.min(inquiries.length, 10));
    for (const [index, item] of inquiries.slice(0, 10).entries()) {
      const manager = rows.nth(index).getByRole('cell').nth(7);
      await expect(manager).toHaveText(
        item.manager?.trim() ? item.manager : '-'
      );
      await expect(manager.getByRole('button')).toHaveCount(
        item.encryptedAdminId?.trim() ? 1 : 0
      );
    }
    const container = table.locator('..');
    await expect
      .poll(() =>
        container.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)
      )
      .toBe(true);
    await rows
      .first()
      .getByRole('cell')
      .nth(0)
      .getByText(String(inquiries[0].postId), { exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`postId=${inquiries[0].postId}`));
    await expect(
      table.getByRole('columnheader', { name: '담당자', exact: true })
    ).toBeVisible();
    await expect(
      table.getByRole('columnheader', { name: '제목', exact: true })
    ).toBeVisible();
    await expect
      .poll(() =>
        container.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)
      )
      .toBe(true);
  }
});
