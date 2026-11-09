import { expect, test } from '@playwright/test';

import { NoticesApi } from './notices.api';

test('TC-ADM-NOTICE-009 게시판 드롭다운의 하위 선택을 전환하고 이전 조건을 지운다', async ({
  page,
  context,
}) => {
  const items = await new NoticesApi(context).all();
  await page.goto('/notices/general?sort=views&status=published');
  await expect(page.getByText('조회 중…')).toHaveCount(0);
  const form = page.getByRole('form', { name: '공지사항 검색', exact: true });
  const group = form.getByRole('combobox', { name: '게시판', exact: true });
  const subBoard = form.getByRole('combobox', {
    name: '하위 게시판',
    exact: true,
  });
  const chooseGroup = async (name: string) => {
    await group.click();
    await page.getByRole('option', { name, exact: true }).click();
  };
  await expect(subBoard).toBeDisabled();
  await page.getByLabel('게시글 검색', { exact: true }).fill('미적용 검색어');
  await chooseGroup('커뮤니티');
  await expect(subBoard).toBeEnabled();
  await expect(subBoard).toHaveText('전체');
  await subBoard.click();
  await page.getByRole('option', { name: '첫눈온방', exact: true }).click();
  expect(new URL(page.url()).searchParams.get('board')).toBe('첫눈온방');
  const expectedCount = items.filter(
    (item) => item.boardId === 21 && item.status === 'PUBLISHED'
  ).length;
  const list = page.getByRole('region', { name: '공지사항 목록', exact: true });
  await expect(list.getByRole('status').locator('span')).toHaveText(
    expectedCount.toLocaleString('ko-KR')
  );
  if (expectedCount)
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(
      Math.min(10, expectedCount)
    );
  else
    await expect(
      page.getByText('조건에 맞는 공지사항이 없습니다.')
    ).toBeVisible();
  await chooseGroup('공식 게시판');
  await expect(subBoard).toHaveText('전체');
  expect(new URL(page.url()).searchParams.get('board')).toBeNull();
  await subBoard.click();
  await expect(
    page.getByRole('option', { name: '첫눈온방', exact: true })
  ).toHaveCount(0);
  await page.getByRole('option', { name: '총학생회', exact: true }).click();
  await chooseGroup('공지사항');
  await expect(subBoard).toBeDisabled();
  await expect(subBoard).toHaveText('해당 없음');
  expect(new URL(page.url()).searchParams.get('board')).toBe('공지사항');
  await chooseGroup('커뮤니티');
  await expect(subBoard).toBeEnabled();
  await expect(subBoard).toHaveText('전체');
  await chooseGroup('전체');
  await expect(subBoard).toBeDisabled();
  const params = new URL(page.url()).searchParams;
  expect(params.get('group')).toBeNull();
  expect(params.get('board')).toBeNull();
  expect(params.get('sort')).toBe('views');
  expect(params.get('status')).toBe('published');
  expect(params.get('keyword')).toBeNull();
  await expect(page.getByLabel('게시글 검색', { exact: true })).toHaveValue(
    '미적용 검색어'
  );
});

