import Image from '@tiptap/extension-image';
import {
  ListItem,
  OrderedList,
  orderedListInputRegex,
} from '@tiptap/extension-list';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  BackgroundColor,
  Color,
  TextStyle,
} from '@tiptap/extension-text-style';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Extension, Node, wrappingInputRule } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { normalizeNoticeEmbedSrc, normalizeNoticeLink } from './content';

const NoticeOrderedList = OrderedList.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: orderedListInputRegex,
        type: this.type,
        getAttributes: (match) => ({ start: +match[1] }),
        joinPredicate: () => false,
      }),
      wrappingInputRule({
        find: /^([aAiI])\.\s$/,
        type: this.type,
        getAttributes: (match) => ({ type: match[1] }),
        joinPredicate: () => false,
      }),
    ];
  },
});

function editorDecorations(doc: ProseMirrorNode) {
  const decorations: Decoration[] = [];
  const formats = ['1', 'a', 'i'];
  const styles: Record<string, string> = {
    '1': 'decimal',
    a: 'lower-alpha',
    A: 'upper-alpha',
    i: 'lower-roman',
    I: 'upper-roman',
  };
  const walk = (
    parent: ProseMirrorNode,
    start: number,
    parentFormat: string | null
  ) =>
    parent.forEach((node, offset) => {
      const pos = start + offset;
      let format = parentFormat;
      if (node.type.name === 'orderedList') {
        format = ['a', 'A', 'i', 'I'].includes(node.attrs.type)
          ? String(node.attrs.type)
          : parentFormat
            ? formats[
                (formats.indexOf(parentFormat.toLowerCase()) + 1) %
                  formats.length
              ]
            : '1';
        decorations.push(
          Decoration.node(pos, pos + node.nodeSize, {
            style: `list-style-type: ${styles[format!]}`,
          })
        );
      }
      if (node.isBlock && !node.isLeaf && !node.isTextblock)
        walk(node, pos + 1, format);
    });
  walk(doc, 0, null);
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text?.includes('#')) return;
    for (const match of node.text.matchAll(/#[\p{L}\p{N}_]+/gu))
      decorations.push(
        Decoration.inline(
          pos + match.index,
          pos + match.index + match[0].length,
          { class: 'editor-hashtag' }
        )
      );
  });
  return DecorationSet.create(doc, decorations);
}

const NoticeWritingBehaviors = Extension.create({
  name: 'noticeWritingBehaviors',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Tab: () =>
        this.editor.commands.sinkListItem('listItem') ||
        this.editor.isActive('listItem'),
      'Shift-Tab': () =>
        this.editor.commands.liftListItem('listItem') ||
        this.editor.isActive('listItem'),
      Backspace: () => {
        const { $from, empty } = this.editor.state.selection;
        const depth = $from.depth - 1;
        if (
          !empty ||
          $from.parentOffset !== 0 ||
          depth < 0 ||
          $from.node(depth).type.name !== 'listItem' ||
          $from.index(depth) !== 0
        )
          return false;
        return this.editor.commands.liftListItem('listItem');
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('noticeWritingDecorations'),
        state: {
          init: (_, { doc }) => editorDecorations(doc),
          apply: (tr, previous) =>
            tr.docChanged ? editorDecorations(tr.doc) : previous,
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

// 유저단에 저장된 본문을 편집할 때 이미지·임베드·색상·목록 속성을 보존합니다.
const NoticeImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      referrerpolicy: {
        default: 'no-referrer',
        parseHTML: () => 'no-referrer',
        renderHTML: () => ({ referrerpolicy: 'no-referrer' }),
      },
    };
  },
});

const NoticeIframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          normalizeNoticeEmbedSrc(element.getAttribute('src') ?? ''),
      },
      embedType: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-embed-type'),
        renderHTML: (attributes) =>
          attributes.embedType
            ? { 'data-embed-type': attributes.embedType }
            : {},
      },
    };
  },
  parseHTML: () => [{ tag: 'iframe' }],
  renderHTML: ({ HTMLAttributes }) => [
    'iframe',
    {
      ...HTMLAttributes,
      width: '100%',
      height: '500',
      frameborder: '0',
      allowfullscreen: 'true',
      scrolling: 'no',
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    },
  ],
});

export function createNoticeEditorExtensions() {
  return [
    StarterKit.configure({
      trailingNode: false,
      listItem: false,
      orderedList: false,
      link: {
        openOnClick: false,
        autolink: true,
        isAllowedUri: (url) => normalizeNoticeLink(url) !== null,
      },
    }),
    ListItem.extend({ content: '(paragraph|heading) block*' }),
    NoticeOrderedList,
    NoticeWritingBehaviors,
    NoticeImage,
    NoticeIframe,
    TextStyle,
    Color,
    BackgroundColor,
    Placeholder.configure({ placeholder: '내용을 입력해 주세요.' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ];
}
