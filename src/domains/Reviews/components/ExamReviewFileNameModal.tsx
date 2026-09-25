import { type RefObject, useState } from 'react';

import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

import { Button, Dialog, Input, Label } from '@/shared/components/ui';

import type { RenameExamReviewFileResult } from '@/domains/Reviews/types';

import { renameExamReviewFile } from '@/apis/reviews';

interface ExamReviewFileNameModalProps {
  postId: number;
  currentFileName: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSuccess: (postId: number, result: RenameExamReviewFileResult) => void;
}

const INVALID_FILE_NAME_CHARACTERS = /[\\/:*?"<>|[\]]/;

const getExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > 0 ? fileName.slice(lastDot).toLowerCase() : '';
};

export function ExamReviewFileNameModal({
  postId,
  currentFileName,
  returnFocusRef,
  onClose,
  onSuccess,
}: ExamReviewFileNameModalProps) {
  const [newFileName, setNewFileName] = useState(currentFileName);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const trimmedFileName = newFileName.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (!trimmedFileName) {
      setErrorMessage('파일명을 입력해주세요.');
      return;
    }
    if (trimmedFileName === currentFileName) {
      setErrorMessage('현재 파일명과 다른 이름을 입력해주세요.');
      return;
    }
    if (INVALID_FILE_NAME_CHARACTERS.test(trimmedFileName)) {
      setErrorMessage(
        '파일명에 \\, /, :, *, ?, ", <, >, |, [, ]는 사용할 수 없습니다.'
      );
      return;
    }
    if (getExtension(trimmedFileName) !== getExtension(currentFileName)) {
      setErrorMessage('기존 파일의 확장자를 유지해주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      const result = await renameExamReviewFile(postId, trimmedFileName);
      onSuccess(postId, result);
      onClose();
    } catch (error: unknown) {
      setErrorMessage(
        (isAxiosError<{ message?: string }>(error) &&
          error.response?.data?.message) ||
          '파일명 수정에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <Dialog.Content
        className='sm:max-w-md'
        showCloseButton={!isSaving}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>파일명 수정</Dialog.Title>
          <Dialog.Description>
            파일 내용은 유지하고 이름만 수정합니다.
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
            <Label htmlFor='exam-review-new-file-name'>새 파일명</Label>
            <Input
              id='exam-review-new-file-name'
              value={newFileName}
              onChange={(event) => {
                setNewFileName(event.target.value);
                setErrorMessage('');
              }}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={
                errorMessage
                  ? 'exam-review-file-name-error'
                  : 'exam-review-file-name-help'
              }
              autoFocus
              disabled={isSaving}
            />
            {errorMessage ? (
              <p
                id='exam-review-file-name-error'
                role='alert'
                className='text-sm text-red-600'
              >
                {errorMessage}
              </p>
            ) : (
              <p
                id='exam-review-file-name-help'
                className='text-sm text-gray-500'
              >
                확장자를 유지해주세요. \\, /, :, *, ?, ", &lt;, &gt;, |, [, ]는
                사용할 수 없습니다.
              </p>
            )}
          </div>
          <Dialog.Footer>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type='submit'
              disabled={
                isSaving ||
                !trimmedFileName ||
                trimmedFileName === currentFileName
              }
            >
              {isSaving && <Loader2 className='animate-spin' />}
              {isSaving ? '수정 중' : '파일명 수정'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
