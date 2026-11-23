import { type RefObject, useRef } from 'react';

import { InputGroup } from '@/shared/components/ui';

interface Props {
  id: string;
  file?: File;
  buttonLabel?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange: (file: File) => void;
}

export function MaintenanceImageInput({
  id,
  file,
  inputRef,
  onChange,
  buttonLabel = '이미지 업로드',
}: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

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
        className='min-w-0 flex-1 truncate pr-2 text-sm text-gray-500'
        title={file?.name}
        aria-live='polite'
      >
        {file?.name ?? '선택된 파일이 없습니다.'}
      </p>
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
