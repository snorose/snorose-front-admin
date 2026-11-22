import { expect, test } from '@playwright/test';

// 실제 snorose-front 화면에 명시적인 UI fixture를 전달합니다. 서버 연동 TC-012와 분리합니다.
test.use({
  storageState: { cookies: [], origins: [] },
  serviceWorkers: 'allow',
});

test('TC-ADM-NOTICE-013 유저 화면의 서식·본문 이미지·모바일 표시를 fixture로 검증한다', async ({
  page,
  context,
}, testInfo) => {
  const userAppUrl = process.env.E2E_USER_APP_URL;
  test.skip(!userAppUrl, '실행 중인 snorose-front 주소가 필요합니다.');
  const origin = new URL(userAppUrl!).origin;
  if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
    throw new Error('UI fixture는 로컬 앱에서만 사용할 수 있습니다.');
  const imageUrl = `${origin}/ui-fixture-image.png`;
  const content = `<h1 style="text-align:center"><strong><em><u><s><span style="color:rgb(0,54,142);background-color:rgb(253,255,108)">서식 확인 본문</span></s></u></em></strong></h1><p>&nbsp;</p><p>줄바꿈 확인</p><ul><li><p>글머리 항목</p></li></ul><ol><li><p>번호 항목</p></li></ol><p><a href="https://snorose.com">https://snorose.com</a></p><p>#공지검증</p><img src="${imageUrl}">`;
  const post = {
    postId: 999999999,
    title: 'UI 서식 검증',
    content,
    userDisplay: 'QA',
    userRoleId: 4,
    createdAt: '2026-11-22T19:00:00',
    isNotice: true,
    isWriter: true,
    isEdited: true,
    isLiked: false,
    isScrapped: false,
    attachments: [],
    viewCount: 0,
    likeCount: 0,
    scrapCount: 0,
    commentCount: 0,
  };
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.addInitScript(
    ({ origin }) => {
      if (location.origin === origin)
        localStorage.setItem('accessToken', 'ui-fixture-only');
    },
    { origin }
  );
  await context.route(/\/(?:api\/)?v[12]\//, async (route) => {
    expect(
      route.request().method(),
      'UI 검사에서 변경 API를 호출하지 않음'
    ).toBe('GET');
    const path = new URL(route.request().url()).pathname.replace(
      /^\/api(?=\/)/,
      ''
    );
    requests.push(path);
    const result =
      path === '/v1/users/mypage'
        ? {
            loginId: 'uiqa',
            nickname: 'UI QA',
            userRoleId: 4,
            balance: 0,
            userId: 101,
          }
        : path === '/v1/boards/12/posts/999999999'
          ? post
          : { data: [], hasNext: false, totalCount: 0 };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ isSuccess: true, code: 1000, result }),
    });
  });
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 640, 360);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await context.route('**/ui-fixture-image.png', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(png, 'base64'),
    })
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${origin}/board/notice/post/999999999`);
  await expect(
    page.getByRole('heading', { name: post.title, exact: true })
  ).toBeVisible();
  const heading = page.getByRole('heading', {
    name: '서식 확인 본문',
    exact: true,
  });
  const body = heading.locator('..');
  for (const [label, viewport] of [
    ['desktop', { width: 1280, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await expect(heading).toBeInViewport();
    await expect(heading).toHaveCSS('text-align', 'center');
    await expect(heading.locator('strong')).toHaveCSS(
      'font-weight',
      /^(700|800|900)$/
    );
    await expect(heading.locator('em')).toHaveCSS('font-style', 'italic');
    await expect(heading.locator('u')).toHaveCSS(
      'text-decoration-line',
      'underline'
    );
    await expect(heading.locator('s')).toHaveCSS(
      'text-decoration-line',
      'line-through'
    );
    await expect(heading.locator('span')).toHaveCSS('color', 'rgb(0, 54, 142)');
    await expect(heading.locator('span')).toHaveCSS(
      'background-color',
      'rgb(253, 255, 108)'
    );
    await expect(body.locator('ul li')).toContainText('글머리 항목');
    await expect(body.locator('ol li')).toContainText('번호 항목');
    await expect(body.locator('a[href="https://snorose.com"]')).toBeVisible();
    await expect(body).toContainText('줄바꿈 확인');
    await expect(body.locator('[data-hashtag="#공지검증"]')).toHaveCSS(
      'border-radius',
      '5px'
    );
    await expect
      .poll(() =>
        body
          .locator('img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth === 640
          )
      )
      .toBe(true);
    await expect
      .poll(() =>
        body
          .locator('img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.getBoundingClientRect().width <=
              image.parentElement!.getBoundingClientRect().width
          )
      )
      .toBe(true);
    const path = testInfo.outputPath(`user-ui-fixture-${label}.png`);
    await page.screenshot({ path, fullPage: true, animations: 'disabled' });
    await testInfo.attach(`user-ui-fixture-${label}`, {
      path,
      contentType: 'image/png',
    });
  }
  expect(requests).toContain('/v1/users/mypage');
  expect(requests).toContain('/v1/boards/12/posts/999999999');
  expect(errors).toEqual([]);
});
