import { describe, expect, test } from 'vitest';

import {
  INQUIRY_AUXILIARY_BADGE_META,
  getInquiryGroupBadgeMeta,
  getInquiryStatusBadgeMeta,
  getInquirySubGroupBadgeMeta,
} from './inquiryReportLabels';

describe('문의·신고 분류 배지 메타데이터', () => {
  test.each([
    ['INQUIRY', '문의', 'info'],
    ['REPORT', '신고', 'danger'],
    ['ETC', '기타', 'neutral'],
  ] as const)('%s에 %s·%s tone을 반환한다', (group, label, tone) => {
    expect(getInquiryGroupBadgeMeta(group)).toEqual({ label, tone });
  });

  test('문의 중분류와 신고 중분류를 서로 다른 tone으로 표시한다', () => {
    expect(getInquirySubGroupBadgeMeta('EXAM_REVIEW_INQUIRY')).toEqual({
      label: '족보 관련 문의',
      tone: 'info',
    });
    expect(getInquirySubGroupBadgeMeta('POST_REPORT')).toEqual({
      label: '게시글 신고',
      tone: 'danger',
    });
  });

  test('알 수 없는 분류는 neutral로 표시한다', () => {
    expect(getInquiryGroupBadgeMeta('UNKNOWN')).toEqual({
      label: '알 수 없음',
      tone: 'neutral',
    });
  });
});

describe('문의·신고 상태 배지 메타데이터', () => {
  test.each([
    ['PENDING', '답변 전', 'neutral'],
    ['COMPLETED', '답변 완료', 'success'],
    ['HOLD', '보류', 'warning'],
  ] as const)('%s에 %s·%s tone을 반환한다', (status, label, tone) => {
    expect(getInquiryStatusBadgeMeta(status)).toEqual({ label, tone });
  });

  test('작성자·댓글 보조 상태에 가이드 tone을 사용한다', () => {
    expect(INQUIRY_AUXILIARY_BADGE_META).toMatchObject({
      WITHDRAWN: { label: '탈퇴', tone: 'neutral' },
      EDITED: { label: '수정됨', tone: 'neutral' },
      COMMENT_HIDDEN: { label: '숨김', tone: 'warning' },
      COMMENT_DELETED: { label: '삭제됨', tone: 'danger' },
      COMMENT_ADMIN: { label: '관리자', tone: 'accent' },
    });
  });
});
