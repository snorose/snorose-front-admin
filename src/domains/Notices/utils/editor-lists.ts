import type {
  Node as ProseMirrorNode,
  ResolvedPos,
  Schema,
} from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';

export function getNoticeListType(position: ResolvedPos) {
  for (let depth = position.depth; depth > 0; depth--) {
    const name = position.node(depth).type.name;
    if (name === 'bulletList' || name === 'orderedList') return name;
  }
  return null;
}

const isList = (node: ProseMirrorNode | null) =>
  !!node && ['bulletList', 'orderedList'].includes(node.type.name);

// 유저단 listConversion의 선택된 항목만 분리하여 종류를 바꾸는 동작입니다.
export function convertNoticeListSelection(
  tr: Transaction,
  schema: Schema,
  targetName: string
) {
  const { from, to } = tr.selection;
  const positions: number[] = [];
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (isList(node)) positions.push(pos);
  });
  let changed = false;
  for (const pos of positions.sort((a, b) => b - a)) {
    const list = tr.doc.nodeAt(pos);
    if (!isList(list) || !list) continue;
    const children: {
      index: number;
      start: number;
      end: number;
      contentStart: number;
      contentEnd: number;
    }[] = [];
    list.forEach((child, offset, index) => {
      const start = pos + 1 + offset;
      children.push({
        index,
        start,
        end: start + child.nodeSize,
        contentStart: start + 1,
        contentEnd:
          start + 1 + (child.firstChild?.nodeSize ?? child.nodeSize - 2),
      });
    });
    const selected = children.filter(
      (child) => child.contentEnd > from && child.contentStart < to
    );
    if (!selected.length) continue;
    const first = selected[0],
      last = selected.at(-1)!;
    if (first.index === 0 && last.index === children.length - 1) {
      tr.setNodeMarkup(pos, schema.nodes[targetName]);
      changed = true;
      continue;
    }
    if (last.index < children.length - 1) tr.split(last.end, 1);
    if (first.index > 0) tr.split(first.start, 1);
    const anchor = tr.doc.resolve(tr.mapping.map(first.start + 1));
    for (let depth = anchor.depth; depth >= 0; depth--) {
      if (!isList(anchor.node(depth))) continue;
      tr.setNodeMarkup(anchor.before(depth), schema.nodes[targetName]);
      changed = true;
      break;
    }
  }
  return changed;
}

export function toggleNoticeList(
  editor: Editor,
  target: 'bulletList' | 'orderedList'
) {
  const current = getNoticeListType(editor.state.selection.$from);
  const chain = editor.chain().focus();
  const { selection, doc } = editor.state;
  if (!selection.empty) {
    const end = doc.resolve(selection.to);
    if (end.parentOffset === 0 && end.depth > 0)
      chain.setTextSelection({ from: selection.from, to: end.before() });
  }
  if (current === target) chain.liftListItem('listItem');
  else if (current)
    chain.command(({ tr, state }) =>
      convertNoticeListSelection(tr, state.schema, target)
    );
  else if (target === 'bulletList') chain.toggleBulletList();
  else chain.toggleOrderedList();
  return chain.run();
}
