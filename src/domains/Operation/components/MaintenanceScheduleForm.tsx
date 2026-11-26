import { useId, useRef, useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { toast } from 'sonner';

import { DateTimePicker, SectionTitle } from '@/shared/components';
import {
  Button,
  Input,
  Label,
  Textarea,
  Tooltip,
} from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import { getErrorMessage } from '@/shared/utils';

import { DEFAULT_MAINTENANCE_NOTICE } from '../constants';
import type { ServerMaintenance } from '../types/maintenance';
import { MaintenanceImageInput } from './MaintenanceImageInput';

export type MaintenanceDraft = Pick<
  ServerMaintenance,
  'title' | 'startAt' | 'endAt'
> & { memo?: string; noticeMessage?: string; image?: File };

interface Props {
  initial?: ServerMaintenance;
  onSave: (draft: MaintenanceDraft) => void | Promise<void>;
  onCancel?: () => void;
}

export function MaintenanceScheduleForm({ initial, onSave, onCancel }: Props) {
  const id = useId();
  const [memo, setMemo] = useState('');
  const [noticeMessage, setNoticeMessage] = useState(
    DEFAULT_MAINTENANCE_NOTICE
  );
  const [image, setImage] = useState<File>();
  const imageInput = useRef<HTMLInputElement>(null);
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noticeTooltipOpen, setNoticeTooltipOpen] = useState(false);
  const [imageTooltipOpen, setImageTooltipOpen] = useState(false);
  const titleId = `${id}-title`;
  const headingId = `${id}-heading`;
  const errorId = `${id}-error`;
  const [title, setTitle] = useState(initial?.title ?? '');
  const start = useDateTimeField({ initialDateTime: initial?.startAt });
  const end = useDateTimeField({ initialDateTime: initial?.endAt });
  const draft: MaintenanceDraft = {
    title,
    startAt: start.dateTime,
    endAt: end.dateTime,
  };
  const [error, setError] = useState('');

  const reset = () => {
    setTitle(initial?.title ?? '');
    start.setDateTime(initial?.startAt ?? '');
    end.setDateTime(initial?.endAt ?? '');
    setError('');
    setMemo('');
    setNoticeMessage(DEFAULT_MAINTENANCE_NOTICE);
    setImage(undefined);
    if (imageInput.current) imageInput.current.value = '';
  };

  return (
    <section className='flex flex-col gap-1' aria-labelledby={headingId}>
      <SectionTitle id={headingId}>
        {initial ? '서버 점검 일정 수정' : '서버 점검 일정 생성'}
      </SectionTitle>
      <form
        noValidate
        className='@container flex flex-col gap-4 rounded-lg border p-4 pb-5'
        onSubmit={async (event) => {
          event.preventDefault();
          if (saving.current) return;
          if (!draft.title.trim() || !draft.startAt || !draft.endAt) {
            setError('');
            toast.error('모든 필수 항목을 입력해 주세요.');
            return;
          }
          if (
            !Number.isFinite(new Date(draft.startAt).getTime()) ||
            !Number.isFinite(new Date(draft.endAt).getTime()) ||
            draft.endAt <= draft.startAt
          ) {
            setError('');
            toast.error('종료 일시는 시작 일시보다 늦어야 합니다.');
            return;
          }
          if (!initial && !memo.trim()) {
            setError('');
            toast.error('관리자 메모를 입력해 주세요.');
            return;
          }
          if (
            image &&
            (!image.type.startsWith('image/') || image.name.length > 218)
          ) {
            setError('파일명이 218자 이하인 이미지를 선택해 주세요.');
            return;
          }
          saving.current = true;
          setIsSaving(true);
          setError('');
          try {
            await onSave({
              ...draft,
              title: draft.title.trim(),
              ...(!initial
                ? {
                    memo: memo.trim(),
                    noticeMessage: noticeMessage.trim(),
                    ...(image ? { image } : {}),
                  }
                : {}),
            });
            reset();
          } catch (error) {
            toast.error(
              getErrorMessage(error, '서버 점검 일정 등록에 실패했습니다.')
            );
          } finally {
            saving.current = false;
            setIsSaving(false);
          }
        }}
      >
        <fieldset disabled={isSaving} className='flex min-w-0 flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor={titleId} required>
              사용자 안내 제목
            </Label>
            <Input
              id={titleId}
              placeholder='예: 정기 서버 점검 안내'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <DateTimePicker
              label='시작 일시'
              date={start.date}
              time={start.time}
              onDateSelect={start.onDateSelect}
              onTimeChange={start.onTimeChange}
              datePlaceholder='시작 날짜 선택'
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
            <DateTimePicker
              label='종료 일시'
              date={end.date}
              time={end.time}
              onDateSelect={end.onDateSelect}
              onTimeChange={end.onTimeChange}
              datePlaceholder='종료 날짜 선택'
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          {!initial && (
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex min-w-0 flex-col gap-4'>
                <div className='flex min-w-0 flex-col gap-1'>
                  <div className='flex min-h-6 items-center gap-1'>
                    <Label htmlFor={`${id}-notice`}>사용자 안내 문구</Label>
                    <Tooltip.Provider delayDuration={150}>
                      <Tooltip
                        open={noticeTooltipOpen}
                        onOpenChange={setNoticeTooltipOpen}
                      >
                        <Tooltip.Trigger asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label='사용자 안내 문구 입력 안내'
                            className='relative size-5 shrink-0 p-0 text-inherit after:absolute after:-inset-2.5 hover:text-inherit sm:after:-inset-1'
                            onClick={(event) => {
                              event.preventDefault();
                              setNoticeTooltipOpen(true);
                            }}
                          >
                            <InfoIcon className='size-3.5' aria-hidden='true' />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side='top'
                          sideOffset={6}
                          collisionPadding={12}
                          className='max-w-64 text-center leading-5 break-keep'
                        >
                          입력한 경우에만 사용자에게 노출
                        </Tooltip.Content>
                      </Tooltip>
                    </Tooltip.Provider>
                  </div>
                  <Textarea
                    id={`${id}-notice`}
                    className='field-sizing-fixed h-28 min-h-28 resize-y'
                    value={noticeMessage}
                    onChange={(event) => setNoticeMessage(event.target.value)}
                    placeholder={DEFAULT_MAINTENANCE_NOTICE}
                  />
                </div>
                <div className='flex min-w-0 flex-col gap-1'>
                  <div className='flex items-center gap-1'>
                    <Label htmlFor={`${id}-image`}>사용자 안내 이미지</Label>
                    <Tooltip.Provider delayDuration={150}>
                      <Tooltip
                        open={imageTooltipOpen}
                        onOpenChange={setImageTooltipOpen}
                      >
                        <Tooltip.Trigger asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label='기본 안내 이미지 안내'
                            className='relative size-5 shrink-0 p-0 text-inherit after:absolute after:-inset-2.5 hover:text-inherit sm:after:-inset-1'
                            onClick={(event) => {
                              event.preventDefault();
                              setImageTooltipOpen(true);
                            }}
                          >
                            <InfoIcon className='size-3.5' aria-hidden='true' />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side='top'
                          sideOffset={6}
                          collisionPadding={12}
                          className='max-w-64 text-center leading-5 break-keep'
                        >
                          미첨부 시 기본 이미지 표시
                        </Tooltip.Content>
                      </Tooltip>
                    </Tooltip.Provider>
                  </div>
                  <MaintenanceImageInput
                    inputRef={imageInput}
                    id={`${id}-image`}
                    file={image}
                    onChange={setImage}
                    onRemove={() => setImage(undefined)}
                  />
                </div>
              </div>
              <div className='flex min-w-0 flex-col gap-1'>
                <Label htmlFor={`${id}-memo`} className='min-h-6' required>
                  관리자 메모
                </Label>
                <Textarea
                  id={`${id}-memo`}
                  className='field-sizing-fixed min-h-48 flex-1 resize-y'
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  required
                />
              </div>
            </div>
          )}
          {error && (
            <p id={errorId} role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <div className='flex justify-end gap-2'>
            {initial && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={onCancel}
              >
                취소
              </Button>
            )}
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
              onClick={reset}
            >
              입력 초기화
            </Button>
            <Button
              type='submit'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
            >
              {isSaving ? '저장 중…' : initial ? '수정' : '생성'}
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
