import { useRef } from 'react';

import { Image, X } from 'lucide-react';

import { Button, Dialog, Input, Label, Textarea } from '@/shared/components/ui';

import { MarkdownPreview } from '@/domains/Operation/components';
import type { PopupContent } from '@/domains/Operation/types';

type PopupEditorMode = 'create' | 'edit';

type PopupEditorDialogProps = {
  open: boolean;
  mode: PopupEditorMode;
  popup: PopupContent;
  onOpenChange: (open: boolean) => void;
  onPopupChange: (
    field: keyof PopupContent,
    value: PopupContent[keyof PopupContent]
  ) => void;
  onImageAttach: (file: File) => void;
  onSave: () => void;
};

export function PopupEditorDialog({
  open,
  mode,
  popup,
  onOpenChange,
  onPopupChange,
  onImageAttach,
  onSave,
}: PopupEditorDialogProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageRemove = () => {
    onPopupChange('imageFileName', '');

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='max-h-[90vh] overflow-y-auto sm:max-w-[760px]'>
        <Dialog.Header>
          <Dialog.Title>
            {mode === 'create' ? '새 팝업 등록' : '팝업 수정'}
          </Dialog.Title>
          <Dialog.Description>
            사용자 홈 화면에 노출할 팝업 콘텐츠와 게시 기간을 입력해 주세요.
          </Dialog.Description>
        </Dialog.Header>

        <div className='flex flex-col gap-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='popup-start-date' required>
                게시 시작일
              </Label>
              <Input
                id='popup-start-date'
                type='date'
                value={popup.startDate}
                onChange={(event) =>
                  onPopupChange('startDate', event.target.value)
                }
              />
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='popup-end-date' required>
                게시 종료일
              </Label>
              <Input
                id='popup-end-date'
                type='date'
                value={popup.endDate}
                onChange={(event) =>
                  onPopupChange('endDate', event.target.value)
                }
              />
            </div>

            <div className='flex flex-col gap-1 md:col-span-2'>
              <Label htmlFor='popup-title' required>
                팝업 제목
              </Label>
              <Input
                id='popup-title'
                placeholder='예: [EVENT] 스노로즈 X 브랜드 체험단 이벤트'
                value={popup.title}
                onChange={(event) => onPopupChange('title', event.target.value)}
              />
            </div>

            <div className='grid gap-3 md:col-span-2 md:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='popup-body-markdown'>본문</Label>
                <Textarea
                  id='popup-body-markdown'
                  placeholder={`본문을 입력해 주세요.

**굵게 표시할 문장**

1. 숫자 리스트
2. 숫자 리스트

- 순서 없는 리스트
- 순서 없는 리스트

[외부 링크](https://naver.com)
[내부 링크](/board/notice/post/123)`}
                  value={popup.bodyMarkdown}
                  rows={10}
                  onChange={(event) =>
                    onPopupChange('bodyMarkdown', event.target.value)
                  }
                />
              </div>
              <div className='flex flex-col gap-1'>
                <Label>미리보기</Label>
                <div className='bg-background min-h-[236px] rounded-md border px-3 py-2'>
                  {popup.bodyMarkdown.trim() ? (
                    <MarkdownPreview markdown={popup.bodyMarkdown} />
                  ) : (
                    <p className='text-sm text-gray-500'>
                      본문 미리보기가 여기에 표시됩니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2 md:col-span-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor='popup-image-file'>이미지 첨부</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2'
                asChild
              >
                <Label htmlFor='popup-image-file'>
                  <Image className='size-4' />
                  이미지 선택
                </Label>
              </Button>
            </div>
            <div className='flex flex-col gap-3'>
              <Input
                ref={imageInputRef}
                id='popup-image-file'
                type='file'
                accept='image/*'
                className='sr-only'
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onImageAttach(file);
                  }
                }}
              />
              {popup.imageFileName ? (
                <div className='bg-background flex min-h-9 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm text-gray-700'>
                  <span className='min-w-0 truncate'>
                    {popup.imageFileName}
                  </span>
                  <button
                    type='button'
                    className='shrink-0 rounded-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:outline-none'
                    aria-label='첨부 이미지 삭제'
                    onClick={handleImageRemove}
                  >
                    <X className='size-4' />
                  </button>
                </div>
              ) : (
                <div className='bg-background flex min-h-9 items-center rounded-md border px-3 py-2 text-sm text-gray-500'>
                  첨부된 이미지가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog.Footer>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type='button' onClick={onSave}>
            저장 후 반영
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
