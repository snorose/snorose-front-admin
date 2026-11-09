import { fileURLToPath } from 'node:url';

import { expect, test } from './notices.fixture';
import { expectMedia } from './notices.page';

// 삭제 API가 없어 실패한 생성 테스트를 자동 재시도하면 QA 공지가 누적됩니다.
test.describe.configure({ retries: 0 });
test.use({
  timezoneId: 'Asia/Seoul',
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
});
test.skip(
  process.env.E2E_NOTICE_CREATE !== '1',
  '실제 생성 확인은 E2E_NOTICE_CREATE=1로 별도 실행합니다.'
);

test('TC-ADM-NOTICE-004 첨부 순서를 바꾸고 임시저장·실제 S3 업로드를 완료한다', async ({
  page,
  noticeEditor,
  noticeApi,
  noticeQa,
}) => {
  await noticeEditor.open(noticeQa.title);
  await page
    .getByLabel('이미지 파일 선택')
    .setInputFiles([
      await noticeEditor.image('e2e-first.png'),
      await noticeEditor.image('e2e-second.png', '#e11d48'),
    ]);
  await page.getByRole('img', { name: 'e2e-second.png' }).click();
  await page.keyboard.press('ArrowLeft');
  const list = page.getByRole('list', { name: '첨부 순서' });
  await expect(list.getByRole('link')).toHaveText([
    'e2e-second.png',
    'e2e-first.png',
  ]);
  await expect(list.getByRole('listitem').first()).toContainText('썸네일');
  const result = await noticeEditor.save('draft');
  expect(result.isDraft).toBe(true);
  expect(noticeEditor.writes[0]).toMatchObject({
    isDraft: true,
    isScheduled: false,
    images: [
      { type: 'PHOTO', fileName: 'e2e-second.png' },
      { type: 'PHOTO', fileName: 'e2e-first.png' },
    ],
  });
  await noticeEditor.persisted(noticeQa.title, result.postId, '임시저장');
  expect(
    await noticeApi.detail(result.postId),
    '임시저장 글의 유저단 비공개'
  ).toBeNull();
  expect(
    (await noticeApi.userNotices()).some(
      (item) => item.postId === result.postId
    )
  ).toBe(false);
});

