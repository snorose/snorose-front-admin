import { describe, expect, it } from 'vitest';

import { buildOriginalPostUrl } from './postUrl';

describe('buildOriginalPostUrl', () => {
  it('일반 게시글의 원본 URL을 만든다', () => {
    expect(
      buildOriginalPostUrl({
        boardName: '함박눈방',
        isNotice: false,
        postId: 123,
      })
    ).toBe('https://www.snorose.com/board/large-snow/post/123');
  });

  it('이벤트 공지글은 공지 전용 경로를 사용한다', () => {
    expect(
      buildOriginalPostUrl({
        boardName: '이벤트',
        isNotice: true,
        postId: 456,
      })
    ).toBe('https://www.snorose.com/board/event-notice/post/456');
  });

  it('지원하지 않는 게시판이면 링크를 만들지 않는다', () => {
    expect(
      buildOriginalPostUrl({
        boardName: '알 수 없는 게시판',
        isNotice: false,
        postId: 789,
      })
    ).toBeNull();
  });
});
