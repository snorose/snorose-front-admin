import DOMPurify from 'dompurify';

import { NOTICE_EDITOR_COLOR_VARIABLES } from '../constants/editor';

export function normalizeNoticeColor(value: string) {
  const resolved = value.replace(
    /var\(\s*(--[\w-]+)\s*\)/g,
    (match, variable: string) =>
      NOTICE_EDITOR_COLOR_VARIABLES[variable] ?? match
  );
  if (/url|expression|var\(/i.test(resolved)) return '';
  const element = document.createElement('span');
  element.style.color = resolved;
  return element.style.color;
}

const CONTENT_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
  'hr',
  'img',
  'iframe',
];

export function normalizeNoticeImageSrc(value: string): string | null {
  const url = normalizeNoticeLink(value);
  return url && (/^https?:/i.test(url) || url.startsWith('/')) ? url : null;
}

// snorose-front feature/editor/constant/embed-sources.js와 같은 임베드 범위입니다.
export function normalizeNoticeEmbedSrc(value: string): string | null {
  const url = normalizeNoticeLink(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname;
    const allowed =
      (host === 'youtube.com' && /^\/embed\/[\w-]+\/?$/.test(path)) ||
      (host === 'instagram.com' &&
        /^\/(reel|p)\/[\w-]+\/embed\/?$/.test(path)) ||
      (host === 'tiktok.com' && /^\/embed\/v2\/\d+\/?$/.test(path)) ||
      (host === 'platform.twitter.com' &&
        path === '/embed/Tweet.html' &&
        /^\d+$/.test(parsed.searchParams.get('id') ?? '')) ||
      (host === 'tv.naver.com' && /^\/embed\/\d+\/?$/.test(path));
    return allowed && /^https?:$/.test(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function normalizeNoticeLink(value: string): string | null {
  const url = value.trim();
  if (
    /\s/.test(url) ||
    Array.from(url).some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
    )
  )
    return null;
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\'))
    return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
      ? url
      : null;
  } catch {
    return null;
  }
}

export function sanitizeNoticeHtml(html: string) {
  const root = document.createElement('div');
  root.innerHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: CONTENT_TAGS,
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'style',
      'start',
      'type',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'referrerpolicy',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'allow',
      'data-embed-type',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  root.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const align = element.style.textAlign;
    const color = normalizeNoticeColor(element.style.color);
    const backgroundColor = normalizeNoticeColor(element.style.backgroundColor);
    element.removeAttribute('style');
    if (
      /^(P|H[1-6])$/.test(element.tagName) &&
      ['left', 'center', 'right', 'justify'].includes(align)
    )
      element.style.textAlign = align;
    if (element.tagName === 'SPAN') {
      if (color) element.style.color = color;
      if (backgroundColor) element.style.backgroundColor = backgroundColor;
    }
  });
  root.querySelectorAll('img').forEach((image) => {
    const src = normalizeNoticeImageSrc(image.getAttribute('src') ?? '');
    if (!src) image.remove();
    else {
      image.setAttribute('src', src);
      image.setAttribute('referrerpolicy', 'no-referrer');
    }
  });
  root.querySelectorAll('iframe').forEach((iframe) => {
    const src = normalizeNoticeEmbedSrc(iframe.getAttribute('src') ?? '');
    if (!src) iframe.remove();
    else {
      iframe.setAttribute('src', src);
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '500');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
    }
  });
  root.querySelectorAll('a').forEach((anchor) => {
    const href = normalizeNoticeLink(anchor.getAttribute('href') ?? '');
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
    if (!href) anchor.removeAttribute('href');
    else {
      anchor.setAttribute('href', href);
      if (/^https?:/i.test(href)) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
  return root.innerHTML;
}

export function noticeContentToText(content: string) {
  const root = document.createElement('div');
  root.innerHTML = DOMPurify.sanitize(content);
  root
    .querySelectorAll('p, br, li, h1, h2, h3, h4, h5, h6, blockquote, pre')
    .forEach((element) => element.insertAdjacentText('afterend', ' '));
  const text = (root.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return /^[\u200c\u200d]*$/.test(text) ? '' : text;
}

export function serializeNoticeContent(html: string) {
  const safeHtml = sanitizeNoticeHtml(html);
  if (!hasNoticeContent(safeHtml)) return '';
  // 유저단과 동일하게 빈 문단이 저장/다시 보기 과정에서 사라지지 않도록 보존합니다.
  return safeHtml.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
}

export function hasNoticeContent(html: string) {
  if (noticeContentToText(html)) return true;
  const root = document.createElement('div');
  root.innerHTML = sanitizeNoticeHtml(html);
  return root.querySelector('img[src], iframe[src]') !== null;
}

export function toNoticeHtml(content: string) {
  if (!content) return '';
  if (/<\/?[a-z][^>]*>/i.test(content)) return serializeNoticeContent(content);
  const root = document.createElement('div');
  for (const line of content.split(/\r?\n/)) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    root.append(paragraph);
  }
  return serializeNoticeContent(root.innerHTML);
}
