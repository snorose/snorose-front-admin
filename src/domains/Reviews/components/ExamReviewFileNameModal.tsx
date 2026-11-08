import { type RefObject, useId, useState } from 'react';

import { Button, Dialog, InputGroup, Label } from '@/shared/components/ui';

interface ExamReviewFileNameModalProps {
  currentFileName: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onApply: (fileName: string) => void;
}

const INVALID_FILE_NAME_CHARACTERS = [
  '\\',
  '/',
  ':',
  '*',
  '?',
  '"',
  '<',
  '>',
  '|',
  '[',
  ']',
];
const INVALID_FILE_NAME_CHARACTERS_TEXT =
  INVALID_FILE_NAME_CHARACTERS.join(', ');

const getExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > 0 ? fileName.slice(lastDot) : '';
};

export function ExamReviewFileNameModal({
  currentFileName,
  returnFocusRef,
  onClose,
  onApply,
}: ExamReviewFileNameModalProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const extension = getExtension(currentFileName);
  const [newFileName, setNewFileName] = useState(
    extension ? currentFileName.slice(0, -extension.length) : currentFileName
  );
  const [errorMessage, setErrorMessage] = useState('');
  const trimmedFileName = newFileName.trim();
  const fullFileName = `${trimmedFileName}${extension}`;
  const hasInvalidCharacters = INVALID_FILE_NAME_CHARACTERS.some((character) =>
    trimmedFileName.includes(character)
  );
  const invalidCharacterErrorMessage = hasInvalidCharacters
    ? `파일명에 ${INVALID_FILE_NAME_CHARACTERS_TEXT}는 사용할 수 없습니다.`
    : '';
  const visibleErrorMessage = invalidCharacterErrorMessage || errorMessage;
  const canSubmit =
    Boolean(trimmedFileName) &&
    fullFileName !== currentFileName &&
    !hasInvalidCharacters;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedFileName) {
      setErrorMessage('파일명을 입력해주세요.');
      return;
    }
    if (fullFileName === currentFileName) {
      setErrorMessage('현재 파일명과 다른 이름을 입력해주세요.');
      return;
    }
    if (hasInvalidCharacters) {
      setErrorMessage(invalidCharacterErrorMessage);
      return;
    }
    onApply(fullFileName);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        className='sm:max-w-md'
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>파일명 변경</Dialog.Title>
          <Dialog.Description>
            적용한 파일명은 편집 모드에서 저장을 눌러야 반영됩니다.
          </Dialog.Description>
        </Dialog.Header>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1.5'>
            <p className='text-sm font-medium'>현재 파일명</p>
            <p className='rounded-md border bg-gray-50 px-3 py-2 text-sm break-all text-gray-700'>
              {currentFileName}
            </p>
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor={inputId}>새 파일명</Label>
            <InputGroup>
              <InputGroup.Input
                id={inputId}
                value={newFileName}
                onChange={(event) => {
                  setNewFileName(event.target.value);
                  setErrorMessage('');
                }}
                aria-invalid={Boolean(visibleErrorMessage)}
                aria-describedby={
                  visibleErrorMessage ? `${helpId} ${errorId}` : helpId
                }
                autoFocus
              />
              {extension && (
                <InputGroup.Addon align='inline-end' className='shrink-0'>
                  <InputGroup.Text>{extension}</InputGroup.Text>
                </InputGroup.Addon>
              )}
            </InputGroup>
            <p id={helpId} className='text-sm text-gray-500'>
              {extension && `확장자(${extension})는 변경할 수 없습니다. `}
              {INVALID_FILE_NAME_CHARACTERS_TEXT}는 사용할 수 없습니다.
            </p>
            {visibleErrorMessage ? (
              <p id={errorId} role='alert' className='text-sm text-red-600'>
                {visibleErrorMessage}
              </p>
            ) : null}
          </div>
          <Dialog.Footer>
            <Button type='button' variant='outline' onClick={onClose}>
              취소
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              적용
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
