import { useRef, useState } from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button, InputGroup } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

/** 항목명 끝 글자의 받침에 따라 조사 '이/가'를 고른다. */
function getSubjectParticle(label: string) {
  const lastCharacter = label
    .trim()
    .replace(/[)\]]+$/, '')
    .slice(-1);
  const code = lastCharacter.charCodeAt(0);
  const hasFinalConsonant =
    code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? '이' : '가';
}

export type CopyableValueProps = {
  value: string | number | null | undefined;
  label: string;
  /** 표시용 값. 복사는 항상 value를 사용한다. */
  displayValue?: string | number;
  className?: string;
  variant?: 'inline' | 'input';
  /** 입력형에서 외부 label의 htmlFor와 연결할 ID. */
  id?: string;
};

/**
 * 값 표시와 복사 버튼, 복사 결과 토스트를 제공한다.
 *
 * - inline(기본): 텍스트 옆에 복사 버튼
 * - input: 실제 읽기 전용 입력과 오른쪽 복사 버튼
 */
export function CopyableValue({
  value,
  label,
  displayValue,
  className,
  variant = 'inline',
  id,
}: CopyableValueProps) {
  const [isCopying, setIsCopying] = useState(false);
  const isCopyingRef = useRef(false);
  const copyValue = value == null ? '' : String(value);
  const hasValue = copyValue.trim().length > 0;

  const handleCopy = async () => {
    if (!hasValue || isCopyingRef.current) return;

    isCopyingRef.current = true;
    setIsCopying(true);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(copyValue);
      toast.success(`${label}${getSubjectParticle(label)} 복사되었습니다.`);
    } catch {
      toast.error(`${label} 복사에 실패했습니다.`);
    } finally {
      isCopyingRef.current = false;
      setIsCopying(false);
    }
  };

  const copyButton = (
    <Button
      type='button'
      variant='ghost'
      size='icon-sm'
      disabled={!hasValue || isCopying}
      aria-label={`${label} 복사`}
      title={`${label} 복사`}
      aria-busy={isCopying}
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy();
      }}
    >
      <Copy className='size-3.5' aria-hidden='true' />
    </Button>
  );

  if (variant === 'input') {
    return (
      <InputGroup className={cn('bg-muted', className)}>
        <InputGroup.Input
          id={id}
          aria-label={id ? undefined : label}
          value={hasValue ? (displayValue ?? copyValue) : '-'}
          title={hasValue ? copyValue : undefined}
          readOnly
        />
        <InputGroup.Addon align='inline-end'>{copyButton}</InputGroup.Addon>
      </InputGroup>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-2 align-middle text-sm',
        className
      )}
    >
      <span
        className='min-w-0 truncate select-text'
        title={hasValue ? copyValue : undefined}
      >
        {hasValue ? (displayValue ?? copyValue) : '-'}
      </span>
      {copyButton}
    </span>
  );
}
