import { describe, expect, it } from 'vitest';

import type { InquiryDetail } from '@/shared/types';

import {
  buildReportTargetUrl,
  hasUnmappedReportTargetBoard,
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

describe('buildReportTargetUrl', () => {
  it('targetBoardId가 32이면 어드민 시험후기 관리로 이동한다', () => {
    const detail = createInquiryDetail();

    expect(buildReportTargetUrl(detail)).toBe(
      '/reviews/exam?keywordPost=1781296&page=1'
    );
  });

  it('족보 신고의 대상 번호가 없으면 링크를 만들지 않는다', () => {
    const detail = createInquiryDetail({ target: null });

    expect(buildReportTargetUrl(detail)).toBeNull();
  });

  it('targetBoardId가 없으면 중분류만으로 족보 관리 링크를 만들지 않는다', () => {
    const detail = createInquiryDetail({ targetBoardId: 0 });

    expect(buildReportTargetUrl(detail)).toBeNull();
  });

  it.each([
    [41, 'residence'],
    [43, 'sookplace'],
  ])(
    '게시판 ID %i의 대상글을 dev 사용자 프론트로 연결한다',
    (targetBoardId, boardKey) => {
      const detail = createInquiryDetail({ targetBoardId });

      expect(buildReportTargetUrl(detail)).toBe(
        `https://front.dev.snorose.com/board/${boardKey}/post/1781296`
      );
    }
  );
});

describe('hasUnmappedReportTargetBoard', () => {
  it('대상글은 있지만 게시판 URL 매핑이 없으면 true를 반환한다', () => {
    const detail = createInquiryDetail({ targetBoardId: 999 });

    expect(hasUnmappedReportTargetBoard(detail)).toBe(true);
  });

  it('게시판 URL 매핑이 있으면 false를 반환한다', () => {
    const detail = createInquiryDetail({ targetBoardId: 41 });

    expect(hasUnmappedReportTargetBoard(detail)).toBe(false);
  });

  it('대상글이 없는 이용자 신고는 false를 반환한다', () => {
    const detail = createInquiryDetail({
      subGroup: 'USER_REPORT',
      targetBoardId: 0,
    });

    expect(hasUnmappedReportTargetBoard(detail)).toBe(false);
  });
});
