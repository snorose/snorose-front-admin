import type {
  AdminUpdateNoticeRequest,
  AdminUpdateNoticeResult,
} from '../../../src/domains/Notices/types';
import type { BaseResponse } from '../../../src/shared/types';
import { expect, test } from './notices.fixture';

test.describe.configure({ retries: 0 });
test.use({ timezoneId: 'Asia/Seoul' });
test.skip(
  process.env.E2E_NOTICE_CREATE !== '1' ||
    process.env.E2E_NOTICE_PUBLISH !== '1' ||
    process.env.E2E_NOTICE_UPDATE !== '1',
  '수정 QA는 CREATE·PUBLISH·UPDATE 플래그를 모두 지정할 때만 실행합니다.'
);

test('TC-ADM-NOTICE-011 실제 수정·예약·공개 전환에서 기존 첨부와 예약을 보존한다', async ({
  page,
  noticeEditor,
  noticeApi,
  noticeQa,
}, testInfo) => {
  test.setTimeout(360_000);
  let postId: number | undefined;
  const patches: AdminUpdateNoticeRequest[] = [];
  page.on('request', (request) => {
    if (
      request.method() === 'PATCH' &&
      new URL(request.url()).pathname === `/v1/admin/notices/${postId}`
    )
      patches.push(request.postDataJSON() as AdminUpdateNoticeRequest);
  });
  const openEditor = async () => {
    await page.goto(`/notices/general/${postId}/edit`);
    await expect(
      page.getByRole('heading', { name: '공지사항 수정', exact: true })
    ).toBeVisible();
  };
  const save = async (
    action: string,
    status: AdminUpdateNoticeResult['status']
  ) => {
    await page.getByRole('button', { name: action, exact: true }).click();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        new URL(response.url()).pathname === `/v1/admin/notices/${postId}`
    );
    await page
      .getByRole('dialog')
      .getByRole('button', {
        name: action === '임시저장' ? '임시저장' : '저장',
        exact: true,
      })
      .click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body =
      (await response.json()) as BaseResponse<AdminUpdateNoticeResult>;
    expect(body.isSuccess).toBe(true);
    expect(body.result.status).toBe(status);
    await expect(
      page.getByRole('heading', { name: '일반 공지 관리', exact: true })
    ).toBeVisible();
    expect(await noticeApi.find(postId!)).toMatchObject({ status });
    expect(patches.at(-1)).not.toHaveProperty('images');
    return body.result;
  };
  try {
    await noticeEditor.open(noticeQa.title);
    await page
      .getByLabel('이미지 파일 선택')
      .setInputFiles(await noticeEditor.image('retained-update.png'));
    postId = (await noticeEditor.save('draft')).postId;
    await openEditor();
    await expect(
      page.getByRole('button', { name: '이미지 업로드', exact: true })
    ).toBeDisabled();
    const title = `${noticeQa.title} 수정`;
    await page.getByRole('textbox', { name: /제목/ }).fill(title);
    await page
      .getByRole('textbox', { name: '내용', exact: true })
      .fill('수정 API QA 본문입니다.');
    await page.getByRole('button', { name: '회계', exact: true }).click();
    await save('임시저장', 'DRAFT');
    expect(patches.at(-1)).toMatchObject({ title, category: '회계' });
    expect(patches.at(-1)).not.toHaveProperty('isVisible');

    await openEditor();
    const scheduledAt = await noticeEditor.schedule(
      new Date(Date.now() + 86_400_000)
    );
    await save('예약 게시', 'SCHEDULED');
    expect(patches.at(-1)).toEqual({ scheduledAt });
    await openEditor();
    await expect(
      page.getByText('기존 예약을 유지합니다.', { exact: true })
    ).toBeVisible();
    await page
      .getByRole('textbox', { name: /제목/ })
      .fill(`${title} 예약 유지`);
    const preserved = await save('예약 게시', 'SCHEDULED');
    expect(preserved.scheduledAt).toBe(scheduledAt);
    expect(patches.at(-1)).not.toHaveProperty('scheduledAt');

    await openEditor();
    const target = new Date(Math.ceil((Date.now() + 90_000) / 60_000) * 60_000);
    const rescheduledAt = await noticeEditor.schedule(target, true);
    const changed = await save('예약 게시', 'SCHEDULED');
    expect(changed.scheduledAt).toBe(rescheduledAt);
    expect(patches.at(-1)).toEqual({ scheduledAt: rescheduledAt });
    expect(await noticeApi.detail(postId)).toBeNull();
    await expect
      .poll(
        async () => {
          const status = (await noticeApi.find(postId!))?.status;
          if (Date.now() < target.getTime()) expect(status).toBe('SCHEDULED');
          return status;
        },
        {
          timeout: target.getTime() - Date.now() + 120_000,
          intervals: [1000, 2000, 5000],
          message: '변경한 예약 시각 이후 자동 게시',
        }
      )
      .toBe('PUBLISHED');
    expect(Date.now()).toBeGreaterThanOrEqual(target.getTime());
    const detail = await noticeApi.detail(postId);
    expect(detail?.attachments).toHaveLength(1);
    expect(detail!.attachments[0].fileName).toBe('retained-update.png');
    const attachmentId = detail!.attachments[0].id;
    expect(Number.isSafeInteger(attachmentId)).toBe(true);

    await openEditor();
    await expect(
      page.getByRole('button', { name: '예약', exact: true })
    ).toBeDisabled();
    await save('비공개', 'PRIVATE');
    expect(await noticeApi.detail(postId)).toBeNull();
    await openEditor();
    await save('공개', 'PUBLISHED');
    expect((await noticeApi.detail(postId))?.attachments[0].id).toBe(
      attachmentId
    );
    expect(noticeEditor.writes).toHaveLength(1);
    expect(noticeEditor.uploads).toHaveLength(1);
  } finally {
    if (postId !== undefined) {
      await noticeApi.ensureQaHidden(postId, noticeQa.title);
      await testInfo.attach('updated-notice.json', {
        body: JSON.stringify({
          postId,
          finalStatus: (await noticeApi.find(postId))?.status,
        }),
        contentType: 'application/json',
      });
    }
  }
});

