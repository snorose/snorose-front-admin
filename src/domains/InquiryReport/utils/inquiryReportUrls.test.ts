import { describe, expect, it } from 'vitest';

import type { InquiryDetail } from '@/shared/types';

import {
  buildOriginalInquiryPostUrl,
  buildReportTargetUrl,
  parseInquiryPostId,
} from './inquiryReportUrls';

const createInquiryDetail = (
  overrides: Partial<InquiryDetail> = {}
): InquiryDetail => ({
  inquiryId: 1,
  userRoleId: 1,
  isWriter: true,
  encryptedUserId: 'encrypted-user-id',
  userLoginId: 'user-id',
  category: 'EXAM_FALSE_REVIEW',
  title: '신고',
  content: '신고 내용',
  reportCause: 'EXAM_FALSE_REVIEW',
  target: '1781296',
  targetPostId: 0,
  targetBoardId: 32,
  group: 'REPORT',
  subGroup: 'EXAM_REVIEW_REPORT',
  status: 'PENDING',
  commentCount: 0,
  createdAt: '2026-09-01T00:00:00',
  updatedAt: null,
  isEdited: false,
  isWriterWithdrawn: false,
  attachments: [],
  ...overrides,
});

describe('buildOriginalInquiryPostUrl', () => {
  it.each(['INQUIRY', 'REPORT'] as const)(
    '%s 원문 경로를 생성하고 어드민 신고 대상 경로와 구분한다',
    (group) => {
      const detail = createInquiryDetail({ group });
      expect(buildOriginalInquiryPostUrl(detail)).toBe(
        `/${group === 'REPORT' ? 'report' : 'inquiry'}/1`
      );
      expect(buildReportTargetUrl(detail)).toBe(
        group === 'REPORT' ? '/reviews/exam?keywordPost=1781296&page=1' : null
      );
    }
  );
});

describe('parseInquiryPostId', () => {
  it('문의 번호를 읽는다', () => {
    expect(parseInquiryPostId('1781296')).toBe(1781296);
  });

  it.each([null, '', '0', '-1', '1.5', 'abc', '1abc', '9007199254740992'])(
    '잘못된 문의 번호 %s로 상세를 열지 않는다',
    (value) => {
      expect(parseInquiryPostId(value)).toBeNull();
    }
  );
});

describe('buildReportTargetUrl', () => {
  it('targetBoardId가 32이면 어드민 시험후기 관리로 이동한다', () => {
    const detail = createInquiryDetail();

    expect(buildReportTargetUrl(detail)).toBe(
      '/reviews/exam?keywordPost=1781296&page=1'
    );
  });

  it.each([null, '', '0', '-1', '1.5', 'abc', '9007199254740992'])(
    '대상 번호가 %s이면 링크를 만들지 않는다',
    (target) => {
      expect(buildReportTargetUrl(createInquiryDetail({ target }))).toBeNull();
    }
  );

  it.each([41, 43, 999, 0])(
    '게시판 ID %i의 대상글을 게시판 URL 매핑 없이 어드민 상세로 연결한다',
    (targetBoardId) => {
      const detail = createInquiryDetail({
        subGroup: 'POST_REPORT',
        targetBoardId,
      });
      expect(buildReportTargetUrl(detail)).toBe('/posts/manage/1781296');
    }
  );

  it.each([41, 32, 0])(
    '게시판 ID %i의 댓글 신고는 대상 게시글의 해당 댓글로 연결한다',
    (targetBoardId) => {
      const detail = createInquiryDetail({
        subGroup: 'COMMENT_REPORT',
        target: '123',
        targetPostId: 456,
        targetBoardId,
      });
      expect(buildReportTargetUrl(detail)).toBe(
        '/posts/manage/456?commentId=123'
      );
    }
  );

  it.each([0, -1, 1.5, Number.NaN])(
    '대상 게시글 번호가 %s이면 기존 댓글 상세 경로에서 게시글을 조회한다',
    (targetPostId) => {
      expect(
        buildReportTargetUrl(
          createInquiryDetail({
            subGroup: 'COMMENT_REPORT',
            target: '123',
            targetPostId,
          })
        )
      ).toBe('/posts/comments/123');
    }
  );

  it.each([null, '', '0', '-1', '1abc'])(
    '댓글 번호가 %s이면 링크를 만들지 않는다',
    (target) => {
      expect(
        buildReportTargetUrl(
          createInquiryDetail({ subGroup: 'COMMENT_REPORT', target })
        )
      ).toBeNull();
    }
  );

  it('문의에는 신고 대상 링크가 없다', () => {
    expect(
      buildReportTargetUrl(createInquiryDetail({ group: 'INQUIRY' }))
    ).toBeNull();
  });

  it('이용자 신고에는 대상글 링크가 없다', () => {
    const detail = createInquiryDetail({
      subGroup: 'USER_REPORT',
      targetBoardId: 0,
    });

    expect(buildReportTargetUrl(detail)).toBeNull();
  });
});