// 조회만 수행합니다. 실제 작성·수정·삭제와 네트워크 모킹은 사용하지 않습니다.
test('TC-ADM-NOTICE-001 실제 API의 목록·개수·페이지 순서를 화면에 표시한다', async ({
  page,
  context,
}) => {
  const expected = await new NoticesApi(context).all();
  const requests: number[] = [];
  const writes: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname !== '/v1/admin/notices') return;
    if (request.method() === 'GET')
      requests.push(Number(url.searchParams.get('page')));
    else writes.push(request.method());
  });
  await page.goto('/notices/general');
  await expect(
    page.getByRole('heading', { name: '일반 공지 관리' })
  ).toBeVisible();
  await expect(page.getByText('조회 중…')).toHaveCount(0);
  const table = page.getByRole('table');
  await expect(table.locator('tbody tr')).toHaveCount(
    Math.min(10, expected.length)
  );
  if (!expected.length) {
    await expect(
      page.getByText('조건에 맞는 공지사항이 없습니다.')
    ).toBeVisible();
    return;
  }
  await expect(
    page.getByText(String(expected.length), { exact: true })
  ).toBeVisible();
  for (const [index, item] of expected.slice(0, 10).entries()) {
    const row = table.locator('tbody tr').nth(index);
    await expect(row).toContainText(String(item.postId));
    await expect(row).toContainText(item.title);
    await expect(row).toContainText(item.boardName);
    if (item.adminNickname) await expect(row).toContainText(item.adminNickname);
    await expect(
      row.getByRole('button', { name: `${item.title} 수정`, exact: true })
    ).toBeDisabled();
  }
  const totalPages = Math.max(1, Math.ceil(expected.length / 10));
  if (totalPages > 1) {
    await page
      .getByRole('link', { name: String(totalPages), exact: true })
      .click();
    await expect(table.locator('tbody tr')).toHaveCount(
      expected.slice((totalPages - 1) * 10).length
    );
    for (const item of expected.slice((totalPages - 1) * 10))
      await expect(table).toContainText(item.title);
  }
  expect(requests).toEqual(
    Array.from({ length: totalPages }, (_, index) => index)
  );
  expect(writes).toEqual([]);
  expect(errors).toEqual([]);
});

test('TC-ADM-NOTICE-002 실제 NEW 전체와 다른 페이지의 제목을 검색한다', async ({
  page,
  context,
}) => {
  const expected = await new NoticesApi(context).all();
  test.skip(
    !expected.length,
    '공지 데이터가 없어 검색 대상을 확인할 수 없습니다.'
  );
  await page.goto('/notices/general');
  await expect(
    page.getByRole('table').locator('tbody tr').first()
  ).toContainText(expected[0].title);
  await page.getByRole('combobox', { name: '구분', exact: true }).click();
  await page.getByRole('option', { name: 'NEW', exact: true }).click();
  await expect(page).toHaveURL(/kind=new/);
  const newCount = expected.filter(
    (item) => item.status === 'PUBLISHED' && item.isNew
  ).length;
  await expect(page.getByText(String(newCount), { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '검색 조건 초기화' }).click();
  await page.getByRole('combobox', { name: '게시글 검색 범위' }).click();
  await page.getByRole('option', { name: '제목', exact: true }).click();
  const keyword = expected.at(-1)!.title;
  await page.getByLabel('게시글 검색', { exact: true }).fill(keyword);
  expect(new URL(page.url()).searchParams.get('keyword')).toBeNull();
  await page.getByLabel('게시글 검색', { exact: true }).press('Enter');
  const matches = expected.filter((item) =>
    item.title.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase())
  );
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(
    Math.min(10, matches.length)
  );
  await expect(page.getByRole('table')).toContainText(keyword);
  await expect(
    page.getByRole('link', { name: '1', exact: true })
  ).toHaveAttribute('aria-current', 'page');
});

test('TC-ADM-NOTICE-003 작성자는 서버 닉네임으로 검색하고 작성 화면으로 이동한다', async ({
  page,
  context,
}) => {
  const expected = await new NoticesApi(context).all();
  test.skip(
    !expected[0]?.adminNickname,
    '작성자 닉네임이 있는 공지가 필요합니다.'
  );
  await page.goto('/notices/general');
  const table = page.getByRole('table');
  await expect(table.locator('tbody tr').first()).toContainText(
    expected[0].title
  );
  await table
    .locator('tbody tr')
    .first()
    .getByRole('button', { name: expected[0].adminNickname, exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: '작성한 공지글', exact: true })
    .click();
  await expect(page.getByLabel('작성자 검색 (닉네임)')).toHaveValue(
    expected[0].adminNickname
  );
  expect(new URL(page.url()).searchParams.has('author')).toBe(false);
  await page
    .getByLabel('작성자 검색 (닉네임)')
    .fill('아직 적용하지 않은 작성자');
  await page
    .getByLabel('게시글 검색', { exact: true })
    .fill('아직 적용하지 않은 검색어');
  await table
    .getByRole('button', { name: expected[0].adminNickname, exact: true })
    .first()
    .click();
  await page
    .getByRole('menuitem', { name: '작성한 공지글', exact: true })
    .click();
  await expect(page.getByLabel('작성자 검색 (닉네임)')).toHaveValue(
    expected[0].adminNickname
  );
  await expect(page.getByLabel('게시글 검색', { exact: true })).toHaveValue('');
  await page.getByRole('link', { name: '공지사항 작성하기' }).click();
  await expect(
    page.getByRole('button', { name: '게시', exact: true })
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: '임시저장', exact: true })
  ).toBeEnabled();
  await expect(
    page.getByRole('heading', { name: '공지사항 작성' })
  ).toBeVisible();
});

