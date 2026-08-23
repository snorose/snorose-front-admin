import { describe, expect, test } from 'vitest';

import { getPostStatusBadges } from './postCommentUtils';

describe('getPostStatusBadges', () => {
  test.each([
    [{ reportCount: 5 }, [{ label: '신고 다수', tone: 'warning' }]],
    [
      {
        reportCount: 0,
        isVisible: false,
        adminCommonStatuses: ['ADMIN_HIDDEN'],
      },
      [{ label: '리자 비공개', tone: 'warning' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['SANCTIONED'] },
      [{ label: '징계', tone: 'accent' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['ADMIN_DELETED'] },
      [{ label: '리자 삭제', tone: 'danger' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['USER_DELETED'] },
      [{ label: '유저 삭제', tone: 'danger' }],
    ],
    [{ reportCount: 0 }, [{ label: '노출', tone: 'success' }]],
  ])('상태에 맞는 label과 tone을 반환한다', (post, expected) => {
    expect(getPostStatusBadges(post)).toEqual(expected);
  });
});
