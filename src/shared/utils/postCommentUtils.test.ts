import { describe, expect, test } from 'vitest';

import { getBoardKeyByName, getPostStatusBadges } from './postCommentUtils';

describe('getBoardKeyByName', () => {
  test('게시판 이름에 대응하는 URL key를 반환한다', () => {
    expect(getBoardKeyByName('함박눈방')).toBe('large-snow');
  });

  test('등록되지 않은 게시판 이름이면 undefined를 반환한다', () => {
    expect(getBoardKeyByName('알 수 없는 게시판')).toBeUndefined();
  });
});

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
