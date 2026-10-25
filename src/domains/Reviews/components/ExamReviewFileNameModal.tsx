import { type RefObject, useId, useState } from 'react';

import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

import { Modal } from '@/shared/components/Modal';
import { Button, InputGroup, Label } from '@/shared/components/ui';

import type { RenameExamReviewFileResult } from '@/domains/Reviews/types';

import { renameExamReviewFile } from '@/apis/reviews';

interface ExamReviewFileNameModalProps {
  postId: number;
  currentFileName: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSuccess: (postId: number, result: RenameExamReviewFileResult) => void;
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
  postId,
  currentFileName,
  returnFocusRef,
  onClose,
  onSuccess,
}: ExamReviewFileNameModalProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const extension = getExtension(currentFileName);
  const [newFileName, setNewFileName] = useState(
    extension ? currentFileName.slice(0, -extension.length) : currentFileName
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
    !isSaving &&
    Boolean(trimmedFileName) &&
    fullFileName !== currentFileName &&
    !hasInvalidCharacters;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

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
    setIsSaving(true);
    setErrorMessage('');
    try {
      const result = await renameExamReviewFile(postId, fullFileName);
      onSuccess(postId, result);
      onClose();
    } catch (error: unknown) {
      setErrorMessage(
        (isAxiosError<{ message?: string }>(error) &&
          error.response?.data?.message) ||
          '파일명 변경에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open
      onOpenChange={(open) => !open && !isSaving && onClose()}
      title='파일명 변경'
      subtitle='파일명은 다른 정보와 별도로 변경 즉시 저장됩니다.'
      className='sm:max-w-md'
      closeDisabled={isSaving}
      contentProps={{
        onCloseAutoFocus: (event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        },
      }}
    >
      <form
        onSubmit={handleSubmit}
        className='min-h-0 space-y-4 overflow-y-auto px-6 pb-6'
      >
        <div className='space-y-1.5'>
          <p className='text-sm font-medium'>현재 파일명</p>
          <p className='rounded-md border bg-gray-50 px-3 py-2 text-sm break-all text-gray-700'>
            {currentFileName}
          </p>
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor={inputId}>새 파일명</Label>
          <InputGroup data-disabled={isSaving}>
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
              disabled={isSaving}
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
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button type='submit' disabled={!canSubmit}>
            {isSaving && <Loader2 className='animate-spin' />}
            {isSaving ? '변경 중' : '파일명 변경'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
