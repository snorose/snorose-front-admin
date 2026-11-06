import { type Editor, useEditorState } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  ChevronDown,
  Hash,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from 'lucide-react';

import { Button, DropdownMenu, Separator } from '@/shared/components/ui';

import {
  NOTICE_HIGHLIGHT_COLORS,
  NOTICE_TEXT_COLORS,
} from '../constants/editor';
import { normalizeNoticeColor } from '../utils/content';
import { getNoticeListType, toggleNoticeList } from '../utils/editor-lists';

interface NoticeEditorToolbarProps {
  editor: Editor | null;
  onOpenLink: () => void;
}

export default function NoticeEditorToolbar({
  editor,
  onOpenLink,
}: NoticeEditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            heading: current.isActive('heading', { level: 1 })
              ? 'heading'
              : 'paragraph',
            color: current.getAttributes('textStyle').color ?? '',
            highlight: current.getAttributes('textStyle').backgroundColor ?? '',
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            strike: current.isActive('strike'),
            left:
              current.isActive({ textAlign: 'left' }) ||
              (!current.getAttributes('paragraph').textAlign &&
                !current.getAttributes('heading').textAlign),
            center: current.isActive({ textAlign: 'center' }),
            right: current.isActive({ textAlign: 'right' }),
            list: getNoticeListType(current.state.selection.$from),
            listFormat: current.getAttributes('orderedList').type ?? '1',
            link: current.isActive('link'),
          }
        : null,
  });
  const refocus = (event: Event) => {
    event.preventDefault();
    if (editor && !editor.isDestroyed) editor.commands.focus();
  };
  const colorMenu = (highlight: boolean) => {
    const colors = highlight ? NOTICE_HIGHLIGHT_COLORS : NOTICE_TEXT_COLORS;
    const active = highlight ? state?.highlight : state?.color;
    const selected =
      colors.find(
        (color) =>
          normalizeNoticeColor(color.value) ===
          normalizeNoticeColor(active ?? '')
      )?.value ?? '';
    const Icon = highlight ? Highlighter : Baseline;
    const label = highlight ? '형광펜' : '글자색';
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            type='button'
            variant={active ? 'secondary' : 'ghost'}
            size='icon-sm'
            disabled={!editor}
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Icon
              className='size-4'
              style={{ color: active || undefined }}
              aria-hidden='true'
            />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align='start'
          aria-label={`${label} 선택`}
          onCloseAutoFocus={refocus}
        >
          <DropdownMenu.RadioGroup
            value={selected}
            onValueChange={(value) => {
              if (!editor) return;
              if (highlight) {
                if (value)
                  editor.chain().focus().setBackgroundColor(value).run();
                else editor.chain().focus().unsetBackgroundColor().run();
              } else {
                if (value) editor.chain().focus().setColor(value).run();
                else editor.chain().focus().unsetColor().run();
              }
            }}
          >
            <DropdownMenu.RadioItem value=''>
              {label} 없음
            </DropdownMenu.RadioItem>
            {colors.map((color) => (
              <DropdownMenu.RadioItem key={color.value} value={color.value}>
                <span
                  className='size-4 rounded-sm border border-gray-200'
                  style={{ backgroundColor: color.value }}
                  aria-hidden='true'
                />
                {label} {color.label}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  };
  const groups = [
    [
      {
        label: '굵게',
        icon: Bold,
        active: state?.bold,
        run: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: '기울임',
        icon: Italic,
        active: state?.italic,
        run: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: '밑줄',
        icon: Underline,
        active: state?.underline,
        run: () => editor?.chain().focus().toggleUnderline().run(),
      },
      {
        label: '취소선',
        icon: Strikethrough,
        active: state?.strike,
        run: () => editor?.chain().focus().toggleStrike().run(),
      },
    ],
    [
      {
        label: '왼쪽 정렬',
        icon: AlignLeft,
        active: state?.left,
        run: () => editor?.chain().focus().setTextAlign('left').run(),
      },
      {
        label: '가운데 정렬',
        icon: AlignCenter,
        active: state?.center,
        run: () => editor?.chain().focus().setTextAlign('center').run(),
      },
      {
        label: '오른쪽 정렬',
        icon: AlignRight,
        active: state?.right,
        run: () => editor?.chain().focus().setTextAlign('right').run(),
      },
    ],
    [
      {
        label: '글머리 기호 목록',
        icon: List,
        active: state?.list === 'bulletList',
        run: () => editor && toggleNoticeList(editor, 'bulletList'),
      },
      {
        label: '번호 목록',
        icon: ListOrdered,
        active: state?.list === 'orderedList',
        run: () => editor && toggleNoticeList(editor, 'orderedList'),
      },
    ],
    [
      { label: '링크', icon: Link2, active: state?.link, run: onOpenLink },
      {
        label: '해시태그',
        icon: Hash,
        active: false,
        run: () => editor?.chain().focus().insertContent('#').run(),
      },
    ],
  ];
  return (
    <div
      role='group'
      aria-label='본문 서식'
      className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-y border-gray-200 bg-gray-50 px-4 py-3'
    >
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            disabled={!editor}
            aria-label='문단 형식'
            onMouseDown={(event) => event.preventDefault()}
          >
            {state?.heading === 'heading' ? '소제목' : '본문'}
            <ChevronDown className='size-3.5' />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align='start' onCloseAutoFocus={refocus}>
          <DropdownMenu.RadioGroup
            value={state?.heading ?? 'paragraph'}
            onValueChange={(value) => {
              if (value === 'heading')
                editor?.chain().focus().setHeading({ level: 1 }).run();
              else editor?.chain().focus().setParagraph().run();
            }}
          >
            <DropdownMenu.RadioItem value='paragraph'>
              본문
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='heading'>
              소제목
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      {colorMenu(false)}
      {colorMenu(true)}
      {groups.map((group, index) => (
        <div key={index} className='flex shrink-0 items-center gap-1'>
          <Separator orientation='vertical' className='mx-1 h-5 self-center' />
          {group.map((action) => (
            <Button
              key={action.label}
              type='button'
              variant={action.active ? 'secondary' : 'ghost'}
              size='icon-sm'
              disabled={!editor}
              aria-label={action.label}
              title={action.label}
              aria-pressed={!!action.active}
              className={
                action.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
              }
              onMouseDown={(event) => event.preventDefault()}
              onClick={action.run}
            >
              <action.icon className='size-4' aria-hidden='true' />
            </Button>
          ))}
          {index === 2 && (
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-label='번호 형식'
                  title='번호 형식'
                  disabled={!editor}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <ChevronDown className='size-3.5' />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align='start' onCloseAutoFocus={refocus}>
                <DropdownMenu.RadioGroup
                  value={state?.listFormat ?? '1'}
                  onValueChange={(value) => {
                    if (!editor) return;
                    const chain = editor.chain().focus();
                    if (state?.list !== 'orderedList')
                      chain.toggleOrderedList();
                    chain
                      .updateAttributes('orderedList', {
                        type: value,
                        start: 1,
                      })
                      .run();
                  }}
                >
                  <DropdownMenu.RadioItem value='1'>
                    숫자 (1, 2, 3)
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value='a'>
                    알파벳 (a, b, c)
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value='i'>
                    로마 숫자 (i, ii, iii)
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  );
}
