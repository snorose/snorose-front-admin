import { type AriaAttributes, useId, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { InputGroup, Popover } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

interface EditableMinuteInputProps
  extends Pick<AriaAttributes, 'aria-describedby' | 'aria-invalid'> {
  label: string;
  value: string;
  suggestions: readonly string[];
  disabled: boolean;
  onValueChange: (minute: string) => void;
}

// 분은 0~59 직접 입력과 간격별 빠른 선택을 함께 지원합니다.
export function EditableMinuteInput({
  label,
  value,
  suggestions,
  disabled,
  onValueChange,
  ...accessibilityProps
}: EditableMinuteInputProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const isOpen = open && !disabled;
  const select = (minute: string) => {
    if (disabled) return;
    onValueChange(minute);
    setDraft(null);
    inputRef.current?.focus();
    setOpen(false);
    setActive(-1);
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <InputGroup
          ref={groupRef}
          className='bg-background min-w-[5.5rem] flex-1'
        >
          <InputGroup.Input
            ref={inputRef}
            role='combobox'
            aria-label={label}
            aria-haspopup='listbox'
            aria-expanded={isOpen}
            aria-controls={isOpen ? listId : undefined}
            aria-autocomplete='list'
            aria-activedescendant={
              isOpen && active >= 0 ? `${listId}-${active}` : undefined
            }
            {...accessibilityProps}
            inputMode='numeric'
            maxLength={2}
            disabled={disabled}
            placeholder='분'
            value={draft ?? value}
            onFocus={() => {
              setOpen(true);
              setActive(-1);
            }}
            onBlur={() => setDraft(null)}
            onChange={(event) => {
              const next = event.target.value;
              if (!/^\d{0,2}$/.test(next) || Number(next) > 59) return;
              setDraft(next);
              setActive(-1);
              if (next) onValueChange(next.padStart(2, '0'));
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
                setActive((previous) =>
                  event.key === 'ArrowDown'
                    ? (previous + 1) % suggestions.length
                    : (previous <= 0 ? suggestions.length : previous) - 1
                );
              } else if (isOpen && ['Home', 'End'].includes(event.key)) {
                event.preventDefault();
                setActive(event.key === 'Home' ? 0 : suggestions.length - 1);
              } else if (event.key === 'Enter') {
                event.preventDefault();
                if (isOpen && active >= 0) select(suggestions[active]);
                else {
                  setDraft(null);
                  setOpen(false);
                }
              } else if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              } else if (event.key === 'Tab') setOpen(false);
            }}
          />
          <InputGroup.Addon
            align='inline-end'
            className='pr-1 has-[>button]:mr-0'
          >
            <Popover.Trigger asChild>
              <InputGroup.Button
                type='button'
                size='icon-xs'
                variant='ghost'
                disabled={disabled}
                aria-label={`${label} 목록 열기`}
              >
                <ChevronDown className='size-4' aria-hidden='true' />
              </InputGroup.Button>
            </Popover.Trigger>
          </InputGroup.Addon>
        </InputGroup>
      </Popover.Anchor>
      <Popover.Content
        id={listId}
        role='listbox'
        aria-label={`${label} 선택`}
        align='start'
        className='grid w-48 grid-cols-3 gap-1 p-1'
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          // 입력창은 Trigger 버튼 밖에 있지만 동일한 콤보박스의 일부입니다.
          if (groupRef.current?.contains(event.target as Node))
            event.preventDefault();
        }}
      >
        {suggestions.map((minute, index) => (
          <button
            key={minute}
            id={`${listId}-${index}`}
            type='button'
            role='option'
            aria-selected={value === minute}
            tabIndex={-1}
            disabled={disabled}
            className={cn(
              'hover:bg-accent min-h-8 rounded-sm px-2 py-1.5 text-sm',
              value === minute && 'font-semibold',
              active === index && 'bg-accent'
            )}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => select(minute)}
          >
            {Number(minute)}분
          </button>
        ))}
      </Popover.Content>
    </Popover>
  );
}
