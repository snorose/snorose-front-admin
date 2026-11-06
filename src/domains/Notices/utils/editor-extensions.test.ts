import { Editor } from '@tiptap/react';
import { expect, test } from 'vitest';

import { serializeNoticeContent, toNoticeHtml } from './content';
import { createNoticeEditorExtensions } from './editor-extensions';
import { toggleNoticeList } from './editor-lists';

test('유저단 HTML의 이미지·임베드·색상·목록 형식이 편집과 재저장 후에도 보존된다', () => {
  const original =
    '<p style="text-align:center"><span style="color: rgb(255, 0, 0);background-color: rgb(255, 255, 0)">원문</span></p><img src="https://example.com/notice.png" alt="일정 안내" width="480"><iframe src="https://www.youtube.com/embed/abc" data-embed-type="youtube-video"></iframe><ol type="a" start="3"><li><h2>첫 항목</h2><p>설명</p></li></ol>';
  const editor = new Editor({
    extensions: createNoticeEditorExtensions(),
    content: toNoticeHtml(original),
  });
  try {
    editor.commands.insertContentAt(1, '수정 ');
    const saved = serializeNoticeContent(editor.getHTML());
    editor.commands.setContent(saved);
    const root = document.createElement('div');
    root.innerHTML = serializeNoticeContent(editor.getHTML());
    expect(root.textContent).toContain('수정 원문');
    expect(root.querySelector('p')?.style.textAlign).toBe('center');
    expect(root.querySelector('span')?.style.color).toBe('rgb(255, 0, 0)');
    expect(root.querySelector('span')?.style.backgroundColor).toBe(
      'rgb(255, 255, 0)'
    );
    expect(root.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/notice.png'
    );
    expect(root.querySelector('img')?.getAttribute('width')).toBe('480');
    expect(root.querySelector('img')?.getAttribute('referrerpolicy')).toBe(
      'no-referrer'
    );
    expect(root.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/abc'
    );
    expect(root.querySelector('iframe')?.getAttribute('data-embed-type')).toBe(
      'youtube-video'
    );
    expect(root.querySelector('ol')?.getAttribute('type')).toBe('a');
    expect(root.querySelector('ol')?.getAttribute('start')).toBe('3');
    expect(root.querySelector('li h2')?.textContent).toBe('첫 항목');
  } finally {
    editor.destroy();
  }
});

test('유저단 CSS 변수로 저장된 글자색·형광펜을 실제 색상으로 보존한다', () => {
  const root = document.createElement('div');
  root.innerHTML = toNoticeHtml(
    '<p><span style="color:var(--blue-4);background-color:var(--pink-1)">이전 공지</span></p>'
  );
  expect(root.querySelector('span')?.style.color).toBe('rgb(0, 54, 142)');
  expect(root.querySelector('span')?.style.backgroundColor).toBe(
    'rgb(254, 233, 235)'
  );
});

test('색상·형광펜 적용과 해제, 소제목/본문 전환을 저장 HTML에 반영한다', () => {
  const editor = new Editor({
    extensions: createNoticeEditorExtensions(),
    content: '<p>공지 본문</p>',
  });
  try {
    editor.commands.selectAll();
    editor
      .chain()
      .setColor('#00368e')
      .setBackgroundColor('#fdff6c')
      .setHeading({ level: 1 })
      .run();
    let html = serializeNoticeContent(editor.getHTML());
    expect(html).toContain('<h1>');
    expect(html).toContain('color: rgb(0, 54, 142)');
    expect(html).toContain('background-color: rgb(253, 255, 108)');
    editor.chain().unsetColor().unsetBackgroundColor().setParagraph().run();
    html = serializeNoticeContent(editor.getHTML());
    expect(html).toBe('<p>공지 본문</p>');
  } finally {
    editor.destroy();
  }
});

test('선택한 항목만 목록 종류를 바꾸고 탭·백스페이스로 목록을 편집한다', () => {
  const editor = new Editor({
    extensions: createNoticeEditorExtensions(),
    content:
      '<ul><li><p>첫째</p></li><li><p>둘째</p></li><li><p>셋째</p></li></ul>',
  });
  try {
    let position = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.text === '둘째') position = pos;
    });
    editor.commands.setTextSelection({ from: position, to: position + 2 });
    toggleNoticeList(editor, 'orderedList');
    const root = document.createElement('div');
    root.innerHTML = editor.getHTML();
    expect(root.querySelector('ol')?.textContent).toBe('둘째');
    expect(
      Array.from(root.querySelectorAll('ul')).map((node) => node.textContent)
    ).toEqual(['첫째', '셋째']);
    editor.commands.setContent(
      '<ul><li><p>첫째</p></li><li><p>둘째</p></li></ul>'
    );
    editor.state.doc.descendants((node, pos) => {
      if (node.text === '둘째') position = pos;
    });
    editor.commands.setTextSelection(position);
    editor.commands.keyboardShortcut('Tab');
    expect(editor.view.dom.querySelector('ul ul')).not.toBeNull();
    editor.commands.keyboardShortcut('Shift-Tab');
    expect(editor.view.dom.querySelector('ul ul')).toBeNull();
    editor.commands.setTextSelection(3);
    editor.commands.keyboardShortcut('Backspace');
    expect(editor.getHTML()).toMatch(/^<p>첫째<\/p>/);
  } finally {
    editor.destroy();
  }
});

test('해시태그와 중첩 번호 목록을 유저단 형식으로 표시하되 표시용 속성을 저장하지 않는다', () => {
  const editor = new Editor({
    extensions: createNoticeEditorExtensions(),
    content:
      '<p>#눈송이 #snorose</p><ol type="a"><li><p>상위</p><ol><li><p>하위</p></li></ol></li></ol>',
  });
  try {
    expect(editor.view.dom.querySelectorAll('.editor-hashtag')).toHaveLength(2);
    expect(
      (editor.view.dom.querySelector('ol ol') as HTMLElement).style
        .listStyleType
    ).toBe('lower-roman');
    expect(editor.getHTML()).not.toContain('editor-hashtag');
    expect(editor.getHTML()).not.toContain('list-style-type');
  } finally {
    editor.destroy();
  }
});
