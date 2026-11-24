import { useEffect, useId, useRef, useState } from 'react';

import { toast } from 'sonner';

import { DateTimePicker } from '@/shared/components';
import { Button, Dialog, Input, Label, Textarea } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import {
  formatDateTimeToMinutes,
  getErrorMessage,
  toDateTimeInputValue,
} from '@/shared/utils';

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
import {
  type MaintenanceChange,
  MaintenanceUpdateConfirmModal,
} from './MaintenanceUpdateConfirmModal';

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
  const [confirming, setConfirming] = useState(false);
  const changes: MaintenanceChange[] = [
    { label: '관리용 일정 제목', before: detail.title, after: title.trim() },
    {
      label: '시작 일시',
      before: formatDateTimeToMinutes(detail.startAt),
      after: formatDateTimeToMinutes(start.dateTime),
    },
    {
      label: '종료 일시',
      before: formatDateTimeToMinutes(detail.endAt),
      after: formatDateTimeToMinutes(end.dateTime),
    },
    {
      label: '사용자 안내 문구',
      before: detail.noticeMessage ?? '',
      after: notice.trim(),
    },
    { label: '관리자 메모', before: detail.memo, after: memo.trim() },
  ].filter((change) => change.before !== change.after);
  if (imageMode !== 'keep')
    changes.push({
      label: '사용자 안내 이미지',
      before: detail.imageUrl ? '기존 첨부 이미지' : '기본 안내 이미지',
      after: imageMode === 'remove' ? '기본 안내 이미지' : (image?.name ?? ''),
    });

  const submit = async (confirmed = false) => {
    if (busy.current) return;
    if (!pendingUpload) {
      if (!title.trim() || !start.dateTime || !end.dateTime || !memo.trim()) {
        setError('');
        toast.error('모든 필수 항목을 입력해 주세요.');
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
    if (!pendingUpload && !confirmed) {
      if (!changes.length) {
        toast.error('변경된 항목이 없습니다.');
        return;
      }
      setError('');
      setConfirming(true);
      return;
    }
    busy.current = true;
    setIsPending(true);
    setError('');
    try {
      let upload = pendingUpload;
      if (!upload) {
        const result = await updateAdminMaintenance(item.id, {
          ...(title.trim() !== detail.title ? { title: title.trim() } : {}),
          ...(start.dateTime !== toDateTimeInputValue(detail.startAt)
            ? { startAt: `${start.dateTime.replace('T', ' ')}:00` }
            : {}),
          ...(end.dateTime !== toDateTimeInputValue(detail.endAt)
            ? { endAt: `${end.dateTime.replace('T', ' ')}:00` }
            : {}),
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
      setConfirming(false);
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

  if (confirming)
    return (
      <MaintenanceUpdateConfirmModal
        changes={changes}
        isPending={isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          void submit(true);
        }}
      />
    );

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
          noValidate
          className='flex min-w-0 flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <fieldset
            disabled={isPending || Boolean(pendingUpload)}
            className='flex min-w-0 flex-col gap-4'
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
              <Label htmlFor={`${id}-notice`}>사용자 안내 문구</Label>
              <Textarea
                id={`${id}-notice`}
                value={notice}
                onChange={(event) => setNotice(event.target.value)}
              />
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor={`${id}-image`}>사용자 안내 이미지</Label>
              <MaintenanceImageInput
                key={imageMode}
                id={`${id}-image`}
                file={image}
                buttonLabel={
                  imageMode === 'change'
                    ? '이미지 업로드'
                    : detail.imageUrl && imageMode === 'keep'
                      ? '이미지 변경'
                      : '이미지 업로드'
                }
                onChange={(file) => {
                  setImage(file);
                  setImageMode('change');
                }}
              />
              <div className='flex min-w-0 items-end gap-3'>
                <div className='min-w-0 flex-1'>
                  {imageMode === 'keep' && detail.imageUrl && (
                    <img
                      src={detail.imageUrl}
                      alt='현재 사용자 안내 이미지'
                      className='h-auto max-h-36 w-auto max-w-full rounded-md border border-gray-200 object-contain'
                    />
                  )}
                  {imageMode === 'change' && previewUrl && (
                    <img
                      src={previewUrl}
                      alt='선택한 사용자 안내 이미지'
                      className='h-auto max-h-36 w-auto max-w-full rounded-md border border-gray-200 object-contain'
                    />
                  )}
                  {imageMode === 'keep' && !detail.imageUrl && (
                    <p className='text-muted-foreground text-sm' role='status'>
                      기본 안내 이미지 사용 중
                    </p>
                  )}
                </div>
                <div className='flex shrink-0 flex-col gap-2'>
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
                      이미지 제거
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor={`${id}-memo`} required>
                관리자 메모
              </Label>
              <Textarea
                id={`${id}-memo`}
                className='field-sizing-fixed min-h-24 resize-y'
                required
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
              />
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
