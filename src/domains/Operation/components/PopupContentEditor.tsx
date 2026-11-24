import { useRef } from 'react';

import { Bold, Link, List, ListOrdered } from 'lucide-react';

import { Button, Textarea } from '@/shared/components/ui';

type Props = {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

type Format = 'bold' | 'link' | 'bullet' | 'ordered';

export function PopupContentEditor({
  id,
  value,
  disabled = false,
  onChange,
}: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const format = (kind: Format) => {
    const field = input.current;
    if (!field || disabled) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end);
    let from = start;
    let to = end;
    let replacement = '';
    let selectionStart = start;
    let selectionEnd = end;
    if (kind === 'bold') {
      if (
        selected.startsWith('**') &&
        selected.endsWith('**') &&
        selected.length >= 4
      ) {
        replacement = selected.slice(2, -2);
        selectionEnd = start + replacement.length;
      } else if (
        value.slice(start - 2, start) === '**' &&
        value.slice(end, end + 2) === '**'
      ) {
        from -= 2;
        to += 2;
        replacement = selected;
        selectionStart = from;
        selectionEnd = from + selected.length;
      } else {
        replacement = `**${selected}**`;
        selectionStart = start + 2;
        selectionEnd = selectionStart + selected.length;
      }
    } else if (kind === 'link') {
      const text = selected || '링크 텍스트';
      replacement = `[${text}](주소)`;
      selectionStart = start + text.length + 3;
      selectionEnd = selectionStart + 2;
    } else {
      from = value.lastIndexOf('\n', start - 1) + 1;
      const lastLineEnd = value.indexOf('\n', Math.max(start, end - 1));
      to = lastLineEnd < 0 ? value.length : lastLineEnd;
      const lines = value.slice(from, to).split('\n');
      const marker = kind === 'bullet' ? /^- / : /^\d+\. /;
      const remove = lines.every((line) => marker.test(line));
      replacement = lines
        .map((line, index) => {
          const text = line.replace(/^(?:- |\d+\. )/, '');
          return remove
            ? text
            : `${kind === 'bullet' ? '-' : `${index + 1}.`} ${text}`;
        })
        .join('\n');
      selectionStart = from;
      selectionEnd = from + replacement.length;
    }
    onChange(value.slice(0, from) + replacement + value.slice(to));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  return (
    <div className='min-w-0 rounded-md border'>
      <div
        role='group'
        aria-label='본문 서식'
        className='flex flex-wrap gap-1 border-b p-1'
      >
        {[
          { label: '굵게 (⌘/Ctrl+B)', icon: Bold, kind: 'bold' },
          { label: '글머리 기호 목록', icon: List, kind: 'bullet' },
          { label: '번호 목록', icon: ListOrdered, kind: 'ordered' },
          { label: '링크 (⌘/Ctrl+K)', icon: Link, kind: 'link' },
        ].map(({ label, icon: Icon, kind }) => (
          <Button
            key={kind}
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label={label}
            title={label}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => format(kind as Format)}
          >
            <Icon className='size-4' aria-hidden='true' />
          </Button>
        ))}
      </div>
      <Textarea
        ref={input}
        id={id}
        aria-label='본문'
        aria-describedby={`${id}-help`}
        value={value}
        disabled={disabled}
        className='field-sizing-fixed min-h-80 resize-y rounded-t-none border-0 font-mono text-[14px] shadow-none md:text-[14px]'
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            !(event.metaKey || event.ctrlKey) ||
            event.altKey ||
            event.nativeEvent.isComposing
          )
            return;
          const key = event.key.toLowerCase();
          if (key === 'b' || key === 'k') {
            event.preventDefault();
            event.stopPropagation();
            format(key === 'b' ? 'bold' : 'link');
          }
        }}
      />
      <p
        id={`${id}-help`}
        className='border-t px-3 py-2 text-xs break-keep text-gray-500'
      >
        글자를 선택해 서식을 적용하고, 링크는 [글자](주소)로 입력해 주세요.
      </p>
    </div>
  );
}
