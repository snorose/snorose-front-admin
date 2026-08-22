/**
 * 문의·신고 Page Object와 실제 API 데이터를 TC에 제공하고 변경 데이터를 복구합니다.
 */
import { test as base } from '@playwright/test';

import type {
  InquiryComment,
  InquiryDetail,
  InquiryListItem,
  InquiryStatus,
} from '../../../src/shared/types';
import { getE2EQaRecordIds } from '../../shared/e2e-env';
import { InquiryReportApi, type LocatedInquiry } from './inquiry-report.api';
import { InquiryReportPage } from './inquiry-report.page';

const E2E_COMMENT_PREFIX = '[E2E:';

export type RealInquiryFixture = {
  qa: ReturnType<typeof getE2EQaRecordIds>;
  getAllInquiries(): Promise<InquiryListItem[]>;
  findInquiry(postId: number): Promise<LocatedInquiry>;
  getDetail(postId: number): Promise<InquiryDetail>;
  tryGetDetail(postId: number): Promise<InquiryDetail | null>;
  getComments(postId: number, refresh?: boolean): Promise<InquiryComment[]>;
  trackStatus(postId: number, originalStatus: InquiryStatus): void;
  restoreStatus(postId: number, status: InquiryStatus): Promise<void>;
  trackCreatedComment(postId: number, commentId: number): void;
  markCommentDeleted(commentId: number): void;
  cleanupStaleComments(postId: number): Promise<void>;
};

type TestFixtures = {
  inquiryReport: InquiryReportPage;
  realInquiry: RealInquiryFixture;
};
type WorkerFixtures = { inquiryReportApi: InquiryReportApi };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  inquiryReportApi: [
    async ({ browserName }, use) => {
      if (browserName !== 'chromium') {
        throw new Error('문의·신고 E2E는 Chromium에서만 실행할 수 있습니다.');
      }
      await use(await InquiryReportApi.create());
    },
    { scope: 'worker' },
  ],
  inquiryReport: async ({ baseURL, page }, use) => {
    if (baseURL) {
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write'], {
          origin: new URL(baseURL).origin,
        });
    }
    await use(new InquiryReportPage(page));
  },
  realInquiry: async ({ inquiryReportApi }, use) => {
    const context = new RealInquiryContext(inquiryReportApi);

    try {
      await use(context);
    } finally {
      await context.restoreMutations();
    }
  },
});

class RealInquiryContext implements RealInquiryFixture {
  readonly qa = getE2EQaRecordIds();

  private readonly originalStatuses = new Map<number, InquiryStatus>();
  private readonly createdComments = new Map<number, number>();

  constructor(private readonly api: InquiryReportApi) {}

  getAllInquiries() {
    return this.api.getAllInquiries();
  }

  findInquiry(postId: number) {
    return this.api.findInquiry(postId);
  }

  getDetail(postId: number) {
    return this.api.getDetail(postId);
  }

  tryGetDetail(postId: number) {
    return this.api.tryGetDetail(postId);
  }

  getComments(postId: number, refresh = false) {
    return this.api.getComments(postId, refresh);
  }

  trackStatus(postId: number, originalStatus: InquiryStatus) {
    if (!this.originalStatuses.has(postId)) {
      this.originalStatuses.set(postId, originalStatus);
    }
  }

  async restoreStatus(postId: number, status: InquiryStatus) {
    await this.api.updateStatus(postId, status);
    this.originalStatuses.delete(postId);
  }

  trackCreatedComment(postId: number, commentId: number) {
    this.createdComments.set(commentId, postId);
  }

  markCommentDeleted(commentId: number) {
    this.createdComments.delete(commentId);
  }

  async cleanupStaleComments(postId: number) {
    const comments = flattenComments(await this.getComments(postId, true));
    const staleComments = comments
      .filter(
        (comment) =>
          comment.isWriter &&
          comment.isVisible &&
          !comment.isDeleted &&
          comment.content.startsWith(E2E_COMMENT_PREFIX)
      )
      .sort((a, b) => b.id - a.id);

    for (const comment of staleComments) {
      await this.api.deleteComment(postId, comment.id);
    }
  }

  async restoreMutations() {
    const cleanupErrors: string[] = [];

    for (const [commentId, postId] of this.createdComments) {
      try {
        await this.api.deleteComment(postId, commentId);
      } catch (error) {
        cleanupErrors.push(toErrorMessage(error));
      }
    }

    for (const [postId, status] of this.originalStatuses) {
      try {
        await this.api.updateStatus(postId, status);
      } catch (error) {
        cleanupErrors.push(toErrorMessage(error));
      }
    }

    if (cleanupErrors.length > 0) {
      throw new Error(
        `실서버 테스트 데이터 복구 실패: ${cleanupErrors.join('; ')}`
      );
    }
  }
}

export function flattenComments(comments: InquiryComment[]): InquiryComment[] {
  return comments.flatMap((comment) => [
    comment,
    ...flattenComments(comment.children),
  ]);
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류';
}

export type { LocatedInquiry } from './inquiry-report.api';
export { expect } from '@playwright/test';
