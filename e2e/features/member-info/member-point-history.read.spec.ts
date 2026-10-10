import { type BrowserContext, type Page, expect, test } from '@playwright/test';

import type {
  AdminUserListResult,
  BaseResponse,
  MemberInfo,
  MemberPointHistory,
  MemberPointHistoryResult,
} from '../../../src/shared/types';
import { getE2EAdminCredentials, getE2EApiBaseUrl } from '../../shared/e2e-env';
import { PointsApi } from '../points/points.api';

async function readApi<T>(
  context: BrowserContext,
  path: string,
  data?: unknown
) {
  const token = (await context.cookies()).find(
    (cookie) => cookie.name === 'accessToken'
  )?.value;
  if (!token) throw new Error('실제 dev 로그인 인증 상태가 필요합니다.');
  const response = await context.request.fetch(`${getE2EApiBaseUrl()}${path}`, {
    method: data === undefined ? 'GET' : 'POST',
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as BaseResponse<T>;
  expect(body.isSuccess).toBe(true);
  return body.result;
}

const isHistoryResponse = (url: string, page: number) => {
  const parsed = new URL(url);
  return (
    parsed.pathname.endsWith('/points/log') &&
    parsed.searchParams.get('page') === String(page)
  );
};

async function openMember(page: Page, member: MemberInfo) {
  await page.goto(`/member/info/${encodeURIComponent(member.encryptedUserId)}`);
  await expect(
    page.getByRole('button', { name: '포인트 증감 히스토리 열기' })
  ).toBeVisible();
}

test.describe('회원 포인트 증감 히스토리 — 실제 dev API 조회', () => {
  test('팝업을 열 때 조회하고 실제 로그·다음 페이지·모바일 화면을 표시한다', async ({
    context,
    page,
  }, testInfo) => {
    const api = await PointsApi.create(context);
    const member = await api.findMember(getE2EAdminCredentials().loginId);
    const historyRequests: string[] = [];
    const pointWrites: string[] = [];
    const pageErrors: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.endsWith('/points/log')) {
        historyRequests.push(request.url());
      }
      if (
        request.url().includes('/admin/points') &&
        request.method() !== 'GET'
      ) {
        pointWrites.push(request.method());
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await openMember(page, member);
    expect(historyRequests).toEqual([]);
    const firstResponse = page.waitForResponse((response) =>
      isHistoryResponse(response.url(), 0)
    );
    await page
      .getByRole('button', { name: '포인트 증감 히스토리 열기' })
      .click();
    const response = await firstResponse;
    expect(response.status()).toBe(200);
    const body =
      (await response.json()) as BaseResponse<MemberPointHistoryResult>;
    expect(body.isSuccess).toBe(true);
    const firstPage = body.result;
    const dialog = page.getByRole('dialog', { name: '포인트 증감 히스토리' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      `${member.userName}(${member.studentNumber})`
    );
    await expect(dialog.getByRole('listitem')).toHaveCount(
      firstPage.data.length
    );
    for (const log of firstPage.data) {
      const card = dialog.getByRole('listitem', {
        name: `포인트 로그 ${log.id}`,
        exact: true,
      });
      await expect(card).toContainText(
        `${log.difference > 0 ? '+' : ''}${log.difference.toLocaleString()}P`
      );
      await expect(card.locator('time')).toHaveText(
        log.createdAt.slice(0, 16).replace('T', ' ')
      );
      await expect(
        card.getByText('로그 ID', { exact: true }).locator('..').locator('dd')
      ).toHaveText(String(log.id));
      // sourceId는 로그 ID와 구분하여 실제 응답값 그대로 표시합니다.
      await expect(card.locator('dl > div').nth(3).locator('dd')).toHaveText(
        log.sourceId == null ? '-' : String(log.sourceId)
      );
      await expect(card.locator('dl > div').last().locator('dd')).toHaveText(
        log.sourceDetail ?? '-'
      );
      if (log.category === 'ADMIN_EXAM_REVIEW_DELETE' && log.sourceDetail) {
        await expect(card).toContainText('관리자 임의 시험후기 삭제');
        await expect(
          card.getByText('관련 글 제목', { exact: true })
        ).toBeVisible();
        await expect(card.getByText('메모', { exact: true })).not.toBeVisible();
      }
    }
    await testInfo.attach('desktop', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    if (firstPage.hasNext) {
      const nextResponse = page.waitForResponse((response) =>
        isHistoryResponse(response.url(), 1)
      );
      await dialog.getByLabel('포인트 증감 내역').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      // 짧은 목록은 스크롤이 생기지 않아 더 보기 버튼으로 조회합니다.
      if (!historyRequests.some((url) => isHistoryResponse(url, 1))) {
        await dialog.getByRole('button', { name: '내역 더 보기' }).click();
      }
      const next = await nextResponse;
      expect(next.status()).toBe(200);
      const nextBody =
        (await next.json()) as BaseResponse<MemberPointHistoryResult>;
      const expectedIds = new Set([
        ...firstPage.data.map((log) => log.id),
        ...nextBody.result.data.map((log) => log.id),
      ]);
      await expect(dialog.getByRole('listitem')).toHaveCount(expectedIds.size);
    } else if (firstPage.data.length === 0) {
      await expect(dialog).toContainText('포인트 증감 내역이 없습니다.');
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(async () => (await dialog.boundingBox())?.height)
      .toBeLessThanOrEqual(844);
    const box = await dialog.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth
      )
    ).toBe(true);
    await dialog.getByLabel('포인트 증감 내역').evaluate((element) => {
      element.scrollTop = 0;
    });
    await testInfo.attach('mobile', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await dialog.getByRole('button', { name: '창 닫기' }).click();
    await expect(dialog).not.toBeVisible();
    expect(pageErrors).toEqual([]);
    expect(pointWrites).toEqual([]);
  });

  test('오프라인이면 연결 대기를 안내하고 재연결 후 실제 내역을 조회한다', async ({
    context,
    page,
  }) => {
    const api = await PointsApi.create(context);
    const member = await api.findMember(getE2EAdminCredentials().loginId);
    await openMember(page, member);
    try {
      // API 응답을 조작하지 않고 브라우저를 실제 오프라인으로 전환합니다.
      await context.setOffline(true);
      await page
        .getByRole('button', { name: '포인트 증감 히스토리 열기' })
        .click();
      const dialog = page.getByRole('dialog', { name: '포인트 증감 히스토리' });
      await expect(dialog.getByRole('status')).toContainText(
        '네트워크 연결을 기다리고 있습니다.'
      );
      await expect(dialog).not.toContainText('포인트 증감 내역이 없습니다.');
      const responsePromise = page.waitForResponse((response) =>
        isHistoryResponse(response.url(), 0)
      );
      await context.setOffline(false);
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      const body =
        (await response.json()) as BaseResponse<MemberPointHistoryResult>;
      await expect(dialog.getByRole('listitem')).toHaveCount(
        body.result.data.length
      );
      await expect(dialog.getByRole('alert')).not.toBeVisible();
      await expect(dialog.getByRole('status')).not.toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('다른 회원으로 이동하면 이전 내역을 섞지 않고 빈 내역을 표시한다', async ({
    context,
    page,
  }) => {
    const api = await PointsApi.create(context);
    const admin = await api.findMember(getE2EAdminCredentials().loginId);
    const recent = await readApi<AdminUserListResult>(
      context,
      '/v2/admin/users?page=0&sortType=CREATED_AT&sortDirection=DESC'
    );
    let emptyMember: MemberInfo | undefined;
    for (const candidate of recent.data) {
      if (candidate.loginId === admin.loginId) continue;
      const history = await readApi<MemberPointHistoryResult>(
        context,
        `/v1/admin/users/${encodeURIComponent(candidate.encryptedUserId)}/points/log?page=0`
      );
      if (history.totalCount === 0) {
        emptyMember = await api.getMember(candidate.encryptedUserId);
        break;
      }
    }
    test.skip(
      !emptyMember,
      '최근 회원 중 실제 빈 내역 회원이 없어 해당 사례를 생략합니다.'
    );
    if (!emptyMember) return;
    await openMember(page, admin);
    await page
      .getByRole('button', { name: '포인트 증감 히스토리 열기' })
      .click();
    const dialog = page.getByRole('dialog', { name: '포인트 증감 히스토리' });
    await expect(dialog.getByLabel('포인트 증감 내역')).toHaveAttribute(
      'aria-busy',
      'false'
    );
    await dialog.getByRole('button', { name: '창 닫기' }).click();
    await openMember(page, emptyMember);
    await page
      .getByRole('button', { name: '포인트 증감 히스토리 열기' })
      .click();
    await expect(dialog).toContainText(
      `${emptyMember.userName}(${emptyMember.studentNumber})`
    );
    await expect(dialog).toContainText('포인트 증감 내역이 없습니다.');
    await expect(dialog.getByRole('listitem')).toHaveCount(0);
    await expect(
      dialog.getByRole('button', { name: '내역 더 보기' })
    ).not.toBeVisible();
  });
});

// API에서 실제로 존재하는 로그를 찾고, 그 로그의 링크를 브라우저에서 누릅니다.
async function openSourceLog(
  context: BrowserContext,
  page: Page,
  matches: (log: MemberPointHistory) => boolean,
  maxPages = 10
) {
  const api = await PointsApi.create(context);
  const member = await api.findMember(getE2EAdminCredentials().loginId);
  let found: { log: MemberPointHistory; page: number } | undefined;
  for (let index = 0; index < maxPages; index += 1) {
    const result = await readApi<MemberPointHistoryResult>(
      context,
      `/v1/admin/users/${encodeURIComponent(member.encryptedUserId)}/points/log?page=${index}`
    );
    const log = result.data.find(matches);
    if (log) {
      found = { log, page: index };
      break;
    }
    if (!result.hasNext) break;
  }
  test.skip(
    !found,
    '최근 실제 로그에 해당 출처가 없어 이동 검증을 생략합니다.'
  );
  if (!found) return;
  await openMember(page, member);
  await page.getByRole('button', { name: '포인트 증감 히스토리 열기' }).click();
  const dialog = page.getByRole('dialog', { name: '포인트 증감 히스토리' });
  await expect(dialog.getByRole('listitem').first()).toBeVisible();
  const card = dialog.getByRole('listitem', {
    name: `포인트 로그 ${found.log.id}`,
    exact: true,
  });
  const scrollArea = dialog.getByLabel('포인트 증감 내역');
  for (let index = 0; index < found.page; index += 1) {
    if (await card.count()) break;
    await expect(scrollArea).toHaveAttribute('aria-busy', 'false');
    const loadedCount = await dialog.getByRole('listitem').count();
    const canScroll = await scrollArea.evaluate((element) => {
      if (element.scrollHeight <= element.clientHeight) return false;
      element.scrollTop = element.scrollHeight;
      return true;
    });
    if (!canScroll)
      await dialog.getByRole('button', { name: '내역 더 보기' }).click();
    // 자동 스크롤로 이미 조회된 페이지를 다시 기다리지 않고 실제 추가된 목록을 확인한다.
    await expect
      .poll(() => dialog.getByRole('listitem').count())
      .toBeGreaterThan(loadedCount);
  }
  await expect(card).toBeVisible();
  return { log: found.log, link: card.getByRole('link') };
}

test.describe('포인트 출처 ID 이동 — 실제 dev API와 관리 화면', () => {
  test('게시글 ID를 누르면 해당 게시글 상세를 조회한다', async ({
    context,
    page,
  }, testInfo) => {
    const source = await openSourceLog(
      context,
      page,
      (log) => log.source === 'POST' && log.sourceId != null
    );
    if (!source) return;
    const id = source.log.sourceId!;
    const responsePromise = context.waitForEvent(
      'response',
      (response) => new URL(response.url()).pathname === `/v1/admin/posts/${id}`
    );
    await expect(source.link.locator('svg.lucide-arrow-up-right')).toHaveCount(
      1
    );
    await expect(source.link.locator('svg.lucide-copy')).toHaveCount(0);
    await expect(source.link).toHaveAttribute('target', '_blank');
    await expect(source.link).toHaveAttribute('rel', 'noopener noreferrer');
    const originalUrl = page.url();
    const newTabPromise = context.waitForEvent('page');
    await source.link.click();
    const destination = await newTabPromise;
    expect(page.url()).toBe(originalUrl);
    await expect(
      page.getByRole('dialog', { name: '포인트 증감 히스토리' })
    ).toBeVisible();
    await expect(destination).toHaveURL(new RegExp(`/posts/manage/${id}$`));
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.isSuccess).toBe(true);
    expect(body.result.postId).toBe(id);
    await expect(
      destination.getByRole('heading', { name: '게시글 상세 정보' })
    ).toBeVisible();
    await expect(
      destination.getByRole('heading', { name: body.result.title, exact: true })
    ).toBeVisible();
    await testInfo.attach('post-destination', {
      body: await destination.screenshot(),
      contentType: 'image/png',
    });
    await destination.close();
  });

  test('댓글 ID를 누르면 새 탭에서 해당 댓글과 상세 패널을 바로 연다', async ({
    context,
    page,
  }, testInfo) => {
    const source = await openSourceLog(
      context,
      page,
      (log) => log.source === 'COMMENT' && log.sourceId != null
    );
    if (!source) return;
    const id = source.log.sourceId!;
    const detail = await readApi<{
      commentId: number;
      postId: number;
      content: string;
    }>(context, `/v1/admin/comments/${id}`);
    expect(detail.commentId).toBe(id);
    const responsePromise = context.waitForEvent(
      'response',
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === `/v1/admin/comments/${id}`
    );
    await expect(source.link).toHaveAttribute('href', `/posts/comments/${id}`);
    await expect(source.link).toHaveAttribute('target', '_blank');
    await expect(source.link.locator('svg.lucide-arrow-up-right')).toHaveCount(
      1
    );
    const originalUrl = page.url();
    const newTabPromise = context.waitForEvent('page');
    await source.link.click();
    const destination = await newTabPromise;
    expect((await responsePromise).status()).toBe(200);
    await expect(destination).toHaveURL(
      new RegExp(`/posts/manage/${detail.postId}\\?commentId=${id}$`)
    );
    expect(page.url()).toBe(originalUrl);
    await expect(
      page.getByRole('dialog', { name: '포인트 증감 히스토리' })
    ).toBeVisible();
    const comment = destination.getByRole('article', {
      name: `댓글 ${id}`,
      exact: true,
    });
    await expect(comment).toHaveAttribute('data-selected', 'true');
    await expect(comment).toContainText(detail.content);
    await expect(comment).toBeInViewport();
    for (const title of [
      '댓글 상태 변경 내역',
      '댓글 신고 내역',
      '댓글 제재 내역',
    ]) {
      await expect(
        destination.getByRole('heading', { name: title, exact: true })
      ).toBeVisible();
    }
    await testInfo.attach('comment-detail-destination', {
      body: await destination.screenshot(),
      contentType: 'image/png',
    });
    // 새로고침과 모바일 화면에서도 URL로 지정된 댓글이 자동 선택된다.
    await destination.setViewportSize({ width: 390, height: 844 });
    await destination.reload();
    await expect(comment).toHaveAttribute('data-selected', 'true');
    await expect(comment).toBeInViewport();
    for (const title of [
      '댓글 상태 변경 내역',
      '댓글 신고 내역',
      '댓글 제재 내역',
    ]) {
      await expect(
        comment.getByRole('heading', { name: title, exact: true })
      ).toBeVisible();
    }
    await testInfo.attach('comment-detail-mobile', {
      body: await destination.screenshot(),
      contentType: 'image/png',
    });
    await destination.close();
  });

  test('관리자 삭제 로그도 관리자 ID가 아닌 시험후기 ID로 검색한다', async ({
    context,
    page,
  }, testInfo) => {
    const source = await openSourceLog(
      context,
      page,
      (log) =>
        log.category === 'ADMIN_EXAM_REVIEW_DELETE' && log.sourceId != null
    );
    if (!source) return;
    const id = source.log.sourceId!;
    const responsePromise = context.waitForEvent('response', (response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/v1/admin/reviews' &&
        url.searchParams.get('keywordPost') === String(id)
      );
    });
    await expect(source.link.locator('svg.lucide-arrow-up-right')).toHaveCount(
      1
    );
    await expect(source.link.locator('svg.lucide-copy')).toHaveCount(0);
    await expect(source.link).toHaveAttribute('target', '_blank');
    await expect(source.link).toHaveAttribute('rel', 'noopener noreferrer');
    const originalUrl = page.url();
    const newTabPromise = context.waitForEvent('page');
    await source.link.click();
    const destination = await newTabPromise;
    expect(page.url()).toBe(originalUrl);
    await expect(
      page.getByRole('dialog', { name: '포인트 증감 히스토리' })
    ).toBeVisible();
    await expect(destination).toHaveURL(
      new RegExp(`/reviews/exam\\?keywordPost=${id}&page=1$`)
    );
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.isSuccess).toBe(true);
    expect(
      body.result.data.map((review: { postId: number }) => review.postId)
    ).toEqual([id]);
    await expect(
      destination.getByPlaceholder('시험후기명 또는 postId 검색')
    ).toHaveValue(String(id));
    await expect(
      destination.locator('tbody tr').filter({ hasText: String(id) })
    ).toHaveCount(1);
    await testInfo.attach('exam-destination', {
      body: await destination.screenshot(),
      contentType: 'image/png',
    });
    await destination.close();
  });
});

test('이동 대상이 없는 실제 출처 ID는 복사 아이콘으로 클립보드에 복사한다', async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const source = await openSourceLog(
    context,
    page,
    (log) =>
      log.source === 'ADMIN' &&
      log.sourceId != null &&
      ['EVENT', 'ETC', 'POINT_REWARD_ETC', 'POINT_DEDUCTION_ETC'].includes(
        log.category
      ),
    40
  );
  if (!source) return;
  const card = page.getByRole('listitem', {
    name: `포인트 로그 ${source.log.id}`,
    exact: true,
  });
  await expect(card.getByRole('link')).toHaveCount(0);
  const copy = card.getByRole('button', {
    name: `관리자 ID ${source.log.sourceId} 복사`,
    exact: true,
  });
  await expect(copy.locator('svg.lucide-copy')).toHaveCount(1);
  await expect(card.locator('svg.lucide-arrow-up-right')).toHaveCount(0);
  const currentUrl = page.url();
  await copy.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(String(source.log.sourceId));
  expect(page.url()).toBe(currentUrl);
  await card
    .getByRole('button', { name: `로그 ID ${source.log.id} 복사`, exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(String(source.log.id));
  await testInfo.attach('copy-only-source', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});

test.describe('포인트 팝업 댓글 바로가기 — 실제 dev API', () => {
  test('다음 페이지의 댓글을 시간순 원래 위치에서 선택하고 상세 패널을 연다', async ({
    context,
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
    type Comment = { commentId: number; postId: number; content: string };
    type Comments = { hasNext: boolean; data: Comment[] };
    const posts = await readApi<{ data: { postId: number }[] }>(
      context,
      '/v1/admin/posts/search?page=0',
      { sortTypes: ['COMMENT_COUNT'], sortDirection: 'DESC' }
    );
    let fixture:
      | { comment: Comment; first: Comments; next: Comments }
      | undefined;
    for (const post of posts.data) {
      const search = {
        searchQuery: String(post.postId),
        searchScope: 'POST_ID',
        sortTypes: ['CREATED_AT'],
        sortDirection: 'ASC',
      };
      const first = await readApi<Comments>(
        context,
        '/v1/admin/comments/search?page=0',
        search
      );
      if (!first.hasNext) continue;
      const next = await readApi<Comments>(
        context,
        '/v1/admin/comments/search?page=1',
        search
      );
      const candidate = next.data
        .slice(1)
        .find(
          (comment) =>
            !first.data.some((item) => item.commentId === comment.commentId)
        );
      if (!candidate) continue;
      const comment = await readApi<Comment>(
        context,
        `/v1/admin/comments/${candidate.commentId}`
      );
      fixture = { comment, first, next };
      break;
    }
    test.skip(
      !fixture,
      '실제 조회 가능한 다음 페이지 댓글이 없어 해당 사례를 생략합니다.'
    );
    if (!fixture) return;
    const { comment, first, next } = fixture;
    expect(first.data.map((item) => item.commentId)).not.toContain(
      comment.commentId
    );
    await page.goto(
      `/posts/manage/${comment.postId}?commentId=${comment.commentId}`
    );
    const target = page.getByRole('article', {
      name: `댓글 ${comment.commentId}`,
      exact: true,
    });
    await expect(target).toHaveCount(1);
    await expect(target).toHaveAttribute('data-selected', 'true');
    await expect(target).toContainText(comment.content);
    await expect(target).toBeInViewport();
    // API가 내려준 두 번째 페이지의 순서를 그대로 유지한다.
    await expect
      .poll(() =>
        page
          .locator('[role="article"][aria-label^="댓글 "]')
          .evaluateAll((elements) =>
            elements.map((element) =>
              Number(element.getAttribute('aria-label')!.replace('댓글 ', ''))
            )
          )
      )
      .toEqual(next.data.map((item) => item.commentId));
    await expect(page.locator('[aria-current="page"]')).toHaveText('2');
    for (const title of [
      '댓글 상태 변경 내역',
      '댓글 신고 내역',
      '댓글 제재 내역',
    ]) {
      await expect(
        page.getByRole('heading', { name: title, exact: true })
      ).toBeVisible();
    }
    await testInfo.attach('off-page-comment-detail', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    // 다른 페이지를 직접 선택하면 연결된 댓글 페이지로 강제로 돌아가지 않는다.
    await page
      .getByRole('navigation', { name: '페이지네이션' })
      .getByRole('link', { name: '1', exact: true })
      .click();
    await expect(page.locator('[aria-current="page"]')).toHaveText('1');
    await expect
      .poll(() =>
        page
          .locator('[role="article"][aria-label^="댓글 "]')
          .evaluateAll((elements) =>
            elements.map((element) =>
              Number(element.getAttribute('aria-label')!.replace('댓글 ', ''))
            )
          )
      )
      .toEqual(first.data.map((item) => item.commentId));
    // 기존 댓글 관리 목록의 클릭은 게시글만 열고 자동 선택하지 않는다.
    await page.goto(
      `/posts/comments?searchScope=COMMENT_ID&searchQuery=${comment.commentId}&page=1`
    );
    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', {
        name: String(comment.commentId),
        exact: true,
      }),
    });
    await expect(row).toHaveCount(1);
    await row.locator('td').nth(4).click();
    await expect(page).toHaveURL(
      new RegExp(`/posts/manage/${comment.postId}$`)
    );
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(
      page.locator('[role="article"][data-selected="true"]')
    ).toHaveCount(0);
  });

  test('다른 게시글의 댓글을 URL로 지정해도 섞어서 표시하지 않는다', async ({
    context,
    page,
  }) => {
    const api = await PointsApi.create(context);
    const member = await api.findMember(getE2EAdminCredentials().loginId);
    let commentId: number | undefined;
    let otherPostId: number | undefined;
    for (
      let index = 0;
      index < 10 && (!commentId || !otherPostId);
      index += 1
    ) {
      const logs = await readApi<MemberPointHistoryResult>(
        context,
        `/v1/admin/users/${encodeURIComponent(member.encryptedUserId)}/points/log?page=${index}`
      );
      commentId ??=
        logs.data.find(
          (log) => log.source === 'COMMENT' && log.sourceId != null
        )?.sourceId ?? undefined;
      otherPostId ??=
        logs.data.find((log) => log.source === 'POST' && log.sourceId != null)
          ?.sourceId ?? undefined;
      if (!logs.hasNext) break;
    }
    test.skip(
      !commentId || !otherPostId,
      '실제 댓글·게시글 로그가 없어 해당 사례를 생략합니다.'
    );
    if (!commentId || !otherPostId) return;
    const comment = await readApi<{ postId: number }>(
      context,
      `/v1/admin/comments/${commentId}`
    );
    test.skip(
      comment.postId === otherPostId,
      '두 로그가 같은 게시글이어서 해당 사례를 생략합니다.'
    );
    await page.goto(`/posts/manage/${otherPostId}?commentId=${commentId}`);
    await expect(page.getByRole('alert')).toContainText(
      '이 게시글에 속한 댓글이 아닙니다.'
    );
    await expect(
      page.getByRole('article', { name: `댓글 ${commentId}`, exact: true })
    ).toHaveCount(0);
  });

  test('없는 댓글은 오류를 안내하고 댓글 관리 검색으로 이동할 수 있다', async ({
    page,
    context,
  }) => {
    const id = Number.MAX_SAFE_INTEGER;
    const responsePromise = context.waitForEvent(
      'response',
      (response) =>
        new URL(response.url()).pathname === `/v1/admin/comments/${id}`
    );
    await page.goto(`/posts/comments/${id}`);
    expect((await responsePromise).status()).not.toBe(200);
    await expect(page.getByRole('alert')).toHaveText(
      '댓글 상세를 불러오지 못했습니다.'
    );
    await expect(
      page.getByRole('link', { name: '댓글 관리에서 확인' })
    ).toHaveAttribute(
      'href',
      `/posts/comments?searchScope=COMMENT_ID&searchQuery=${id}&page=1`
    );
  });
});

test('포인트 팝업을 바로 다시 열면 읽은 페이지의 캐시를 사용한다', async ({
  context,
  page,
}) => {
  const api = await PointsApi.create(context);
  const member = await api.findMember(getE2EAdminCredentials().loginId);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/points/log'))
      requests.push(request.url());
  });
  await openMember(page, member);
  const open = page.getByRole('button', { name: '포인트 증감 히스토리 열기' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: '포인트 증감 히스토리' });
  const list = dialog.getByLabel('포인트 증감 내역');
  await expect(dialog.getByRole('listitem')).toHaveCount(10);
  for (let index = 0; index < 2; index += 1) {
    await expect(list).toHaveAttribute('aria-busy', 'false');
    const count = await dialog.getByRole('listitem').count();
    await list.evaluate((element) => {
      element.scrollTop = 0;
    });
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect
      .poll(() => dialog.getByRole('listitem').count())
      .toBeGreaterThan(count);
  }
  await expect(list).toHaveAttribute('aria-busy', 'false');
  const count = await dialog.getByRole('listitem').count();
  const previousRequests = [...requests];
  await dialog.getByRole('button', { name: '창 닫기' }).click();
  await expect(dialog).not.toBeVisible();
  await open.click();
  await expect(dialog.getByRole('listitem')).toHaveCount(count);
  await expect(list).toHaveAttribute('aria-busy', 'false');
  await page.waitForLoadState('networkidle');
  expect(requests).toEqual(previousRequests);
});

test('댓글이 많은 게시글의 마지막 페이지에서도 시간순 위치를 유지한다', async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  type Comment = { commentId: number; postId: number; createdAt: string };
  type Comments = { totalPage: number; data: Comment[] };
  const posts = await readApi<{ data: { postId: number }[] }>(
    context,
    '/v1/admin/posts/search?page=0',
    {
      sortTypes: ['COMMENT_COUNT'],
      sortDirection: 'DESC',
    }
  );
  const post = posts.data[0];
  const search = {
    searchQuery: String(post.postId),
    searchScope: 'POST_ID',
    sortTypes: ['CREATED_AT'],
    sortDirection: 'ASC',
  };
  const first = await readApi<Comments>(
    context,
    '/v1/admin/comments/search?page=0',
    search
  );
  test.skip(first.totalPage < 3, '실제 다중 페이지 댓글 사례가 없습니다.');
  const last = await readApi<Comments>(
    context,
    `/v1/admin/comments/search?page=${first.totalPage - 1}`,
    search
  );
  const target = last.data.at(-1)!;
  let detailRequests = 0;
  page.on('request', (request) => {
    if (
      request.method() === 'GET' &&
      new URL(request.url()).pathname ===
        `/v1/admin/comments/${target.commentId}`
    )
      detailRequests += 1;
  });
  await page.goto(`/posts/comments/${target.commentId}`);
  const selected = page.getByRole('article', {
    name: `댓글 ${target.commentId}`,
    exact: true,
  });
  await expect(selected).toHaveAttribute('data-selected', 'true');
  await expect(selected).toBeInViewport();
  await expect
    .poll(() =>
      page
        .locator('[role="article"][aria-label^="댓글 "]')
        .evaluateAll((elements) =>
          elements.map((element) =>
            Number(element.getAttribute('aria-label')!.replace('댓글 ', ''))
          )
        )
    )
    .toEqual(last.data.map((comment) => comment.commentId));
  await expect(page.locator('[aria-current="page"]')).toHaveText(
    String(first.totalPage)
  );
  // 연결 페이지와 게시글 상세는 동일한 댓글 상세 캐시를 공유한다.
  expect(detailRequests).toBe(1);
  await testInfo.attach('last-page-comment-original-order', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(selected).toHaveAttribute('data-selected', 'true');
  await expect(selected).toBeInViewport();
  await expect(page.locator('[aria-current="page"]')).toHaveText(
    String(first.totalPage)
  );
  await testInfo.attach('last-page-comment-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});
