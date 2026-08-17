import { useRef } from 'react';

import { X } from 'lucide-react';

import { Button, Dialog, Input, Label, Textarea } from '@/shared/components/ui';

import { MarkdownPreview } from '@/domains/Operation/components';
import type { PopupContent } from '@/domains/Operation/types';

type PopupEditorMode = 'create' | 'edit';

type PopupEditorDialogProps = {
  open: boolean;
  mode: PopupEditorMode;
  popup: PopupContent;
  imagePreviewUrl: string;
  onOpenChange: (open: boolean) => void;
  onPopupChange: (
    field: keyof PopupContent,
    value: PopupContent[keyof PopupContent]
  ) => void;
  onImageAttach: (file: File) => void;
  onImageRemove: () => void;
  onSave: () => void;
};

export function PopupEditorDialog({
  open,
  mode,
  popup,
  imagePreviewUrl,
  onOpenChange,
  onPopupChange,
  onImageAttach,
  onImageRemove,
  onSave,
}: PopupEditorDialogProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageRemove = () => {
    onImageRemove();

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-[760px]'>
        <Dialog.Header>
          <Dialog.Title>
            {mode === 'create' ? '새 팝업 등록' : '팝업 수정'}
          </Dialog.Title>
          <Dialog.Description>
            사용자 홈 화면에 노출할 팝업 콘텐츠와 게시 기간을 입력해 주세요.
          </Dialog.Description>
        </Dialog.Header>

        <div className='flex min-w-0 flex-col gap-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor='popup-start-date' required>
                게시 시작일시
              </Label>
              <Input
                id='popup-start-date'
                type='datetime-local'
                step={60}
                value={popup.startDate}
                onChange={(event) =>
                  onPopupChange('startDate', event.target.value)
                }
              />
            </div>

            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor='popup-end-date' required>
                게시 종료일시
              </Label>
              <Input
                id='popup-end-date'
                type='datetime-local'
                step={60}
                value={popup.endDate}
                onChange={(event) =>
                  onPopupChange('endDate', event.target.value)
                }
              />
            </div>

            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor='popup-display-priority' required>
                노출 우선순위
              </Label>
              <Input
                id='popup-display-priority'
                type='number'
                min={1}
                step={1}
                value={
                  Number.isNaN(popup.displayPriority)
                    ? ''
                    : popup.displayPriority
                }
                aria-describedby='popup-display-priority-description'
                onChange={(event) =>
                  onPopupChange(
                    'displayPriority',
                    event.target.value === ''
                      ? Number.NaN
                      : Number(event.target.value)
                  )
                }
              />
              <p
                id='popup-display-priority-description'
                className='text-xs leading-5 text-gray-500'
              >
                작은 숫자부터 상단에 표시되며, 같은 숫자는 등록일으로
                정렬됩니다.
              </p>
            </div>

            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor='popup-image-file'>이미지 첨부</Label>
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
              <div className='border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex h-9 min-w-0 items-center rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]'>
                <button
                  type='button'
                  className='h-full min-w-0 flex-1 cursor-pointer px-3 text-left text-sm focus-visible:outline-none'
                  aria-label='이미지 첨부'
                  aria-describedby='popup-image-file-description'
                  onClick={() => imageInputRef.current?.click()}
                >
                  <span
                    className={
                      popup.imageFileName
                        ? 'block truncate text-gray-700'
                        : 'block truncate text-gray-500'
                    }
                  >
                    {popup.imageFileName || '클릭하여 이미지를 첨부해 주세요.'}
                  </span>
                </button>
                {popup.imageFileName && (
                  <button
                    type='button'
                    className='mr-3 shrink-0 rounded-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none'
                    aria-label='첨부 이미지 삭제'
                    onClick={handleImageRemove}
                  >
                    <X className='size-4' />
                  </button>
                )}
              </div>
              <p
                id='popup-image-file-description'
                className='text-xs leading-5 text-gray-500'
              >
                첨부한 이미지는 본문 가장 아래에 표시됩니다.
              </p>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex min-w-0 flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='popup-title' required>
                  팝업 제목
                </Label>
                <Input
                  id='popup-title'
                  placeholder='예: [EVENT] 스노로즈 X 브랜드 체험단 이벤트'
                  value={popup.title}
                  onChange={(event) =>
                    onPopupChange('title', event.target.value)
                  }
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Label htmlFor='popup-body-markdown'>본문</Label>
                <Textarea
                  id='popup-body-markdown'
                  className='min-h-[320px] min-w-0'
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
            </div>

            <div className='flex min-w-0 flex-col gap-1'>
              <Label>미리보기</Label>
              <div className='flex min-h-[236px]'>
                <section className='flex w-full flex-col items-start gap-2 self-start rounded-[5px] bg-[#EAF5FD] p-[10px]'>
                  <h3 className='w-full text-[13px] leading-[18.2px] font-medium tracking-[-0.5px] break-words text-[#00368E]'>
                    {popup.title.trim() || '제목을 입력해 주세요.'}
                  </h3>
                  {popup.bodyMarkdown.trim() ? (
                    <MarkdownPreview
                      markdown={popup.bodyMarkdown}
                      className='w-full min-w-0 text-[13px] leading-[18.2px] font-normal tracking-[-0.5px] break-words text-[#484848]'
                    />
                  ) : (
                    <p className='text-[13px] leading-[18.2px] font-normal tracking-[-0.5px] text-[#484848]'>
                      본문 미리보기가 여기에 표시됩니다.
                    </p>
                  )}
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt={popup.imageFileName || '팝업 이미지'}
                      className='w-full rounded-[5px] object-cover'
                    />
                  )}
                </section>
              </div>
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
