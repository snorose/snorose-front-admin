import { useId, useState } from 'react';

import { DateTimePicker } from '@/shared/components';
import {
  Button,
  Dialog,
  Input,
  Label,
  RadioGroup,
  Textarea,
} from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';

import type { NotificationHistory } from './PushNotificationList';

function EditOptions({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className='flex min-w-0 flex-col gap-2'>
      <legend className='mb-2 text-sm font-medium'>{label}</legend>
      <RadioGroup
        aria-label={label}
        value={value}
        onValueChange={onChange}
        className='flex flex-wrap gap-x-4 gap-y-2'
      >
        {options.map((option) => (
          <div key={option.value} className='flex items-center gap-2'>
            <RadioGroup.Item
              id={`${id}-${option.value}`}
              value={option.value}
            />
            <Label
              htmlFor={`${id}-${option.value}`}
              className='cursor-pointer font-normal'
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

export function PushNotificationEditModal({
  notification,
  onClose,
  onSave,
}: {
  notification: NotificationHistory;
  onClose: () => void;
  onSave: (notification: NotificationHistory) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState({ ...notification });
  const [error, setError] = useState('');
  const scheduled = useDateTimeField({
    initialDateTime: notification.scheduledAt,
  });
  const update = (values: Partial<NotificationHistory>) => {
    setDraft((previous) => ({ ...previous, ...values }));
    setError('');
  };

  const save = () => {
    if (!draft.name.trim() || !draft.title.trim() || !draft.body.trim()) {
      setError('알림명, 제목, 내용을 모두 입력해주세요.');
      return;
    }
    if (draft.title.length > 21 || draft.body.length > 100) {
      setError('알림 제목은 21자, 내용은 100자까지 입력할 수 있습니다.');
      return;
    }
    let url = draft.url.trim() || '/';
    if (draft.isExternal) {
      try {
        const parsed = new URL(
          /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`
        );
        if (
          !['http:', 'https:'].includes(parsed.protocol) ||
          !parsed.hostname ||
          !draft.url.trim()
        )
          throw new Error();
        parsed.protocol = 'https:';
        url = parsed.href;
      } catch {
        setError('올바른 외부 URL을 입력해주세요.');
        return;
      }
    } else {
      if (
        /^[a-z][a-z\d+.-]*:/i.test(url) ||
        url.startsWith('//') ||
        /[\\\s]/.test(url)
      ) {
        setError('내부 URL은 기본 주소를 제외한 경로만 입력해주세요.');
        return;
      }
      url = url.startsWith('/') ? url : `/${url}`;
    }
    if (draft.sendTiming === 'scheduled' && !scheduled.dateTime) {
      setError('예약 발송 날짜와 시간을 입력해주세요.');
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      title: draft.title.trim(),
      body: draft.body.trim(),
      url,
      scheduledAt: draft.sendTiming === 'scheduled' ? scheduled.dateTime : '',
      memberCount:
        draft.target === notification.target ? notification.memberCount : null,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className='max-h-[85dvh] overflow-y-auto sm:max-w-2xl'>
        <Dialog.Header>
          <Dialog.Title>알림 수정</Dialog.Title>
          <Dialog.Description>
            알림 내용과 발송 옵션을 확인하고 수정해주세요.
          </Dialog.Description>
        </Dialog.Header>
        <form
          className='flex flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <div className='flex flex-col gap-1'>
            <Label htmlFor={`${id}-name`} required>
              알림명
            </Label>
            <Input
              id={`${id}-name`}
              required
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor={`${id}-title`} required>
              알림 제목
            </Label>
            <Input
              id={`${id}-title`}
              required
              maxLength={21}
              aria-describedby={`${id}-title-count`}
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
            />
            <p
              id={`${id}-title-count`}
              className='text-muted-foreground text-right text-xs'
            >
              {draft.title.length} / 21자
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor={`${id}-body`} required>
              알림 내용
            </Label>
            <Textarea
              id={`${id}-body`}
              required
              maxLength={100}
              aria-describedby={`${id}-body-count`}
              value={draft.body}
              onChange={(event) => update({ body: event.target.value })}
              className='min-h-24'
            />
            <p
              id={`${id}-body-count`}
              className='text-muted-foreground text-right text-xs'
            >
              {draft.body.length} / 100자
            </p>
          </div>
          <EditOptions
            label='알림 연결 주소 유형'
            value={draft.isExternal ? 'external' : 'internal'}
            options={[
              { value: 'internal', label: '스노로즈 내부 URL' },
              { value: 'external', label: '외부 URL' },
            ]}
            onChange={(value) => update({ isExternal: value === 'external' })}
          />
          <div className='flex flex-col gap-1'>
            <Label htmlFor={`${id}-url`}>알림 클릭 시 연결되는 주소</Label>
            <Input
              id={`${id}-url`}
              value={draft.url}
              aria-describedby={`${id}-url-help`}
              onChange={(event) => update({ url: event.target.value })}
              placeholder={
                draft.isExternal
                  ? 'https://www.example.com'
                  : '/board/notice/post/123'
              }
            />
            <p id={`${id}-url-help`} className='text-muted-foreground text-xs'>
              {draft.isExternal
                ? '외부 주소는 https://로 저장됩니다.'
                : '기본 주소를 제외한 경로만 입력해주세요. 비워두면 홈으로 연결됩니다.'}
            </p>
          </div>
          <div className='flex flex-col gap-4 rounded-lg border p-4'>
            <EditOptions
              label='발송 시점'
              value={draft.sendTiming}
              options={[
                { value: 'immediate', label: '즉시 발송' },
                { value: 'scheduled', label: '예약 발송' },
              ]}
              onChange={(value) =>
                update({
                  sendTiming: value === 'scheduled' ? 'scheduled' : 'immediate',
                })
              }
            />
            {draft.sendTiming === 'scheduled' && (
              <DateTimePicker
                label='예약 발송 일시'
                required
                date={scheduled.date}
                time={scheduled.time}
                onDateSelect={scheduled.onDateSelect}
                onTimeChange={scheduled.onTimeChange}
              />
            )}
            <EditOptions
              label='메시지 유형'
              value={draft.category}
              options={[
                { value: '광고성', label: '광고성 (이벤트 홍보 등)' },
                { value: '정보성', label: '정보성 (전체 공지 등)' },
              ]}
              onChange={(value) =>
                update({ category: value === '광고성' ? '광고성' : '정보성' })
              }
            />
            <EditOptions
              label='발송 대상'
              value={draft.target}
              options={[
                { value: '관리자', label: '관리자에게만 테스트 발송' },
                {
                  value: '전체 회원',
                  label: '푸시 알림 허용 회원 전체에게 발송',
                },
              ]}
              onChange={(value) =>
                update({ target: value === '관리자' ? '관리자' : '전체 회원' })
              }
            />
          </div>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <Dialog.Footer className='mt-2 grid grid-cols-2 gap-4 sm:grid sm:grid-cols-2 sm:justify-normal'>
            <Button type='button' variant='outline' onClick={onClose}>
              취소
            </Button>
            <Button type='submit'>수정</Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
