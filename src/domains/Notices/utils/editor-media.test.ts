import { Editor } from '@tiptap/react';
import { expect, test } from 'vitest';

import { createNoticeEditorExtensions } from './editor-extensions';
import {
  getNoticeEmbed,
  getNoticeEmbedHeight,
  getNoticeLinkAtCursor,
  insertNoticeEmbed,
  isNoticeImageUrl,
  prepareNoticePastedHtml,
} from './editor-media';

test.each([
  [
    'https://www.youtube.com/watch?v=abc123',
    'https://www.youtube.com/embed/abc123',
  ],
  ['https://youtu.be/abc123', 'https://www.youtube.com/embed/abc123'],
  [
    'https://www.youtube.com/shorts/abc123',
    'https://www.youtube.com/embed/abc123',
  ],
  [
    'https://www.instagram.com/reel/abc123/',
    'https://www.instagram.com/reel/abc123/embed/',
  ],
  [
    'https://www.instagram.com/p/abc123/',
    'https://www.instagram.com/p/abc123/embed/',
  ],
  [
    'https://www.tiktok.com/@user/video/12345',
    'https://www.tiktok.com/embed/v2/12345',
  ],
  [
    'https://x.com/user/status/12345',
    'https://platform.twitter.com/embed/Tweet.html?id=12345',
  ],
  ['https://tv.naver.com/v/12345', 'https://tv.naver.com/embed/12345'],
])('유저단 임베드 주소 %s를 변환한다', (input, expected) => {
  expect(getNoticeEmbed(input)?.src).toBe(expected);
  expect(getNoticeEmbed(expected)?.src).toBe(expected);
});

test('붙여넣기는 유저단처럼 외부 서식을 정리하고 지연 이미지와 해시태그를 처리한다', () => {
  const root = document.createElement('div');
  root.innerHTML = prepareNoticePastedHtml(
    '<p style="color:red"><strong>서식 없는 본문</strong><a href="https://example.com/tag">#눈송이</a></p><img src="https://example.com/placeholder.png" data-src="/real.png">'
  );
  expect(root.querySelector('[style], strong, a')).toBeNull();
  expect(root.textContent).toBe('서식 없는 본문#눈송이');
  expect(root.querySelector('img')).toHaveAttribute(
    'src',
    'https://example.com/real.png'
  );
});

test('인스타그램·트위터 임베드 크기 메시지를 해석하고 잘못된 크기는 무시한다', () => {
  expect(
    getNoticeEmbedHeight({ details: { height: 720 } }, 'instagram-post')
  ).toBe(720);
  expect(
    getNoticeEmbedHeight(
      JSON.stringify({ payload: { height: 810 } }),
      'instagram-reel'
    )
  ).toBe(810);
  expect(
    getNoticeEmbedHeight(
      {
        'twttr.embed': {
          method: 'twttr.private.resize',
          params: [{ height: 900 }],
        },
      },
      'twitter'
    )
  ).toBe(900);
  for (const height of [0, -1, 5000, '800', Number.NaN])
    expect(getNoticeEmbedHeight({ height }, 'instagram-post')).toBeNull();
  expect(getNoticeEmbedHeight('invalid json', 'twitter')).toBeNull();
  expect(getNoticeEmbedHeight({ height: 800 }, 'youtube-video')).toBeNull();
});

test('이미지 주소를 판별하고 위장 도메인·실행 주소는 임베드로 바꾸지 않는다', () => {
  expect(isNoticeImageUrl('https://example.com/image.png?size=2')).toBe(true);
  expect(isNoticeImageUrl('https://picsum.photos/300')).toBe(true);
  expect(isNoticeImageUrl('https://picsum.photos.evil.test/300')).toBe(false);
  expect(isNoticeImageUrl('javascript:alert(1)')).toBe(false);
  for (const href of [
    'javascript:alert(1)',
    'https://youtube.com.evil.test/watch?v=abc',
    'https://example.com/test',
    '/board/notice',
  ])
    expect(getNoticeEmbed(href)).toBeNull();
});

test('입력한 링크를 임베드로 전환할 때 기존 링크 텍스트를 중복으로 남기지 않는다', () => {
  const editor = new Editor({
    extensions: createNoticeEditorExtensions(),
    content:
      '<p><a href="https://youtu.be/abc123">https://youtu.be/abc123</a> </p>',
  });
  try {
    editor.commands.setTextSelection(editor.state.doc.content.size - 1);
    const link = getNoticeLinkAtCursor(editor)!;
    expect(link.url).toBe('https://youtu.be/abc123');
    expect(insertNoticeEmbed(editor, link.url, link.pos)).toBe(true);
    expect(editor.getHTML()).toContain('https://www.youtube.com/embed/abc123');
    expect(editor.getHTML()).not.toContain('<a');
    expect(editor.getText()).not.toContain('https://youtu.be/abc123');
  } finally {
    editor.destroy();
  }
});
