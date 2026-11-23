import { useEffect, useId, useRef, useState } from 'react';

import { toast } from 'sonner';

import { DateTimePicker } from '@/shared/components';
import { Button, Dialog, Input, Label, Textarea } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import { getErrorMessage, toDateTimeInputValue } from '@/shared/utils';

import {
  updateAdminMaintenance,
  uploadMaintenanceImage,
} from '@/apis/maintenance';

import type {
  ServerMaintenanceDetail,
  ServerMaintenanceListItem,
} from '../types/maintenance';
import { MaintenanceDetailLoader } from './MaintenanceDetailLoader';
import { MaintenanceImageInput } from './MaintenanceImageInput';

type ChangeMode = 'keep' | 'change' | 'remove';

export function MaintenanceEditModal(props: {
  item: ServerMaintenanceListItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  return (
    <MaintenanceDetailLoader
      id={props.item.id}
      title='서버 점검 일정 수정'
      onClose={props.onClose}
    >
      {(detail) => <MaintenanceEditForm {...props} detail={detail} />}
    </MaintenanceDetailLoader>
  );
}

function MaintenanceEditForm({
  item,
  detail,
  onClose,
  onChanged,
}: {
  item: ServerMaintenanceListItem;
  detail: ServerMaintenanceDetail;
  onClose: () => void;
  onChanged: () => void;
}) {
  const id = useId();
  const [title, setTitle] = useState(detail.title);
  const start = useDateTimeField({
    initialDateTime: toDateTimeInputValue(detail.startAt),
  });
  const end = useDateTimeField({
    initialDateTime: toDateTimeInputValue(detail.endAt),
  });
  const [memo, setMemo] = useState(detail.memo);
  const [notice, setNotice] = useState(detail.noticeMessage ?? '');
  const [imageMode, setImageMode] = useState<ChangeMode>('keep');
  const [image, setImage] = useState<File>();
  const [pendingUpload, setPendingUpload] = useState<{
    url?: string;
    file: File;
  }>();
  const [isPending, setIsPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (busy.current) return;
    if (!pendingUpload) {
      if (!title.trim() || !start.dateTime || !end.dateTime || !memo.trim()) {
        setError('변경할 항목의 필수값을 입력해 주세요.');
        return;
      }
      if (end.dateTime <= start.dateTime) {
        setError('');
        toast.error('종료 일시는 시작 일시보다 늦어야 합니다.');
        return;
      }
      if (
        imageMode === 'change' &&
        (!image || !image.type.startsWith('image/') || image.name.length > 218)
      ) {
        setError('파일명이 218자 이하인 이미지를 선택해 주세요.');
        return;
      }
    }
    busy.current = true;
    setIsPending(true);
    setError('');
    try {
      let upload = pendingUpload;
      if (!upload) {
        const result = await updateAdminMaintenance(item.id, {
          title: title.trim(),
          startAt: `${start.dateTime.replace('T', ' ')}:00`,
          endAt: `${end.dateTime.replace('T', ' ')}:00`,
          ...(memo.trim() !== detail.memo ? { memo: memo.trim() } : {}),
          ...(notice.trim() !== (detail.noticeMessage ?? '')
            ? { noticeMessage: notice.trim() }
            : {}),
          ...(imageMode === 'remove'
            ? { attachments: [] }
            : imageMode === 'change' && image
              ? {
                  attachments: [
                    {
                      type: 'PHOTO',
                      fileName: image.name,
                      fileComment: '서버 점검 안내 이미지',
                    },
                  ],
                }
              : {}),
        });
        onChanged();
        if (imageMode === 'change' && image) {
          upload = { url: result.attachmentUrlList?.[0], file: image };
          setPendingUpload(upload);
        }
      }
      if (upload) {
        if (!upload.url)
          throw new Error('업로드 주소가 없습니다. 관리자에게 확인해 주세요.');
        await uploadMaintenanceImage(upload.url, upload.file);
      }
      if (upload) onChanged();
      toast.success('서버 점검 일정이 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error, '서버 점검 일정 수정에 실패했습니다.')
      );
    } finally {
      busy.current = false;
      setIsPending(false);
    }
  };

  const [previewUrl, setPreviewUrl] = useState<string>();
  useEffect(() => {
    if (!image) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  const resetImage = () => {
    setImage(undefined);
    setImageMode('keep');
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy.current) onClose();
      }}
    >
      <Dialog.Content
        className='max-h-[90dvh] min-w-0 overflow-y-auto sm:max-w-lg'
        showCloseButton={!isPending}
      >
        <Dialog.Header>
          <Dialog.Title>서버 점검 일정 수정</Dialog.Title>
          <Dialog.Description>
            기존 일정 정보를 수정합니다. 안내 문구와 이미지는 점검 중 사용자에게
            표시됩니다.
          </Dialog.Description>
        </Dialog.Header>
        <form
          className='flex min-w-0 flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <fieldset
            disabled={isPending || Boolean(pendingUpload)}
            className='flex min-w-0 flex-col gap-4 [&_[data-slot=label]]:py-0 [&_[data-slot=label]]:font-medium'
          >
            <div className='flex flex-col gap-1'>
              <Label htmlFor={`${id}-title`} required>
                관리용 일정 제목
              </Label>
              <Input
                id={`${id}-title`}
                required
                value={title}
                maxLength={100}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <DateTimePicker
              label='시작 일시'
              required
              date={start.date}
              time={start.time}
              onDateSelect={start.onDateSelect}
              onTimeChange={start.onTimeChange}
            />
            <DateTimePicker
              label='종료 일시'
              required
              date={end.date}
              time={end.time}
              onDateSelect={end.onDateSelect}
              onTimeChange={end.onTimeChange}
            />
            <div className='flex flex-col gap-1'>
              <Label htmlFor={`${id}-memo`} required>
                관리자 메모
              </Label>
              <Input
                id={`${id}-memo`}
                required
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor={`${id}-notice`}>사용자 안내 문구</Label>
              <Textarea
                id={`${id}-notice`}
                value={notice}
                onChange={(event) => setNotice(event.target.value)}
              />
            </div>
            <div className='flex min-w-0 flex-col gap-2'>
              <Label htmlFor={`${id}-image`}>사용자 안내 이미지</Label>
              {imageMode === 'keep' && detail.imageUrl && (
                <img
                  src={detail.imageUrl}
                  alt='현재 사용자 안내 이미지'
                  className='max-h-48 w-full min-w-0 rounded-md object-contain'
                />
              )}
              {imageMode === 'change' && previewUrl && (
                <img
                  src={previewUrl}
                  alt='선택한 사용자 안내 이미지'
                  className='max-h-48 w-full min-w-0 rounded-md object-contain'
                />
              )}
              {(imageMode === 'remove' ||
                (imageMode === 'keep' && !detail.imageUrl)) && (
                <p className='text-muted-foreground text-sm' role='status'>
                  {imageMode === 'remove'
                    ? '저장하면 기본 안내 이미지가 표시됩니다.'
                    : '기본 안내 이미지 사용 중'}
                </p>
              )}
              <MaintenanceImageInput
                key={imageMode}
                id={`${id}-image`}
                file={image}
                buttonLabel={
                  imageMode === 'change'
                    ? '다시 선택'
                    : detail.imageUrl && imageMode === 'keep'
                      ? '이미지 변경'
                      : '이미지 추가'
                }
                onChange={(file) => {
                  setImage(file);
                  setImageMode('change');
                }}
              />
              <div className='flex flex-wrap gap-2'>
                {detail.imageUrl && imageMode !== 'remove' && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setImage(undefined);
                      setImageMode('remove');
                    }}
                  >
                    기본 이미지 사용
                  </Button>
                )}
                {imageMode !== 'keep' && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={resetImage}
                  >
                    변경 취소
                  </Button>
                )}
              </div>
            </div>
          </fieldset>
          {pendingUpload && (
            <p className='text-sm'>
              일정 수정은 완료되었습니다. 이미지 업로드만 다시 시도합니다.
            </p>
          )}
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <Dialog.Footer className='grid grid-cols-2 gap-3 sm:grid sm:grid-cols-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type='submit'
              disabled={
                isPending || Boolean(pendingUpload && !pendingUpload.url)
              }
            >
              {isPending
                ? '처리 중…'
                : pendingUpload
                  ? '이미지 업로드 재시도'
                  : '수정'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
