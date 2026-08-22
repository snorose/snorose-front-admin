/**
 * 실제 dev 데이터로 목록·필터·상세·댓글 표시·레이아웃 TC 20개를 검증합니다.
 * 서버 데이터를 변경하지 않는 조회 시나리오만 포함합니다.
 */
import type { Locator } from '@playwright/test';

import type {
  InquiryComment,
  InquiryDetail,
  InquiryListItem,
  InquiryStatus,
  InquirySubGroup,
} from '../../../src/shared/types';
import {
  type LocatedInquiry,
  type RealInquiryFixture,
  expect,
  flattenComments,
  test,
} from './inquiry-report.fixture';
import type { InquiryReportPage } from './inquiry-report.page';

const REQUIRED_COLUMNS = [
  '번호',
  '분류',
  '중분류',
  '아이디',
  '답변여부',
  '제목',
  '작성일',
];

const GROUP_LABEL = { INQUIRY: '문의', REPORT: '신고', ETC: '기타' } as const;
const SUBGROUP_LABEL: Record<InquirySubGroup, string> = {
  EXAM_REVIEW_INQUIRY: '족보 관련 문의',
  EVENT_INQUIRY: '이벤트 관련 문의',
  NOTICE_INQUIRY: '공지 관련 문의',
  ETC_INQUIRY: '기타',
  POST_REPORT: '게시글 신고',
  EXAM_REVIEW_REPORT: '족보 신고',
  COMMENT_REPORT: '댓글 신고',
  USER_REPORT: '이용자 신고',
};
const STATUS_LABEL: Record<InquiryStatus, string> = {
  PENDING: '답변 전',
  COMPLETED: '답변 완료',
  HOLD: '보류',
};