test.describe('실제 공개를 동반하는 공지 QA', () => {
  test.skip(
    process.env.E2E_NOTICE_PUBLISH !== '1',
    '공개·예약·동영상 TC는 E2E_NOTICE_PUBLISH=1도 지정해야 합니다.'
  );

  test('TC-ADM-NOTICE-005 즉시 게시 후 이미지 순서·유저단 노출·첫 첨부 썸네일을 확인한다', async ({
    page,
    context,
    noticeEditor,
    noticeApi,
    noticeQa,
  }) => {
    test.setTimeout(150_000);
    await noticeEditor.open(noticeQa.title);
    await page
      .getByLabel('이미지 파일 선택')
      .setInputFiles([
        await noticeEditor.image('published-first.png'),
        await noticeEditor.image('published-second.png', '#e11d48'),
      ]);
    await page
      .getByRole('button', { name: 'published-second.png 앞으로 이동' })
      .click();
    const result = await noticeEditor.save('published');
    expect(result.isDraft).toBe(false);
    expect(result.isScheduled).toBe(false);
    expect(
      noticeEditor.writes[0].images.map((image) => image.fileName)
    ).toEqual(['published-second.png', 'published-first.png']);
    await noticeEditor.persisted(noticeQa.title, result.postId, '게시');
    expect(await noticeApi.find(result.postId)).toMatchObject({
      status: 'PUBLISHED',
    });
    const detail = await noticeApi.detail(result.postId);
    expect(detail).toMatchObject({ title: noticeQa.title, isNotice: true });
    expect(
      detail!.attachments.map((attachment) => attachment.fileName)
    ).toEqual(['published-second.png', 'published-first.png']);
    const media = await context.newPage();
    try {
      for (const attachment of detail!.attachments) {
        expect(attachment.type).toBe('PHOTO');
        await expectMedia(media, attachment.url, 'image');
      }
      let thumbnail: string | null = null;
      await expect
        .poll(
          async () => {
            thumbnail =
              (await noticeApi.userNotices()).find(
                (item) => item.postId === result.postId
              )?.thumbnailUrl ?? null;
            return (
              !!thumbnail &&
              new URL(thumbnail).pathname.includes(
                `/post-thumbnail/${result.postId}/thumbnail-`
              )
            );
          },
          {
            timeout: 90_000,
            intervals: [1000, 2000, 5000],
            message: '비동기 썸네일 생성 완료 및 유저단 목록 노출',
          }
        )
        .toBe(true);
      const firstStem = decodeURIComponent(
        new URL(detail!.attachments[0].url!).pathname.split('/').at(-1)!
      )
        .replace(/^resized-/, '')
        .replace(/\.[^.]+$/, '');
      expect(
        decodeURIComponent(new URL(thumbnail!).pathname).endsWith(
          `/thumbnail-${firstStem}.webp`
        ),
        '첫 번째 첨부로 생성된 썸네일'
      ).toBe(true);
      await expectMedia(media, thumbnail, 'image');
    } finally {
      await media.close();
    }
  });

  test('TC-ADM-NOTICE-006 예약 전 비공개와 예약 시각 이후 자동 공개를 확인한다', async ({
    page,
    noticeEditor,
    noticeApi,
    noticeQa,
  }) => {
    test.setTimeout(360_000);
    await noticeEditor.open(noticeQa.title);
    // 분 단위 UI 입력과 조작 시간을 고려하여 최소 90초 이후의 분 경계로 예약합니다.
    const target = new Date(Math.ceil((Date.now() + 90_000) / 60_000) * 60_000);
    const scheduledAt = await noticeEditor.schedule(target);
    const result = await noticeEditor.save('scheduled');
    expect(result).toMatchObject({
      isDraft: false,
      isScheduled: true,
      scheduledAt,
    });
    expect(noticeEditor.writes[0].scheduledAt).toBe(scheduledAt);
    await noticeEditor.persisted(noticeQa.title, result.postId, '예약');
    expect(Date.now(), '예약 시각 이전에 비공개를 검사').toBeLessThan(
      target.getTime()
    );
    expect(await noticeApi.find(result.postId)).toMatchObject({
      status: 'SCHEDULED',
    });
    expect(
      await noticeApi.detail(result.postId),
      '예약 전 유저단 상세 비공개'
    ).toBeNull();
    expect(
      (await noticeApi.userNotices()).some(
        (item) => item.postId === result.postId
      ),
      '예약 전 유저단 목록 비공개'
    ).toBe(false);
    await expect
      .poll(
        async () => {
          const item = await noticeApi.find(result.postId);
          return item?.status;
        },
        {
          timeout: target.getTime() - Date.now() + 120_000,
          intervals: [1000, 2000, 5000],
          message: '예약 시각 이후 스케줄러의 PUBLISHED 전환',
        }
      )
      .toBe('PUBLISHED');
    expect(Date.now()).toBeGreaterThanOrEqual(target.getTime());
    expect(await noticeApi.detail(result.postId)).toMatchObject({
      title: noticeQa.title,
      isNotice: true,
    });
    expect(
      (await noticeApi.userNotices()).some(
        (item) => item.postId === result.postId
      )
    ).toBe(true);
    // 예약 필터에서 빠진 뒤 전체 목록을 다시 검색합니다.
    await page.goto('/notices/general');
    await noticeEditor.persisted(noticeQa.title, result.postId, '게시');
  });

  test('TC-ADM-NOTICE-007 실제 MP4 업로드·유저단 재생·동영상 썸네일을 확인한다', async ({
    page,
    context,
    noticeEditor,
    noticeApi,
    noticeQa,
  }) => {
    test.setTimeout(150_000);
    await noticeEditor.open(noticeQa.title);
    await page
      .getByLabel('동영상 파일 선택')
      .setInputFiles(
        fileURLToPath(new URL('./fixtures/notice-video.mp4', import.meta.url))
      );
    const preview = page.getByLabel('notice-video.mp4 동영상');
    await expect
      .poll(
        () =>
          preview.evaluate(
            (element: HTMLVideoElement) =>
              element.readyState >= 1 && element.videoWidth > 0
          ),
        { message: '로컬 MP4 미리보기 디코딩' }
      )
      .toBe(true);
    await expect(
      page
        .getByRole('list', { name: '첨부 순서' })
        .getByRole('listitem')
        .first()
    ).toContainText('썸네일');
    const result = await noticeEditor.save('published');
    expect(noticeEditor.writes[0].images).toEqual([
      { type: 'VIDEO', fileName: 'notice-video.mp4', fileComment: '' },
    ]);
    await noticeEditor.persisted(noticeQa.title, result.postId, '게시');
    const detail = await noticeApi.detail(result.postId);
    expect(detail).toMatchObject({ title: noticeQa.title, isNotice: true });
    expect(detail!.attachments).toHaveLength(1);
    expect(detail!.attachments[0]).toMatchObject({
      type: 'VIDEO',
      fileName: 'notice-video.mp4',
    });
    const media = await context.newPage();
    try {
      await expectMedia(media, detail!.attachments[0].url, 'video');
      let thumbnail: string | null = null;
      await expect
        .poll(
          async () => {
            thumbnail =
              (await noticeApi.userNotices()).find(
                (item) => item.postId === result.postId
              )?.thumbnailUrl ?? null;
            return (
              !!thumbnail &&
              new URL(thumbnail).pathname.includes(
                `/post-thumbnail/${result.postId}/thumbnail-`
              )
            );
          },
          {
            timeout: 90_000,
            intervals: [1000, 2000, 5000],
            message: '실제 동영상 썸네일 생성 완료',
          }
        )
        .toBe(true);
      await expectMedia(media, thumbnail, 'image');
    } finally {
      await media.close();
    }
  });
});
