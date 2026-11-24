import { type RefObject, useRef } from 'react';

import { X } from 'lucide-react';

import { Button, InputGroup } from '@/shared/components/ui';

interface Props {
  id: string;
  file?: File;
  fileName?: string;
  buttonLabel?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange: (file: File) => void;
  onRemove?: () => void;
}

export function MaintenanceImageInput({
  id,
  file,
  fileName,
  inputRef,
  onChange,
  onRemove,
  buttonLabel = '이미지 업로드',
}: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  const name = file?.name ?? fileName;

  return (
    <InputGroup className='max-w-full min-w-0 overflow-hidden'>
      <InputGroup.Button
        type='button'
        variant='default'
        size='xs'
        className='mx-1 shrink-0'
        onClick={() => ref.current?.click()}
      >
        {buttonLabel}
      </InputGroup.Button>
      <p
        className='min-w-0 flex-1 truncate pr-2 pl-1 text-sm text-gray-500'
        title={name}
        aria-live='polite'
      >
        {name || '선택된 이미지 없음'}
      </p>
      {name && onRemove && (
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='mr-1 shrink-0 text-gray-500 hover:text-gray-700'
          aria-label='첨부 이미지 삭제'
          onClick={() => {
            if (ref.current) ref.current.value = '';
            onRemove();
          }}
        >
          <X className='size-4' aria-hidden='true' />
        </Button>
      )}
      <input
        ref={ref}
        id={id}
        type='file'
        accept='image/*'
        className='hidden'
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onChange(selected);
        }}
      />
    </InputGroup>
  );
}
