import type { Editor } from '@tiptap/react';

import {
  normalizeNoticeEmbedSrc,
  normalizeNoticeImageSrc,
  normalizeNoticeLink,
} from './content';

export function prepareNoticePastedHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((image) => {
    const src =
      image.getAttribute('data-lazy-src') ||
      image.getAttribute('data-src') ||
      image.getAttribute('data-original');
    if (!src) return;
    try {
      image.setAttribute(
        'src',
        new URL(src, image.getAttribute('src') || undefined).href
      );
    } catch {
      image.setAttribute('src', src);
    }
  });
  doc
    .querySelectorAll('[style]')
    .forEach((element) => element.removeAttribute('style'));
  doc
    .querySelectorAll('b, strong, u, s, strike, i, em, del')
    .forEach((element) => element.replaceWith(...element.childNodes));
  doc.querySelectorAll('a').forEach((anchor) => {
    if (/^#[\p{L}\p{N}_]+$/u.test(anchor.textContent.trim()))
      anchor.replaceWith(doc.createTextNode(anchor.textContent));
  });
  return doc.body.innerHTML;
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export function getNoticeEmbedHeight(value: unknown, embedType: string) {
  let data = value;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  const payload = record(data);
  const twitter = record(payload['twttr.embed'] ?? data);
  const params = embedType === 'twitter' ? twitter.params : payload.params;
  const firstParam = Array.isArray(params) ? record(params[0]) : {};
  const heights =
    embedType === 'twitter'
      ? twitter.method === 'twttr.private.resize'
        ? [firstParam.height]
        : []
      : embedType.startsWith('instagram-')
        ? [
            record(payload.details).height,
            payload.height,
            firstParam.height,
            record(payload.payload).height,
          ]
        : [];
  return (
    heights.find(
      (height): height is number =>
        typeof height === 'number' &&
        Number.isFinite(height) &&
        height > 0 &&
        height < 5000
    ) ?? null
  );
}

// snorose-front의 이미지 링크 감지와 EMBED_SOURCES를 같은 범위로 적용합니다.
export function isNoticeImageUrl(value: string) {
  const src = normalizeNoticeImageSrc(value);
  if (!src) return false;
  const url = new URL(src, 'https://snorose.com');
  return (
    /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i.test(url.pathname) ||
    [
      'imgur.com',
      'flickr.com',
      'postimages.org',
      'picsum.photos',
      'gstatic.com',
      'googleusercontent.com',
    ].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  );
}

export function getNoticeEmbed(
  value: string
): { src: string; embedType: string } | null {
  const href = normalizeNoticeLink(value);
  if (!href || !/^https?:/i.test(href)) return null;
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, '');
  const path = url.pathname;
  let src = normalizeNoticeEmbedSrc(href);
  let embedType = host;
  if (host === 'youtube.com' || host === 'youtu.be') {
    const id =
      host === 'youtu.be'
        ? path.slice(1)
        : path.startsWith('/watch')
          ? url.searchParams.get('v')
          : path.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
    if (!id || !/^[\w-]+$/.test(id)) return null;
    src = `https://www.youtube.com/embed/${id}`;
    embedType = path.startsWith('/shorts/')
      ? 'youtube-shorts'
      : 'youtube-video';
  } else if (host === 'instagram.com') {
    const match = path.match(/^\/(reels?|p)\/([\w-]+)/);
    if (!match) return null;
    const kind = match[1] === 'p' ? 'p' : 'reel';
    src = `https://www.instagram.com/${kind}/${match[2]}/embed/`;
    embedType = kind === 'p' ? 'instagram-post' : 'instagram-reel';
  } else if (host === 'tiktok.com') {
    const id = path.match(/\/(?:video|embed\/v2)\/(\d+)/)?.[1];
    if (!id) return null;
    src = `https://www.tiktok.com/embed/v2/${id}`;
    embedType = 'tiktok';
  } else if (
    host === 'twitter.com' ||
    host === 'x.com' ||
    host === 'platform.twitter.com'
  ) {
    const id =
      host === 'platform.twitter.com'
        ? url.searchParams.get('id')
        : path.match(/\/status\/(\d+)/)?.[1];
    if (!id || !/^\d+$/.test(id)) return null;
    src = `https://platform.twitter.com/embed/Tweet.html?id=${id}`;
    embedType = 'twitter';
  } else if (host === 'tv.naver.com') {
    const id = path.match(/^\/(?:v|embed)\/(\d+)/)?.[1];
    if (!id) return null;
    src = `https://tv.naver.com/embed/${id}`;
    embedType = 'naver-tv';
  }
  return src && normalizeNoticeEmbedSrc(src) ? { src, embedType } : null;
}

export function getNoticeLinkAtCursor(editor: Editor) {
  const { $from, empty } = editor.state.selection;
  if (!empty) return null;
  let pos = $from.pos;
  let node = $from.nodeBefore;
  if (node?.isText && node.text?.endsWith(' ')) {
    node = editor.state.doc.resolve(pos - 1).nodeBefore;
    pos -= 1;
  }
  const link = node?.marks.find((mark) => mark.type.name === 'link');
  return link ? { url: String(link.attrs.href), pos } : null;
}

export function insertNoticeEmbed(
  editor: Editor,
  href: string,
  linkPosition?: number
) {
  const embed = getNoticeEmbed(href);
  if (!embed) return false;
  const previous = editor.state.doc;
  const chain = editor.chain().focus();
  if (linkPosition !== undefined) chain.setTextSelection(linkPosition - 1);
  chain
    .extendMarkRange('link')
    .deleteSelection()
    .insertContent({ type: 'iframe', attrs: embed })
    .run();
  const inserted = !editor.state.doc.eq(previous);
  if (inserted) editor.commands.createParagraphNear();
  return inserted;
}
