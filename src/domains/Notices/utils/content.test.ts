import { describe, expect, test } from 'vitest';

import type { NoticeForm } from '../types';
import { toCreateNoticeRequest } from './api.mapper';
import {
  normalizeNoticeLink,
  noticeContentToText,
  sanitizeNoticeHtml,
  serializeNoticeContent,
  toNoticeHtml,
} from './content';
import { validateNotice } from './notice';

const form: NoticeForm = {
  board: '공지사항',
  category: '',
  title: '서식 공지',
  content: '',
  pinned: false,
  scheduledAt: '',
  attachments: [],
};

describe('공지 HTML 본문', () => {
  test('기존 일반 텍스트를 줄바꿈과 특수문자를 보존한 HTML로 연다', () => {
    expect(toNoticeHtml('첫 줄 & 안내\n\n다음 줄')).toBe(
      '<p>첫 줄 &amp; 안내</p><p>&nbsp;</p><p>다음 줄</p>'
    );
    expect(toNoticeHtml('')).toBe('');
  });

  test('문자 서식·정렬·목록·링크가 작성 요청에 HTML로 유지된다', () => {
    const html =
      '<p style="text-align: center"><strong>공지</strong> <em>안내</em> <u>밑줄</u> <s>취소</s></p><ol><li><p>첫 항목</p></li></ol><p><a href="https://snorose.com">스노로즈</a></p>';
    const request = toCreateNoticeRequest(
      { ...form, content: html },
      'published'
    );
    const root = document.createElement('div');
    root.innerHTML = request.content;
    expect(root.querySelector('p')?.style.textAlign).toBe('center');
    for (const tag of ['strong', 'em', 'u', 's', 'ol', 'li'])
      expect(root.querySelector(tag)).not.toBeNull();
    expect(root.querySelector('a')?.getAttribute('href')).toBe(
      'https://snorose.com'
    );
    expect(root.querySelector('a')?.getAttribute('rel')).toBe(
      'noopener noreferrer'
    );
  });

  test('빈 문단·줄바꿈·공백 서식만 있는 본문은 게시할 수 없고 임시저장은 가능하다', () => {
    for (const content of [
      '<p></p>',
      '<p><br></p>',
      '<p><strong>&nbsp;</strong></p>',
      '<p>\u200b</p>',
    ]) {
      expect(serializeNoticeContent(content)).toBe('');
      expect(validateNotice({ ...form, content }, 'published', [])).toMatch(
        '본문'
      );
      expect(validateNotice({ ...form, content }, 'draft', [])).toBeNull();
    }
  });

  test('위험한 태그·이벤트·주소와 임의 CSS를 제거하고 정렬만 보존한다', () => {
    const root = document.createElement('div');
    root.innerHTML = sanitizeNoticeHtml(
      '<script>alert(1)</script><p onclick="alert(1)" style="position:fixed;top:0;text-align:right">안내</p><a href="javascript:alert(1)">링크</a><img src="x" onerror="alert(1)">'
    );
    expect(root.querySelector('script, img, [onclick], [onerror]')).toBeNull();
    expect(root.querySelector('p')?.getAttribute('style')).toBe(
      'text-align: right;'
    );
    expect(root.querySelector('a')?.hasAttribute('href')).toBe(false);
  });

  test('링크는 정상 외부 주소와 내부 경로만 허용한다', () => {
    expect(normalizeNoticeLink(' https://snorose.com/ ')).toBe(
      'https://snorose.com/'
    );
    expect(normalizeNoticeLink('/board/notice')).toBe('/board/notice');
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,test',
      '//example.com',
      '/\\example.com',
      'https://exa mple.com',
    ])
      expect(normalizeNoticeLink(url)).toBeNull();
  });

  test('허용한 이미지·임베드는 보존하고 위장 도메인·실행 주소·위험 속성은 제거한다', () => {
    const root = document.createElement('div');
    root.innerHTML = sanitizeNoticeHtml(
      '<p>내용</p><img src="https://example.com/a.png" onerror="alert(1)"><iframe src="https://www.youtube.com/embed/abc" onload="alert(1)"></iframe><iframe src="https://www.youtube.com.evil.test/embed/abc"></iframe><iframe src="javascript:alert(1)"></iframe><img src="data:image/svg+xml,test">'
    );
    expect(root.querySelectorAll('img')).toHaveLength(1);
    expect(root.querySelectorAll('iframe')).toHaveLength(1);
    expect(root.querySelector('[onerror], [onload]')).toBeNull();
    expect(
      serializeNoticeContent('<img src="https://example.com/a.png">')
    ).toContain('<img');
  });

  test('목록과 본문 검색에는 태그 대신 문단별 텍스트와 해석한 엔티티를 쓴다', () => {
    expect(noticeContentToText('<p>눈송이 👩‍👧</p>')).toBe('눈송이 👩‍👧');
    expect(
      noticeContentToText(
        '<p><strong>첫 문단</strong> &amp; 안내</p><ul><li>첫 항목</li><li>둘째 항목</li></ul>'
      )
    ).toBe('첫 문단 & 안내 첫 항목 둘째 항목');
    expect(serializeNoticeContent('<p>본문</p><p></p><p>다음</p>')).toBe(
      '<p>본문</p><p>&nbsp;</p><p>다음</p>'
    );
  });
});
