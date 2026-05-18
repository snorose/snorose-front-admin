import { Image, Plus, Trash2 } from 'lucide-react';

import {
  Button,
  Dialog,
  Input,
  Label,
  Select,
  Textarea,
} from '@/shared/components/ui';

import type { PopupContent, PopupLink } from '@/domains/Operation/types';

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
  onContentListChange: (index: number, value: string) => void;
  onLinkChange: (
    index: number,
    field: keyof PopupLink,
    value: PopupLink[keyof PopupLink]
  ) => void;
  onSave: () => void;
};

export function PopupEditorDialog({
  open,
  mode,
  popup,
  onOpenChange,
  onPopupChange,
  onContentListChange,
  onLinkChange,
  onSave,
}: PopupEditorDialogProps) {
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

            <div className='flex flex-col gap-1 md:col-span-2'>
              <Label htmlFor='popup-description'>설명</Label>
              <Textarea
                id='popup-description'
                placeholder='팝업 제목 아래에 노출할 짧은 설명'
                value={popup.description}
                rows={3}
                onChange={(event) =>
                  onPopupChange('description', event.target.value)
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <Label>본문 리스트</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() =>
                  onPopupChange('contentList', [...popup.contentList, ''])
                }
              >
                <Plus className='size-4' />
                항목 추가
              </Button>
            </div>
            {popup.contentList.map((content, index) => (
              <div key={index} className='flex gap-2'>
                <Input
                  aria-label={`본문 항목 ${index + 1}`}
                  value={content}
                  onChange={(event) =>
                    onContentListChange(index, event.target.value)
                  }
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label='본문 항목 삭제'
                  disabled={index === 0}
                  onClick={() =>
                    onPopupChange(
                      'contentList',
                      popup.contentList.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    )
                  }
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-1 md:col-span-2'>
            <Label htmlFor='popup-image-url'>이미지 경로</Label>
            <div className='flex gap-2'>
              <Input
                id='popup-image-url'
                placeholder='예: /images/popup/event.png'
                value={popup.imageUrl}
                onChange={(event) =>
                  onPopupChange('imageUrl', event.target.value)
                }
              />
              <Button type='button' variant='outline' className='gap-2'>
                <Image className='size-4' />
                이미지 선택
              </Button>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <Label>링크</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() =>
                  onPopupChange('links', [
                    ...popup.links,
                    { title: '', url: '', isExternal: false },
                  ])
                }
              >
                <Plus className='size-4' />
                링크 추가
              </Button>
            </div>
            {popup.links.length > 0 ? (
              popup.links.map((linkItem, index) => (
                <div
                  key={index}
                  className='grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_132px_40px]'
                >
                  <Input
                    aria-label={`링크 제목 ${index + 1}`}
                    placeholder='링크 텍스트'
                    value={linkItem.title}
                    onChange={(event) =>
                      onLinkChange(index, 'title', event.target.value)
                    }
                  />
                  <Input
                    aria-label={`링크 URL ${index + 1}`}
                    placeholder='URL 또는 내부 경로'
                    value={linkItem.url}
                    onChange={(event) =>
                      onLinkChange(index, 'url', event.target.value)
                    }
                  />
                  <Select
                    value={linkItem.isExternal ? 'external' : 'internal'}
                    onValueChange={(value) =>
                      onLinkChange(index, 'isExternal', value === 'external')
                    }
                  >
                    <Select.Trigger className='w-full'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value='internal'>내부 이동</Select.Item>
                      <Select.Item value='external'>새 탭</Select.Item>
                    </Select.Content>
                  </Select>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='링크 삭제'
                    onClick={() =>
                      onPopupChange(
                        'links',
                        popup.links.filter(
                          (_, linkIndex) => linkIndex !== index
                        )
                      )
                    }
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              ))
            ) : (
              <div className='rounded-md border border-dashed p-4 text-center text-sm text-gray-500'>
                연결할 공지나 외부 링크가 없으면 링크 영역은 숨겨집니다.
              </div>
            )}
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