test.describe('문의 및 신고 실제 API read QA', () => {
  test.beforeEach(async ({ inquiryReport }) => {
    await inquiryReport.goto();
    await expect(inquiryReport.table).toBeVisible();
  });

  test('[TC-ADM-IR-001] 사이드바에서 문의 및 신고 목록에 진입한다', async ({
    page,
    inquiryReport,
  }) => {
    await inquiryReport.enterFromSidebar();
    await expect(page).toHaveURL(/\/report\/inquiry$/);
    await expect(
      page.getByRole('heading', { level: 1, name: '문의 및 신고' })
    ).toBeVisible();
    await expect(inquiryReport.table).toBeVisible();
  });

  test('[TC-ADM-IR-002] 실제 목록의 필수 정보를 표시한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const first = requireValue(
      (await realInquiry.getAllInquiries())[0],
      '문의 및 신고 데이터가 1건 이상 필요합니다.'
    );

    for (const column of REQUIRED_COLUMNS) {
      await expect(
        inquiryReport.table.getByRole('columnheader', {
          name: column,
          exact: true,
        })
      ).toBeVisible();
    }
    const row = inquiryReport.dataRows.first();
    await expect(row).toContainText('1');
    await expect(row).toContainText(GROUP_LABEL[first.group]);
    await expect(row).toContainText(SUBGROUP_LABEL[first.subGroup]);
    await expect(row).toContainText(STATUS_LABEL[first.status]);
    await expect(row).toContainText(first.title);
  });

  test('[TC-ADM-IR-003] 분류·중분류·탈퇴 사용자를 칩으로 표시한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    const inquiry = requireValue(
      inquiries.find((item) => item.group === 'INQUIRY'),
      '문의 데이터가 필요합니다.'
    );
    const report = requireValue(
      inquiries.find((item) => item.group === 'REPORT'),
      '신고 데이터가 필요합니다.'
    );
    const withdrawn = requireValue(
      inquiries.find(isWithdrawnListItem),
      '탈퇴 작성자 데이터가 필요합니다.'
    );

    const inquiryRow = await rowForItem(inquiryReport, realInquiry, inquiry);
    await expect(inquiryRow.getByText('문의', { exact: true })).toHaveClass(
      /bg-blue-100/
    );
    await expect(
      inquiryRow.getByText(SUBGROUP_LABEL[inquiry.subGroup], { exact: true })
    ).toHaveClass(/bg-blue-50/);

    const reportRow = await rowForItem(inquiryReport, realInquiry, report);
    await expect(reportRow.getByText('신고', { exact: true })).toHaveClass(
      /bg-red-100/
    );
    await expect(
      reportRow.getByText(SUBGROUP_LABEL[report.subGroup], { exact: true })
    ).toHaveClass(/bg-red-50/);

    const withdrawnRow = await rowForItem(
      inquiryReport,
      realInquiry,
      withdrawn
    );
    await expect(withdrawnRow.getByText('탈퇴', { exact: true })).toHaveClass(
      /bg-gray-900/
    );
  });

  test('[TC-ADM-IR-004] 문의·신고 분류 필터와 1페이지 이동을 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    await inquiryReport.goto(2);
    await inquiryReport.selectFilter(0, '문의');
    await expect(page).toHaveURL(/page=1/);
    await expect(inquiryReport.dataRows).toHaveCount(
      Math.min(10, inquiries.filter((item) => item.group === 'INQUIRY').length)
    );
    await expect(
      inquiryReport.table.getByText('신고', { exact: true })
    ).toHaveCount(0);

    await inquiryReport.selectFilter(0, '신고');
    await expect(inquiryReport.dataRows).toHaveCount(
      Math.min(10, inquiries.filter((item) => item.group === 'REPORT').length)
    );
    await expect(
      inquiryReport.table.getByText('문의', { exact: true })
    ).toHaveCount(0);
  });

  test('[TC-ADM-IR-005] 분류별 중분류를 일반 텍스트로 필터링한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    const inquirySubGroup = requireValue(
      inquiries.find((item) => item.group === 'INQUIRY')?.subGroup,
      '문의 중분류 데이터가 필요합니다.'
    );
    const reportSubGroup = requireValue(
      inquiries.find((item) => item.group === 'REPORT')?.subGroup,
      '신고 중분류 데이터가 필요합니다.'
    );

    await inquiryReport.selectFilter(0, '문의');
    await inquiryReport.filterTriggers.nth(1).click();
    const inquiryOption = page.getByRole('option', {
      name: SUBGROUP_LABEL[inquirySubGroup],
    });
    await expect(inquiryOption.locator('[data-slot="badge"]')).toHaveCount(0);
    await inquiryOption.click();
    await expect(inquiryReport.dataRows).toHaveCount(
      Math.min(
        10,
        inquiries.filter((item) => item.subGroup === inquirySubGroup).length
      )
    );

    await inquiryReport.selectFilter(0, '신고');
    await expect(inquiryReport.filterTriggers.nth(1)).toContainText('중분류');
    await inquiryReport.selectFilter(1, SUBGROUP_LABEL[reportSubGroup]);
    await expect(inquiryReport.dataRows).toHaveCount(
      Math.min(
        10,
        inquiries.filter((item) => item.subGroup === reportSubGroup).length
      )
    );
  });

  test('[TC-ADM-IR-006] 대분류 변경과 X 버튼으로 필터를 초기화한다', async ({
    inquiryReport,
  }) => {
    await inquiryReport.selectFilter(0, '문의');
    await inquiryReport.selectFilter(1, '이벤트 관련 문의');
    await inquiryReport.selectFilter(0, '신고');
    await expect(inquiryReport.filterTriggers.nth(1)).toContainText('중분류');

    await inquiryReport.selectFilter(1, '게시글 신고');
    await inquiryReport.selectFilter(2, '답변 완료');
    await inquiryReport.clearFilter(2);
    await expect(inquiryReport.filterTriggers.nth(2)).toContainText('답변여부');
    await inquiryReport.clearFilter(1);
    await expect(inquiryReport.filterTriggers.nth(1)).toContainText('중분류');
    await inquiryReport.clearFilter(0);
    await expect(inquiryReport.filterTriggers.nth(0)).toContainText('분류');
    await expect(inquiryReport.filterTriggers.nth(1)).toBeDisabled();
  });

  test('[TC-ADM-IR-007] 답변 전·답변 완료 필터를 적용한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    for (const status of ['PENDING', 'COMPLETED'] as const) {
      await inquiryReport.selectFilter(2, STATUS_LABEL[status]);
      await expect(inquiryReport.dataRows).toHaveCount(
        Math.min(10, inquiries.filter((item) => item.status === status).length)
      );
      const otherStatus = status === 'PENDING' ? 'COMPLETED' : 'PENDING';
      await expect(
        inquiryReport.table.getByText(STATUS_LABEL[otherStatus], {
          exact: true,
        })
      ).toHaveCount(0);
    }
  });

  test('[TC-ADM-IR-008] 복합 필터와 빈 결과를 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    const filterCase = findEmptyAndFilledReportFilter(inquiries);
    test.skip(
      !filterCase,
      '빈 결과와 정상 결과를 함께 만드는 신고 조합이 필요합니다.'
    );

    await inquiryReport.selectFilter(0, '신고');
    await inquiryReport.selectFilter(1, SUBGROUP_LABEL[filterCase!.subGroup]);
    await inquiryReport.selectFilter(2, STATUS_LABEL[filterCase!.emptyStatus]);
    await expect(
      page.getByText('필터 조건에 해당하는 항목이 없습니다.')
    ).toBeVisible();

    await inquiryReport.selectFilter(2, STATUS_LABEL[filterCase!.filledStatus]);
    await expect(inquiryReport.dataRows.first()).toBeVisible();
  });

  test('[TC-ADM-IR-009] 10건 단위 페이지네이션을 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const inquiries = await realInquiry.getAllInquiries();
    test.skip(inquiries.length < 11, '페이지네이션 확인용 데이터 11건 필요');
    await expect(inquiryReport.dataRows).toHaveCount(10);
    await page
      .getByRole('navigation', { name: 'pagination' })
      .getByRole('link', { name: '2', exact: true })
      .click();
    await expect(page).toHaveURL(/page=2/);
    await expect(inquiryReport.dataRows).toHaveCount(
      Math.min(10, inquiries.length - 10)
    );
  });

  test('[TC-ADM-IR-010] 행 선택과 상세 필수 정보를 확인한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const detailCase = await findDetailCase(realInquiry, () => true);
    const panel = await openDetailCase(inquiryReport, detailCase);
    await expect(panel).toContainText(detailCase.detail.title);
    for (const label of [
      '분류',
      '중분류',
      '작성자',
      '작성일',
      '답변',
      '내용',
    ]) {
      await expect(panel).toContainText(label);
    }
    await expect(inquiryReport.rowAt(detailCase.rowIndex)).toHaveClass(
      /bg-blue-50/
    );
  });

  test('[TC-ADM-IR-011] 수정된 글에 수정됨 칩과 수정일을 표시한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const detailCase = await findDetailCase(
      realInquiry,
      (item, detail) => item.isEdited && detail.isEdited
    );
    const panel = await openDetailCase(inquiryReport, detailCase);
    await expect(panel.getByText('수정됨', { exact: true })).toHaveClass(
      /bg-gray-100/
    );
    await expect(panel).toContainText('수정일');
  });

  test('[TC-ADM-IR-012] 신고 사유와 대상을 표시한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const detailCase = await fixedDetailCase(
      realInquiry,
      realInquiry.qa.reportId,
      'REPORT'
    );
    const panel = await openDetailCase(inquiryReport, detailCase);
    await expect(panel).toContainText('신고 사유');
    await expect(panel).toContainText('신고 대상');
    await expect(panel.getByText('신고', { exact: true })).toHaveClass(
      /bg-red-100/
    );
  });

  test('[TC-ADM-IR-013] 작성자 복사와 탈퇴 작성자를 구분한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const normalCase = await findDetailCase(
      realInquiry,
      (item, detail) => !isWithdrawnListItem(item) && !detail.isWriterWithdrawn
    );
    let panel = await openDetailCase(inquiryReport, normalCase);
    await panel.getByRole('button', { name: '작성자 아이디 복사' }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(normalCase.detail.userLoginId);

    await inquiryReport.closeDetail();
    const withdrawnCase = await findDetailCase(realInquiry, (item) =>
      isWithdrawnListItem(item)
    );
    panel = await openDetailCase(inquiryReport, withdrawnCase);
    await expect(panel.getByText('탈퇴', { exact: true })).toHaveClass(
      /bg-gray-900/
    );
    await expect(
      panel.getByRole('button', { name: '작성자 아이디 복사' })
    ).toHaveCount(0);
  });

  test('[TC-ADM-IR-014] 문의글과 신고글 원문을 새 탭으로 연다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    for (const [group, postId] of [
      ['INQUIRY', realInquiry.qa.inquiryId],
      ['REPORT', realInquiry.qa.reportId],
    ] as const) {
      const detailCase = await fixedDetailCase(realInquiry, postId, group);
      const panel = await openDetailCase(inquiryReport, detailCase);
      const label = group === 'REPORT' ? '신고글 바로가기' : '문의글 바로가기';
      const path = group === 'REPORT' ? 'report' : 'inquiry';
      await expectNewTab(
        inquiryReport,
        panel.getByRole('link', { name: label }),
        new RegExp(`/${path}/${detailCase.detail.inquiryId}$`)
      );
      await inquiryReport.closeDetail();
    }
  });

  test('[TC-ADM-IR-015] 신고 유형별 대상글 링크를 확인한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    test.setTimeout(60_000);
    const inquiries = await realInquiry.getAllInquiries();
    for (const subGroup of [
      'POST_REPORT',
      'EXAM_REVIEW_REPORT',
      'COMMENT_REPORT',
    ] as const) {
      const item = requireValue(
        inquiries.find((entry) => entry.subGroup === subGroup),
        `${SUBGROUP_LABEL[subGroup]} 데이터가 필요합니다.`
      );
      const detail = await realInquiry.tryGetDetail(item.postId);
      if (!detail) {
        expect
          .soft(detail, `${SUBGROUP_LABEL[subGroup]} 상세 API`)
          .not.toBeNull();
        continue;
      }
      const located = await realInquiry.findInquiry(item.postId);
      const panel = await inquiryReport.openDetailAt(
        located.rowIndex,
        item.title,
        located.pageNumber
      );
      const targetLink = panel.getByRole('link', {
        name: '신고 대상 글 바로가기',
      });
      await expect
        .soft(targetLink, `${SUBGROUP_LABEL[subGroup]} 대상글 링크`)
        .toBeVisible();
      if (await targetLink.isVisible()) {
        await expect.soft(targetLink).toHaveAttribute('target', '_blank');
        await expect.soft(targetLink).toHaveAttribute('href', /\/board\//);
      }
      await inquiryReport.closeDetail();
    }

    const userReport = requireValue(
      inquiries.find((entry) => entry.subGroup === 'USER_REPORT'),
      '이용자 신고 데이터가 필요합니다.'
    );
    const locatedUserReport = await realInquiry.findInquiry(userReport.postId);
    const panel = await inquiryReport.openDetailAt(
      locatedUserReport.rowIndex,
      userReport.title,
      locatedUserReport.pageNumber
    );
    await expect(
      panel.getByRole('link', { name: '신고 대상 글 바로가기' })
    ).toHaveCount(0);
  });

  test('[TC-ADM-IR-016] 첨부 이미지·파일을 표시하고 새 탭으로 연다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const detailCase = await findDetailCase(
      realInquiry,
      (_item, detail) =>
        detail.attachments.length > 0 &&
        detail.attachments.every((attachment) => Boolean(attachment.url))
    );
    const panel = await openDetailCase(inquiryReport, detailCase);

    for (const attachment of detailCase.detail.attachments) {
      if (attachment.type === 'PHOTO') {
        await expect(
          panel.getByRole('img', { name: attachment.fileName })
        ).toBeVisible();
      }
      const attachmentLink = panel.getByRole('link', {
        name:
          attachment.type === 'PHOTO'
            ? `${attachment.fileName} 새 창에서 보기`
            : attachment.fileName,
      });
      await expect(attachmentLink).toBeVisible();
      await expect(attachmentLink).toHaveAttribute('href', attachment.url);
      await expect(attachmentLink).toHaveAttribute('target', '_blank');
    }
  });

  test('[TC-ADM-IR-017] 상세를 전환하고 닫는다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const cases = await findDetailCases(realInquiry, () => true, 2);
    await openDetailCase(inquiryReport, cases[0]);
    await inquiryReport.closeDetail();
    const panel = await openDetailCase(inquiryReport, cases[1]);
    await expect(panel).toContainText(cases[1].detail.title);
    await inquiryReport.closeDetail();
    await expect(page.getByRole('button', { name: '닫기' })).toHaveCount(0);
  });

  test('[TC-ADM-IR-020] 숨김 댓글을 제외하고 공개 댓글과 건수를 표시한다', async ({
    inquiryReport,
    realInquiry,
  }) => {
    const commentCase = await findCommentCase(
      realInquiry,
      (comments) =>
        comments.some((comment) => comment.isVisible) &&
        comments.some((comment) => !comment.isVisible)
    );
    const panel = await openDetailCase(inquiryReport, commentCase);
    const comments = flattenComments(commentCase.comments);
    const visible = comments.filter((comment) => comment.isVisible);
    const hidden = comments.filter((comment) => !comment.isVisible);

    for (const comment of visible)
      await expect(panel).toContainText(comment.content);
    for (const comment of hidden)
      await expect(panel).not.toContainText(comment.content);
    await expect(
      panel.getByText(`${visible.length}건`, { exact: true })
    ).toHaveCount(2);
    await expect(panel).not.toContainText('삭제된 댓글입니다.');
  });

  test('[TC-ADM-IR-021] 댓글 작성자와 관리 권한을 구분한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    const commentCase = await findCommentCase(
      realInquiry,
      (comments) =>
        comments.some((comment) => comment.isVisible && comment.isWriter) &&
        comments.some((comment) => comment.isVisible && !comment.isWriter)
    );
    const comments = flattenComments(commentCase.comments);
    const admin = comments.find(
      (comment) => comment.isVisible && comment.isWriter
    )!;
    const normal = comments.find(
      (comment) => comment.isVisible && !comment.isWriter
    )!;
    const panel = await openDetailCase(inquiryReport, commentCase);
    const adminArticle = inquiryReport.commentArticle(panel, admin.content);
    const normalArticle = inquiryReport.commentArticle(panel, normal.content);

    await expect(
      adminArticle.getByRole('button', { name: '댓글 더보기' })
    ).toBeVisible();
    await expect(
      normalArticle.getByRole('button', { name: '댓글 더보기' })
    ).toHaveCount(0);
    await adminArticle.getByRole('button', { name: '댓글 더보기' }).click();
    await expect(page.getByRole('menuitem', { name: '수정' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '삭제' })).toBeVisible();
    await page.keyboard.press('Escape');

    const withdrawn = comments.find(
      (comment) => comment.isVisible && comment.isWriterWithdrawn
    );
    test.skip(
      !withdrawn,
      '탈퇴 사용자가 작성한 공개 댓글 데이터가 필요합니다.'
    );
    await expect(
      inquiryReport
        .commentArticle(panel, withdrawn!.content)
        .getByText('탈퇴', { exact: true })
    ).toHaveClass(/bg-gray-900/);
  });

  test('[TC-ADM-IR-026] PC 1:1·소형 세로 배치와 스크롤을 확인한다', async ({
    page,
    inquiryReport,
    realInquiry,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const detailCase = await findDetailCase(realInquiry, () => true);
    await openDetailCase(inquiryReport, detailCase);
    const layout = page
      .locator('div.flex.flex-col.items-stretch.gap-4')
      .first();
    await expect(layout).toHaveCSS('flex-direction', 'row');
    const widths = await layout
      .locator(':scope > div')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().width)
      );
    expect(widths).toHaveLength(2);
    expect(Math.abs(widths[0] - widths[1])).toBeLessThan(4);

    await page.setViewportSize({ width: 1000, height: 700 });
    await expect(layout).toHaveCSS('flex-direction', 'column');
    await expect(
      inquiryReport.detailPanel.getByRole('button', { name: '닫기' })
    ).toBeVisible();
  });
});

