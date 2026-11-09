import {
  type Request,
  type Response,
  test as base,
  expect,
} from '@playwright/test';
import { randomUUID } from 'node:crypto';

import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
} from '../../../src/domains/Notices/types';
import type { BaseResponse } from '../../../src/shared/types';
import { NoticesApi } from './notices.api';
import { NoticeEditorPage } from './notices.page';

interface CreatedNotice {
  postId?: number;
  title: string;
  boardId: number;
  requestedStatus: string;
  scheduledAt: string | null;
}

export const test = base.extend<{
  noticeApi: NoticesApi;
  noticeEditor: NoticeEditorPage;
  noticeQa: { title: string };
}>({
  noticeApi: async ({ context }, use) => {
    await use(new NoticesApi(context));
  },
  noticeEditor: async ({ page }, use) => {
    await use(new NoticeEditorPage(page));
  },
  noticeQa: async ({ page }, use, testInfo) => {
    const title = `[E2E:NOTICE:${randomUUID().slice(0, 8)}] ${testInfo.title.split(' ')[0]}`;
    const records: CreatedNotice[] = [];
    const pending: Promise<void>[] = [];
    // assertion·업로드가 실패해도 생성 요청과 확인된 ID를 남깁니다. 서명 URL·토큰은 기록하지 않습니다.
    const requests = new Map<Request, CreatedNotice>();
    const observeRequest = (request: Request) => {
      if (
        request.method() !== 'POST' ||
        new URL(request.url()).pathname !== '/v1/admin/notices'
      )
        return;
      const input = request.postDataJSON() as AdminCreateNoticeRequest;
      if (input.title !== title) return;
      const record: CreatedNotice = {
        title,
        boardId: input.boardId,
        requestedStatus: input.isDraft
          ? 'DRAFT'
          : input.isScheduled
            ? 'SCHEDULED'
            : 'PUBLISHED',
        scheduledAt: input.scheduledAt,
      };
      records.push(record);
      requests.set(request, record);
    };
    const observeResponse = (response: Response) => {
      const record = requests.get(response.request());
      if (!record) return;
      pending.push(
        response
          .json()
          .then((body: BaseResponse<AdminCreateNoticeResult>) => {
            if (body.isSuccess && Number.isSafeInteger(body.result?.postId))
              record.postId = body.result.postId;
          })
          .catch(() => {})
      );
    };
    page.on('request', observeRequest);
    page.on('response', observeResponse);
    try {
      await use({ title });
    } finally {
      page.off('request', observeRequest);
      page.off('response', observeResponse);
      await Promise.all(pending);
      if (records.length)
        await testInfo.attach('created-notice.json', {
          body: JSON.stringify(
            {
              records,
              cleanup:
                '공지 삭제 API가 없어 백엔드 정리가 필요합니다. ID가 없으면 이 실행의 고유 제목으로 등록 여부를 확인해 주세요.',
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
    }
  },
});

export { expect };
