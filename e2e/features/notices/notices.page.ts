import { type Page, expect } from '@playwright/test';

import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
} from '../../../src/domains/Notices/types';
import type { BaseResponse } from '../../../src/shared/types';

export class NoticeEditorPage {
  readonly uploads: { url: string; status: number; authenticated: boolean }[] =
    [];
  readonly thumbnailStatuses: number[] = [];
  readonly writes: AdminCreateNoticeRequest[] = [];
  readonly errors: string[] = [];

  constructor(readonly page: Page) {
    page.on('pageerror', (error) => this.errors.push(error.message));
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === '/v1/admin/notices'
      )
        this.writes.push(request.postDataJSON() as AdminCreateNoticeRequest);
    });
    page.on('response', (response) => {
      const request = response.request();
      if (request.method() === 'PUT')
        this.uploads.push({
          url: request.url(),
          status: response.status(),
          authenticated: !!(
            request.headers().authorization || request.headers().cookie
          ),
        });
      if (
        request.method() === 'POST' &&
        /\/posts\/\d+\/thumbnail$/.test(new URL(request.url()).pathname)
      )
        this.thumbnailStatuses.push(response.status());
    });
  }

  async open(title: string) {
    await this.page.goto('/notices/general/new');
    await this.page
      .getByRole('button', { name: '공지사항', exact: true })
      .click();
    await this.page.getByRole('textbox', { name: /제목/ }).fill(title);
    await this.page
      .getByRole('textbox', { name: '내용', exact: true })
      .fill('자동화 QA용 공지입니다. 실제 운영 안내가 아닙니다.');
  }

  async image(name: string, color = '#2563eb') {
    const base64 = await this.page.evaluate((color) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 32, 32);
      return canvas.toDataURL('image/png').split(',')[1];
    }, color);
    return {
      name,
      mimeType: 'image/png',
      buffer: Buffer.from(base64, 'base64'),
    };
  }

  async schedule(target: Date) {
    const [year, month, day, hour, minute] = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .format(target)
      .split(/\D/);
    await this.page.getByRole('button', { name: '예약', exact: true }).click();
    await this.page
      .getByRole('button', { name: '예약 게시 일시', exact: true })
      .click();
    const expectedMonth = `${year}년 ${Number(month)}월`;
    if (
      (await this.page.getByRole('grid').getAttribute('aria-label')) !==
      expectedMonth
    )
      await this.page.getByRole('button', { name: '다음 달로 이동' }).click();
    await this.page
      .getByRole('button', {
        name: new RegExp(`${year}년 ${Number(month)}월 ${Number(day)}일`),
      })
      .click();
    await this.page
      .getByRole('combobox', { name: '예약 게시 일시 시', exact: true })
      .click();
    await this.page
      .getByRole('option', { name: `${hour}시`, exact: true })
      .click();
    await this.page
      .getByRole('combobox', { name: '예약 게시 일시 분', exact: true })
      .click();
    await this.page
      .getByRole('option', { name: `${minute}분`, exact: true })
      .click();
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }

  async save(status: 'draft' | 'published' | 'scheduled') {
    await this.page
      .getByRole('button', {
        name:
          status === 'draft'
            ? '임시저장'
            : status === 'scheduled'
              ? '예약 게시'
              : '게시',
        exact: true,
      })
      .click();
    const created = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/v1/admin/notices'
    );
    await this.page
      .getByRole('dialog')
      .getByRole('button', {
        name: status === 'draft' ? '임시저장' : '저장',
        exact: true,
      })
      .click();
    const response = await created;
    expect(response.status(), '실제 공지 생성 HTTP 상태').toBe(201);
    const body =
      (await response.json()) as BaseResponse<AdminCreateNoticeResult>;
    expect(body.isSuccess, '실제 공지 생성 성공 여부').toBe(true);
    expect(
      Number.isSafeInteger(body.result.postId) && body.result.postId > 0
    ).toBe(true);
    await Promise.race([
      this.page.waitForURL(
        status === 'published'
          ? /\/notices\/general$/
          : new RegExp(`\\/notices\\/general\\?status=${status}&page=1$`),
        { timeout: 25_000 }
      ),
      this.page
        .getByRole('alert')
        .waitFor({ state: 'visible', timeout: 25_000 })
        .then(async () => {
          throw new Error(await this.page.getByRole('alert').innerText());
        }),
    ]);
    expect(this.writes).toHaveLength(1);
    expect(this.errors).toEqual([]);
    expect(this.uploads.length, '실제 파일 PUT 응답 개수').toBe(
      body.result.imageUploadUrls.length
    );
    for (const [index, url] of body.result.imageUploadUrls.entries()) {
      const upload = this.uploads.find((upload) => upload.url === url);
      expect(!!upload, `${index + 1}번째 첨부의 실제 PUT 응답`).toBe(true);
      expect(upload!.status).toBeGreaterThanOrEqual(200);
      expect(upload!.status).toBeLessThan(300);
      expect(
        upload!.authenticated,
        'S3에 관리자 인증정보를 전달하지 않음'
      ).toBe(false);
    }
    expect(this.thumbnailStatuses).toEqual(
      status === 'published' && body.result.imageUploadUrls.length ? [202] : []
    );
    return body.result;
  }

  async persisted(title: string, postId: number, label: string) {
    await this.page.reload();
    await this.page.getByLabel('게시글 검색', { exact: true }).fill(title);
    await this.page.getByRole('button', { name: '검색', exact: true }).click();
    const row = this.page.getByRole('row').filter({ hasText: title });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(String(postId));
    await expect(row.getByText(label, { exact: true })).toBeVisible();
  }
}

/** 유저단 API가 반환한 실제 CDN URL을 브라우저가 해석·재생할 수 있는지 확인합니다. */
export async function expectMedia(
  page: Page,
  url: string | null,
  kind: 'image' | 'video'
) {
  expect(!!url, `유저단 ${kind} URL 존재 여부`).toBe(true);
  const result = await page.evaluate(
    async ({ url, kind }) => {
      if (kind === 'image') {
        const image = new Image();
        image.src = url!;
        try {
          await image.decode();
          return image.naturalWidth > 0 && image.naturalHeight > 0;
        } catch {
          return false;
        }
      }
      const video = document.createElement('video');
      video.muted = true;
      video.src = url!;
      document.body.append(video);
      try {
        return await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => finish(false), 15_000);
          const finish = (passed: boolean) => {
            clearTimeout(timer);
            resolve(passed);
          };
          video.onerror = () => finish(false);
          video.ontimeupdate = () => {
            if (video.currentTime > 0 && video.videoWidth > 0) finish(true);
          };
          video.play().catch(() => finish(false));
        });
      } finally {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.remove();
      }
    },
    { url, kind }
  );
  expect(
    result,
    `실제 ${kind} CDN 파일의 브라우저 ${kind === 'image' ? '디코딩' : '재생'}`
  ).toBe(true);
}