type DetailCase = LocatedInquiry & { detail: InquiryDetail };

async function rowForItem(
  page: InquiryReportPage,
  data: RealInquiryFixture,
  item: InquiryListItem
) {
  const located = await data.findInquiry(item.postId);
  await page.goto(located.pageNumber);
  await expect(page.dataRows.first()).toBeVisible();
  return page.rowAt(located.rowIndex);
}

async function openDetailCase(page: InquiryReportPage, data: DetailCase) {
  const panel = await page.openDetailAt(
    data.rowIndex,
    data.item.title,
    data.pageNumber
  );
  await expect(panel).toContainText(data.detail.title);
  return panel;
}

async function findDetailCase(
  data: RealInquiryFixture,
  predicate: (item: InquiryListItem, detail: InquiryDetail) => boolean
) {
  return (await findDetailCases(data, predicate, 1))[0];
}

async function fixedDetailCase(
  data: RealInquiryFixture,
  postId: number,
  group: 'INQUIRY' | 'REPORT'
): Promise<DetailCase> {
  const located = await data.findInquiry(postId);
  expect(
    located.item.group,
    `${postId}는 ${GROUP_LABEL[group]} 데이터여야 합니다.`
  ).toBe(group);
  return { ...located, detail: await data.getDetail(postId) };
}

