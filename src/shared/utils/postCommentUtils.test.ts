import { describe, expect, test } from 'vitest';

import {
  getBoardKey,
  getBoardKeyByName,
  getPostStatusBadges,
} from './postCommentUtils';

describe('getBoardKey', () => {
  test.each([
    [41, 'residence'],
    [43, 'sookplace'],
  ])('게시판 ID %i에 대응하는 URL key를 반환한다', (boardId, expected) => {
    expect(getBoardKey(boardId)).toBe(expected);
  });
});

describe('getBoardKeyByName', () => {
  test('게시판 이름에 대응하는 URL key를 반환한다', () => {
    expect(getBoardKeyByName('함박눈방')).toBe('large-snow');
  });

  test('숙플레이스 이름에 대응하는 URL key를 반환한다', () => {
    expect(getBoardKeyByName('숙플레이스')).toBe('sookplace');
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
      [{ label: '어드민 비공개', tone: 'warning' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['SANCTIONED'] },
      [{ label: '노출', tone: 'success' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['ADMIN_DELETED'] },
      [{ label: '어드민 삭제', tone: 'danger' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['USER_DELETED'] },
      [{ label: '유저 삭제', tone: 'danger' }],
    ],
    [
      { reportCount: 0, adminCommonStatuses: ['DESANCTIONED'] },
      [{ label: '노출', tone: 'success' }],
    ],
    [
      { reportCount: 5, adminCommonStatuses: ['SANCTIONED', 'ADMIN_DELETED'] },
      [
        { label: '신고 다수', tone: 'warning' },
        { label: '어드민 삭제', tone: 'danger' },
      ],
    ],
    [{ reportCount: 0 }, [{ label: '노출', tone: 'success' }]],
  ])('상태에 맞는 label과 tone을 반환한다', (post, expected) => {
    expect(getPostStatusBadges(post)).toEqual(expected);
  });
});