test('TC-ADM-NOTICE-008 날짜 범위와 정렬을 즉시 조합하고 날짜 해제 후에도 정렬을 유지한다', async ({
  page,
  context,
}) => {
  const items = await new NoticesApi(context).all();
  const dates = [
    ...new Set(items.map((item) => item.updatedAt.slice(0, 10))),
  ].sort();
  test.skip(dates.length < 2, '서로 다른 수정일의 공지 데이터가 필요합니다.');
  const startDate = dates[0];
  const endDate = dates.at(-2)!;
  const ranged = items.filter((item) => {
    const date = item.updatedAt.slice(0, 10);
    return date >= startDate && date <= endDate;
  });
  await page.goto(`/notices/general?startDate=${startDate}&endDate=${endDate}`);
  const count = page
    .getByRole('region', { name: '공지사항 목록', exact: true })
    .getByRole('status')
    .first();
  await expect(count).toHaveText(
    new RegExp(`^총\\s*${ranged.length.toLocaleString('ko-KR')}\\s*건$`)
  );
  const keyword = page.getByLabel('게시글 검색', { exact: true });
  await keyword.fill('아직 적용하지 않은 검색어');
  await page.getByRole('combobox', { name: '정렬', exact: true }).click();
  await page.getByRole('option', { name: '조회수순', exact: true }).click();
  await expect(page).toHaveURL(/sort=views/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({
    startDate,
    endDate,
    sort: 'views',
    page: '1',
  });
  await expect(count).toHaveText(
    new RegExp(`^총\\s*${ranged.length.toLocaleString('ko-KR')}\\s*건$`)
  );
  await expect(async () => {
    const ids = await page
      .getByRole('table')
      .locator('tbody tr td:first-child')
      .allTextContents();
    const rows = ids.map(
      (id) => ranged.find((item) => item.postId === Number(id))!
    );
    expect(rows).toHaveLength(Math.min(10, ranged.length));
    expect(rows.every(Boolean), '표시된 모든 공지가 날짜 범위에 포함').toBe(
      true
    );
    const priority = (item: (typeof items)[number]) =>
      item.status === 'PRIVATE'
        ? 5
        : item.status === 'DRAFT'
          ? 2
          : item.status === 'SCHEDULED'
            ? 3
            : item.isNew
              ? 0
              : item.isPinned
                ? 1
                : 4;
    for (let index = 1; index < rows.length; index++) {
      expect(priority(rows[index - 1])).toBeLessThanOrEqual(
        priority(rows[index])
      );
      if (priority(rows[index - 1]) === priority(rows[index]))
        expect(rows[index - 1].viewCount).toBeGreaterThanOrEqual(
          rows[index].viewCount
        );
    }
  }).toPass({ timeout: 5000 });
  await page.getByRole('button', { name: '수정 종료일', exact: true }).click();
  await page
    .getByRole('button', { name: '날짜 선택 해제', exact: true })
    .click();
  await expect(count).toHaveText(
    new RegExp(`^총\\s*${items.length.toLocaleString('ko-KR')}\\s*건$`)
  );
  const params = new URL(page.url()).searchParams;
  expect(params.get('startDate')).toBe(startDate);
  expect(params.get('endDate')).toBeNull();
  expect(params.get('sort')).toBe('views');
  expect(params.get('keyword')).toBeNull();
  await expect(keyword).toHaveValue('아직 적용하지 않은 검색어');
});