test('TC-ADM-NOTICE-012 어드민 서식을 저장하고 실제 유저 화면에서 본문·이미지를 표시한다', async ({
  page,
  context,
  browser,
  noticeEditor,
  noticeApi,
  noticeQa,
}, testInfo) => {
  const userAppUrl = process.env.E2E_USER_APP_URL;
  test.skip(
    !userAppUrl,
    '실행 중인 snorose-front 주소를 E2E_USER_APP_URL로 지정합니다.'
  );
  const origin = new URL(userAppUrl!).origin;
  if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
    throw new Error('유저 화면 검증은 로컬 앱에서만 실행합니다.');
  test.setTimeout(300_000);
  let postId: number | undefined;
  const editor = page.getByRole('textbox', { name: '내용', exact: true });
  const toolbar = page.getByRole('group', { name: '본문 서식', exact: true });
  const save = async (action: string) => {
    await page.getByRole('button', { name: action, exact: true }).click();
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        new URL(response.url()).pathname === `/v1/admin/notices/${postId}`
    );
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '저장', exact: true })
      .click();
    expect((await saved).status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: '일반 공지 관리', exact: true })
    ).toBeVisible();
  };
  const assertStyles = async (root: import('@playwright/test').Locator) => {
    const heading = root.getByRole('heading', {
      name: '서식 확인 본문',
      exact: true,
    });
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
    await expect(heading.locator('span[style]')).toHaveCSS(
      'color',
      'rgb(0, 54, 142)'
    );
    await expect(heading.locator('span[style]')).toHaveCSS(
      'background-color',
      'rgb(253, 255, 108)'
    );
    await expect(root.locator('ul li')).toContainText('글머리 항목');
    await expect(root.locator('ol li')).toContainText('번호 항목');
    await expect(root.locator('a[href="https://snorose.com"]')).toHaveText(
      'https://snorose.com'
    );
    await expect(root).toContainText('줄바꿈 확인');
  };
  let userContext: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  try {
    await expect
      .poll(
        async () => {
          try {
            return (
              await context.request.get(origin, { timeout: 5000 })
            ).status();
          } catch {
            return 0;
          }
        },
        {
          timeout: 120_000,
          intervals: [1000, 2000, 5000],
          message: '유저 앱 준비 완료',
        }
      )
      .toBe(200);
    await noticeEditor.open(noticeQa.title);
    await editor.fill('서식 확인 본문');
    await editor.press('ControlOrMeta+A');
    for (const name of ['굵게', '기울임', '밑줄', '취소선'])
      await toolbar.getByRole('button', { name, exact: true }).click();
    await toolbar
      .getByRole('button', { name: '문단 형식', exact: true })
      .click();
    await page
      .getByRole('menuitemradio', { name: '소제목', exact: true })
      .click();
    await toolbar.getByRole('button', { name: '글자색', exact: true }).click();
    await page
      .getByRole('menuitemradio', { name: '글자색 파랑', exact: true })
      .click();
    await toolbar.getByRole('button', { name: '형광펜', exact: true }).click();
    await page
      .getByRole('menuitemradio', { name: '형광펜 노랑', exact: true })
      .click();
    await toolbar
      .getByRole('button', { name: '가운데 정렬', exact: true })
      .click();
    await editor.press('ControlOrMeta+A');
    await editor.press('ArrowRight');
    await editor.press('Enter');
    await editor.press('Enter');
    await page.keyboard.type('줄바꿈 확인');
    await editor.press('Enter');
    await toolbar
      .getByRole('button', { name: '글머리 기호 목록', exact: true })
      .click();
    await page.keyboard.type('글머리 항목');
    await editor.press('Enter');
    await editor.press('Enter');
    await toolbar
      .getByRole('button', { name: '번호 목록', exact: true })
      .click();
    await page.keyboard.type('번호 항목');
    await editor.press('Enter');
    await editor.press('Enter');
    await toolbar.getByRole('button', { name: '링크', exact: true }).click();
    await page
      .getByRole('textbox', { name: '링크 주소', exact: true })
      .fill('https://snorose.com');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '적용', exact: true })
      .click();
    await editor.press('ControlOrMeta+A');
    await editor.press('ArrowRight');
    await editor.press('Enter');
    await page.keyboard.type('#공지검증');
    await assertStyles(editor);
    await page
      .getByLabel('이미지 파일 선택')
      .setInputFiles(
        await noticeEditor.image('inline-formatting.png', '#2563eb', 640, 360)
      );
    postId = (await noticeEditor.save('draft')).postId;
    await page.goto(`/notices/general/${postId}/edit`);
    await assertStyles(editor);
    await save('게시');
    const detail = await noticeApi.detail(postId);
    expect(detail?.attachments).toHaveLength(1);
    const imageUrl = detail!.attachments[0].url;
    expect(imageUrl).toBeTruthy();
    await page.goto(`/notices/general/${postId}/edit`);
    await expect(editor).toBeVisible();
    await editor.press('ControlOrMeta+A');
    await editor.press('ArrowRight');
    await editor.press('Enter');
    await toolbar.getByRole('button', { name: '링크', exact: true }).click();
    await page
      .getByRole('textbox', { name: '링크 주소', exact: true })
      .fill(imageUrl!);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '이미지 삽입', exact: true })
      .click();
    await save('수정사항 반영');
    await page.goto(`/notices/general/${postId}/edit`);
    await assertStyles(editor);
    await expect(editor.locator('img')).toHaveAttribute('src', imageUrl!);
    expect((await noticeApi.detail(postId))?.content).toContain(imageUrl!);

    const token = (await context.cookies()).find(
      (cookie) => cookie.name === 'accessToken'
    )?.value;
    if (!token) throw new Error('실제 로그인 세션이 필요합니다.');
    userContext = await browser.newContext({
      serviceWorkers: 'allow',
      viewport: { width: 1280, height: 900 },
      timezoneId: 'Asia/Seoul',
    });
    await userContext.addInitScript(
      ({ token, origin }) => {
        if (location.origin === origin)
          localStorage.setItem('accessToken', token);
      },
      { token, origin }
    );
    const userPage = await userContext.newPage();
    const userDetailResponse = userPage.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname.replace(/^\/api(?=\/)/, '') ===
          `/v1/boards/12/posts/${postId}`
    );
    await userPage.goto(`${origin}/board/notice/post/${postId}`);
    const actualResponse = await userDetailResponse;
    expect(actualResponse.status()).toBe(200);
    expect((await actualResponse.json()).result.title).toBe(noticeQa.title);
    await expect(
      userPage.getByRole('heading', { name: noticeQa.title, exact: true })
    ).toBeVisible();
    const userBody = userPage
      .getByRole('heading', { name: '서식 확인 본문', exact: true })
      .locator('..');
    await assertStyles(userBody);
    await expect(userBody.locator('[data-hashtag="#공지검증"]')).toBeVisible();
    await expect(userBody.locator('[data-hashtag="#공지검증"]')).toHaveCSS(
      'border-radius',
      '5px'
    );
    const image = userBody.locator('img');
    await expect(image).toHaveAttribute('src', imageUrl!);
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0
        )
      )
      .toBe(true);
    for (const [label, viewport] of [
      ['desktop', { width: 1280, height: 900 }],
      ['mobile', { width: 390, height: 844 }],
    ] as const) {
      await userPage.setViewportSize(viewport);
      await assertStyles(userBody);
      await expect(
        userBody.getByRole('heading', { name: '서식 확인 본문', exact: true })
      ).toBeInViewport();
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) =>
              element.getBoundingClientRect().width <=
              element.parentElement!.getBoundingClientRect().width
          )
        )
        .toBe(true);
      const path = testInfo.outputPath(`user-notice-${label}.png`);
      await userPage.screenshot({
        path,
        fullPage: true,
        animations: 'disabled',
      });
      await testInfo.attach(`user-notice-${label}`, {
        path,
        contentType: 'image/png',
      });
    }
    expect(noticeEditor.errors).toEqual([]);
  } finally {
    try {
      if (postId !== undefined) {
        await noticeApi.ensureQaHidden(postId, noticeQa.title);
        await testInfo.attach('formatted-notice.json', {
          body: JSON.stringify({
            postId,
            finalStatus: (await noticeApi.find(postId))?.status,
          }),
          contentType: 'application/json',
        });
      }
    } finally {
      await userContext?.close();
    }
  }
});
