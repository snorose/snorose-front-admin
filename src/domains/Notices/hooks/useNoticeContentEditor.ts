import { useEffect, useRef, useState } from 'react';

import { useEditor, useEditorState } from '@tiptap/react';

import { normalizeNoticeLink, serializeNoticeContent } from '../utils/content';
import { createNoticeEditorExtensions } from '../utils/editor-extensions';
import {
  getNoticeEmbed,
  getNoticeEmbedHeight,
  getNoticeLinkAtCursor,
  insertNoticeEmbed,
  isNoticeImageUrl,
  prepareNoticePastedHtml,
} from '../utils/editor-media';

export interface NoticeContentEditorOptions {
  id: string;
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}

export function useNoticeContentEditor({
  id,
  value,
  onChange,
  invalid = false,
}: NoticeContentEditorOptions) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const [dismissedLink, setDismissedLink] = useState('');
  // 연속 입력 중 부모가 돌려준 이전 HTML로 최신 입력을 덮어쓰지 않습니다.
  const pendingValues = useRef<string[]>([]);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createNoticeEditorExtensions(),
    content: value,
    editorProps: {
      transformPastedHTML: prepareNoticePastedHtml,
      attributes: {
        id,
        role: 'textbox',
        'aria-label': '내용',
        'aria-multiline': 'true',
        class: 'notice-rich-text min-h-[360px] p-5 outline-none',
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = serializeNoticeContent(current.getHTML());
      pendingValues.current.push(html);
      onChange(html);
      const link = getNoticeLinkAtCursor(current);
      if (!link || !isNoticeImageUrl(link.url)) return;
      queueMicrotask(() => {
        if (current.isDestroyed) return;
        const active = getNoticeLinkAtCursor(current);
        if (active?.url !== link.url || active.pos !== link.pos) return;
        current
          .chain()
          .focus()
          .setTextSelection(link.pos - 1)
          .extendMarkRange('link')
          .deleteSelection()
          .setImage({ src: link.url })
          .createParagraphNear()
          .run();
      });
    },
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            hasLink: current.isActive('link'),
            link: getNoticeLinkAtCursor(current),
          }
        : null,
  });

  useEffect(() => {
    const acknowledged = pendingValues.current.indexOf(value);
    if (acknowledged >= 0) {
      pendingValues.current.splice(0, acknowledged + 1);
      return;
    }
    if (editor && serializeNoticeContent(editor.getHTML()) !== value)
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);
  useEffect(() => {
    editor?.view.dom.setAttribute('aria-invalid', String(invalid));
  }, [editor, invalid]);
  useEffect(() => {
    if (!editor) return;
    const allowed = new Set([
      'https://platform.twitter.com',
      'https://www.instagram.com',
      'https://instagram.com',
    ]);
    const resize = (event: MessageEvent) => {
      if (!allowed.has(event.origin) || editor.isDestroyed) return;
      for (const iframe of editor.view.dom.querySelectorAll<HTMLIFrameElement>(
        'iframe[data-embed-type]'
      )) {
        if (iframe.contentWindow !== event.source) continue;
        const height = getNoticeEmbedHeight(
          event.data,
          iframe.getAttribute('data-embed-type') ?? ''
        );
        if (height) iframe.style.height = `${height}px`;
        break;
      }
    };
    window.addEventListener('message', resize);
    return () => window.removeEventListener('message', resize);
  }, [editor]);

  const openLink = () => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes('link').href ?? '');
    setLinkError('');
    setLinkOpen(true);
  };
  const applyLink = () => {
    const href = normalizeNoticeLink(linkUrl);
    if (!href) {
      setLinkError(
        'https://로 시작하는 주소 또는 /로 시작하는 내부 경로를 입력해 주세요.'
      );
      return;
    }
    if (!editor) return;
    const chain = editor.chain().focus().extendMarkRange('link');
    if (isNoticeImageUrl(href))
      chain
        .deleteSelection()
        .setImage({ src: href })
        .createParagraphNear()
        .run();
    else if (editor.state.selection.empty && !editor.isActive('link'))
      chain
        .insertContent({
          type: 'text',
          text: href,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run();
    else chain.setLink({ href }).run();
    setLinkOpen(false);
  };
  const applyEmbed = () => {
    if (editor && insertNoticeEmbed(editor, linkUrl)) setLinkOpen(false);
  };
  const link = state?.link;
  const linkKey = link ? `${link.pos}:${link.url}` : '';
  const embedLink =
    link &&
    !isNoticeImageUrl(link.url) &&
    getNoticeEmbed(link.url) &&
    dismissedLink !== linkKey
      ? link
      : null;
  return {
    editor,
    linkOpen,
    setLinkOpen,
    linkUrl,
    setLinkUrl,
    linkError,
    setLinkError,
    openLink,
    applyLink,
    applyEmbed,
    canEmbed: !!getNoticeEmbed(linkUrl),
    hasLink: state?.hasLink ?? false,
    embedLink,
    keepLink: () => {
      setDismissedLink(linkKey);
      editor?.commands.focus();
    },
    convertLinkToEmbed: () => {
      if (editor && embedLink)
        insertNoticeEmbed(editor, embedLink.url, embedLink.pos);
    },
  };
}
