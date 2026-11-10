import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';

import { StatusBadge } from '@/shared/components';
import {
  Button,
  ConfirmModal,
  Dialog,
  Input,
  Label,
  Select,
  Textarea,
} from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils';

import { FAQ_CATEGORIES, FAQ_CATEGORY_TONES } from '../constants/categories';
import type { Faq, FaqInput } from '../types';

interface FaqEditorDialogProps {
  faq: Faq | null;
  isSaving: boolean;
  onSave: (input: FaqInput) => Promise<void>;
  onSaved: () => void;
  onClose: () => void;
}

export function FaqEditorDialog({
  faq,
  isSaving,
  onSave,
  onSaved,
  onClose,
}: FaqEditorDialogProps) {
  const [initialInput] = useState<FaqInput>(() => ({
    category: faq?.faqCategory ?? '',
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
  }));
  const [input, setInput] = useState(initialInput);
  const [error, setError] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const submitting = useRef(false);
  const navigationAllowed = useRef(false);
  const categories: readonly string[] =
    faq?.faqCategory &&
    !FAQ_CATEGORIES.some((category) => category === faq.faqCategory)
      ? [faq.faqCategory, ...FAQ_CATEGORIES]
      : FAQ_CATEGORIES;
  const dirty = Object.keys(initialInput).some(
    (key) =>
      input[key as keyof FaqInput] !== initialInput[key as keyof FaqInput]
  );
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !navigationAllowed.current &&
      (dirty || isSaving || submitting.current) &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
  );
  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;

  useEffect(() => {
    if (!dirty && !isSaving) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (navigationAllowed.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, isSaving]);

  const requestClose = () => {
    if (isSaving || submitting.current) return;
    if (dirty) setDiscardOpen(true);
    else onClose();
  };

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <Dialog.Content
          className='max-h-[90dvh] overflow-y-auto sm:max-w-2xl'
          showCloseButton={!isSaving}
        >
          <Dialog.Header>
            <Dialog.Title>{faq ? 'FAQ 수정' : 'FAQ 작성'}</Dialog.Title>
            <Dialog.Description>
              자주 묻는 질문의 분류와 제목, 내용을 입력해 주세요.
            </Dialog.Description>
          </Dialog.Header>
          <form
            className='flex min-w-0 flex-col gap-5'
            onSubmit={async (event) => {
              event.preventDefault();
              if (isSaving || submitting.current) return;
              if (
                !input.category.trim() ||
                !input.question.trim() ||
                !input.answer.trim()
              ) {
                setError('분류, 제목, 내용을 모두 입력해 주세요.');
                return;
              }
              submitting.current = true;
              setError('');
              try {
                await onSave({
                  ...input,
                  category: input.category.trim(),
                  question: input.question.trim(),
                });
                navigationAllowed.current = true;
                if (blockerRef.current.state === 'blocked')
                  blockerRef.current.reset();
                onSaved();
              } catch (saveError) {
                setError(
                  getErrorMessage(
                    saveError,
                    'FAQ 저장에 실패했습니다. 다시 시도해 주세요.'
                  )
                );
              } finally {
                submitting.current = false;
              }
            }}
          >
            <fieldset
              disabled={isSaving}
              className='flex min-w-0 flex-col gap-5'
            >
              <div className='flex flex-col gap-1'>
                <Label htmlFor='faq-category' required>
                  분류
                </Label>
                <Select
                  value={input.category}
                  disabled={isSaving}
                  onValueChange={(category) => setInput({ ...input, category })}
                >
                  <Select.Trigger
                    id='faq-category'
                    className='w-full'
                    aria-required='true'
                  >
                    <Select.Value placeholder='분류를 선택해 주세요.' />
                  </Select.Trigger>
                  <Select.Content>
                    {categories.map((category) => (
                      <Select.Item
                        key={category}
                        value={category}
                        textValue={category}
                      >
                        <StatusBadge
                          tone={FAQ_CATEGORY_TONES[category] ?? 'neutral'}
                        >
                          {category}
                        </StatusBadge>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='faq-question' required>
                  제목
                </Label>
                <Input
                  id='faq-question'
                  placeholder='제목을 입력해 주세요.'
                  value={input.question}
                  onChange={(event) =>
                    setInput({ ...input, question: event.target.value })
                  }
                  required
                />
              </div>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='faq-answer' required>
                  내용
                </Label>
                <Textarea
                  id='faq-answer'
                  className='min-h-64'
                  placeholder='내용을 입력해 주세요.'
                  value={input.answer}
                  onChange={(event) =>
                    setInput({ ...input, answer: event.target.value })
                  }
                  required
                />
              </div>
            </fieldset>
            {error && (
              <p role='alert' className='text-sm text-red-600'>
                {error}
              </p>
            )}
            <Dialog.Footer>
              <Button
                type='button'
                variant='outline'
                disabled={isSaving}
                onClick={requestClose}
              >
                취소
              </Button>
              <Button type='submit' disabled={isSaving}>
                {isSaving ? '저장 중…' : faq ? '수정사항 저장' : 'FAQ 등록'}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
      <ConfirmModal
        isOpen={discardOpen || blocker.state === 'blocked'}
        title='작성을 취소하시겠습니까?'
        description='저장하지 않은 내용은 사라집니다.'
        confirmText='작성 취소'
        closeText='계속 작성'
        isPending={isSaving || submitting.current}
        onConfirm={() => {
          if (isSaving || submitting.current) return;
          navigationAllowed.current = true;
          if (blocker.state === 'blocked') blocker.proceed();
          onClose();
        }}
        onClose={() => {
          setDiscardOpen(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
      />
    </>
  );
}