async function findDetailCases(
  data: RealInquiryFixture,
  predicate: (item: InquiryListItem, detail: InquiryDetail) => boolean,
  count: number
) {
  const matches: DetailCase[] = [];
  for (const item of await data.getAllInquiries()) {
    const detail = await data.tryGetDetail(item.postId);
    if (!detail || !predicate(item, detail)) continue;
    matches.push({ ...(await data.findInquiry(item.postId)), detail });
    if (matches.length === count) return matches;
  }
  test.skip(true, `조건을 만족하는 상세 데이터 ${count}건이 필요합니다.`);
  return matches;
}

async function findCommentCase(
  data: RealInquiryFixture,
  predicate: (comments: InquiryComment[]) => boolean
) {
  for (const item of await data.getAllInquiries()) {
    const detail = await data.tryGetDetail(item.postId);
    if (!detail) continue;
    const comments = flattenComments(await data.getComments(item.postId));
    if (!predicate(comments)) continue;
    return {
      ...(await data.findInquiry(item.postId)),
      detail,
      comments: await data.getComments(item.postId),
    };
  }
  test.skip(true, '조건을 만족하는 댓글 데이터가 필요합니다.');
  throw new Error('댓글 데이터 조건 불충족');
}

function findEmptyAndFilledReportFilter(inquiries: InquiryListItem[]) {
  const reportSubGroups = [
    'POST_REPORT',
    'EXAM_REVIEW_REPORT',
    'COMMENT_REPORT',
    'USER_REPORT',
  ] as const;
  for (const subGroup of reportSubGroups) {
    const statuses = inquiries
      .filter((item) => item.subGroup === subGroup)
      .map((item) => item.status);
    for (const emptyStatus of ['PENDING', 'COMPLETED'] as const) {
      const filledStatus: 'PENDING' | 'COMPLETED' =
        emptyStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
      if (!statuses.includes(emptyStatus) && statuses.includes(filledStatus)) {
        return { subGroup, emptyStatus, filledStatus };
      }
    }
  }
  return null;
}

async function expectNewTab(
  page: InquiryReportPage,
  link: Locator,
  expectedUrl: RegExp
) {
  await expect(link).toHaveAttribute('target', '_blank');
  const popup = await page.openPopup(link);
  await expect(popup).toHaveURL(expectedUrl);
  await popup.close();
}

function isWithdrawnListItem(item: InquiryListItem) {
  return ['탈퇴', '탈퇴한 사용자'].includes(item.userLoginId);
}

function requireValue<T>(value: T | null | undefined, reason: string): T {
  test.skip(value === null || value === undefined, reason);
  return value!;
}
