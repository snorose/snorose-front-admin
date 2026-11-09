import { useId, useLayoutEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImageIcon,
  Video,
  X,
} from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, ConfirmModal } from '@/shared/components/ui';

import type { NoticeAttachment } from '../types';
import {
  NOTICE_ATTACHMENT_LIMITS,
  getNoticeThumbnailId,
  moveNoticeAttachment,
} from '../utils/attachments';

interface NoticeAttachmentListProps {
  attachments: NoticeAttachment[];
  onChange: (attachments: NoticeAttachment[]) => void;
  disabled?: boolean;
}

export default function NoticeAttachmentList({
  attachments,
  onChange,
  disabled = false,
}: NoticeAttachmentListProps) {
  const hintId = useId();
  const cards = useRef(new Map<string, HTMLLIElement>());
  const pendingFocusId = useRef<string | null>(null);
  const photoCount = attachments.filter((attachment) =>
    attachment.type.startsWith('image/')
  ).length;
  const videoCount = attachments.length - photoCount;
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = attachments.find((attachment) => attachment.id === deleteId);
  const thumbnailId = getNoticeThumbnailId(attachments);
  useLayoutEffect(() => {
    if (disabled) {
      pendingFocusId.current = null;
      setDraggedId(null);
      setOverId(null);
      setDeleteId(null);
      return;
    }
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    const card = cards.current.get(id);
    card?.focus({ preventScroll: true });
    card?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [attachments, disabled]);
  const select = (id: string) => {
    if (disabled) return;
    setSelectedId(id);
    cards.current.get(id)?.focus({ preventScroll: true });
  };
  const move = (id: string, to: number) => {
    if (disabled) return;
    const next = moveNoticeAttachment(attachments, id, to);
    if (next === attachments) return;
    setSelectedId(id);
    pendingFocusId.current = id;
    onChange(next);
    setAnnouncement(
      `${attachments.find((attachment) => attachment.id === id)?.name}을 ${to + 1}번째로 이동했습니다.`
    );
  };

  return (
    <div className='min-w-0 space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs leading-5 text-gray-500'>
        <p id={hintId}>
          {disabled
            ? '저장 중이거나 첨부 처리 대기 중에는 첨부를 변경할 수 없습니다.'
            : '첫 번째 첨부가 썸네일로 사용됩니다. 좌우로 스크롤해 확인하고, 항목을 선택한 뒤 ←/→ 키나 버튼·드래그로 순서를 바꿀 수 있습니다.'}
        </p>
        <span className='shrink-0'>
          이미지 {photoCount}/{NOTICE_ATTACHMENT_LIMITS.image.quantity} · 동영상{' '}
          {videoCount}/{NOTICE_ATTACHMENT_LIMITS.video.quantity}
        </span>
      </div>
      <p role='status' aria-live='polite' className='sr-only'>
        {announcement}
      </p>
      {attachments.length === 0 ? (
        <div className='rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400'>
          버튼을 눌러 이미지나 동영상을 추가해 주세요.
        </div>
      ) : (
        <ul
          aria-label='첨부 순서'
          aria-describedby={hintId}
          tabIndex={0}
          className='flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-blue-500'
        >
          {attachments.map((attachment, index) => {
            const isImage = attachment.type.startsWith('image/');
            const Icon = isImage ? ImageIcon : Video;
            return (
              <li
                key={attachment.id}
                aria-label={`${index + 1}번째 첨부: ${attachment.name}`}
                aria-current={selectedId === attachment.id ? 'true' : undefined}
                aria-describedby={hintId}
                aria-keyshortcuts='ArrowLeft ArrowRight'
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                ref={(element) => {
                  if (element) cards.current.set(attachment.id, element);
                  else cards.current.delete(attachment.id);
                }}
                draggable={!disabled}
                className={`relative flex w-44 shrink-0 flex-col overflow-hidden rounded-lg border bg-white outline-none ${overId === attachment.id || selectedId === attachment.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} ${draggedId === attachment.id ? 'opacity-60' : ''}`}
                onClick={(event) => {
                  if (
                    event.target instanceof Element &&
                    event.target.closest('button, a, video')
                  )
                    return;
                  select(attachment.id);
                }}
                onFocus={(event) => {
                  if (!disabled && event.target === event.currentTarget)
                    setSelectedId(attachment.id);
                }}
                onKeyDown={(event) => {
                  if (
                    disabled ||
                    event.target !== event.currentTarget ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey ||
                    event.nativeEvent.isComposing
                  )
                    return;
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
                    return;
                  event.preventDefault();
                  event.stopPropagation();
                  move(
                    attachment.id,
                    index + (event.key === 'ArrowLeft' ? -1 : 1)
                  );
                }}
                onDragStart={(event) => {
                  if (disabled) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.setData(
                    'application/x-notice-attachment',
                    attachment.id
                  );
                  event.dataTransfer.effectAllowed = 'move';
                  setDraggedId(attachment.id);
                  setSelectedId(attachment.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setOverId(null);
                }}
                onDragOver={(event) => {
                  if (disabled || !draggedId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  setOverId(attachment.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (disabled || !draggedId) return;
                  const id = event.dataTransfer.getData(
                    'application/x-notice-attachment'
                  );
                  if (id === draggedId) move(id, index);
                  setDraggedId(null);
                  setOverId(null);
                }}
              >
                <div className='relative'>
                  <AttachmentPreview
                    key={attachment.url}
                    attachment={attachment}
                  />
                  <div className='pointer-events-none absolute top-2 left-2 flex gap-1'>
                    {attachment.id === thumbnailId && (
                      <StatusBadge tone='info'>썸네일</StatusBadge>
                    )}
                    {!isImage && (
                      <StatusBadge tone='outline'>동영상</StatusBadge>
                    )}
                  </div>
                  <Button
                    type='button'
                    variant='destructive'
                    size='icon-sm'
                    className='absolute top-1 right-1 size-7 rounded-full shadow-sm'
                    aria-label={`${attachment.name} 삭제`}
                    title='첨부 삭제'
                    disabled={disabled}
                    onClick={() => setDeleteId(attachment.id)}
                  >
                    <X className='size-3.5' aria-hidden='true' />
                  </Button>
                </div>
                <div className='flex min-w-0 items-center gap-1.5 px-2 py-2'>
                  <Icon
                    className='size-3.5 shrink-0 text-gray-400'
                    aria-hidden='true'
                  />
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    draggable={false}
                    title={attachment.name}
                    className='min-w-0 flex-1 truncate text-xs text-blue-700'
                  >
                    {attachment.name}
                  </a>
                  <span className='shrink-0 text-[10px] text-gray-400'>
                    {Math.ceil(attachment.size / 1024)} KB
                  </span>
                </div>
                <div className='flex items-center justify-between border-t border-gray-100 px-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-10 rounded-none'
                    disabled={disabled || index === 0}
                    aria-label={`${attachment.name} 앞으로 이동`}
                    title='앞으로 이동'
                    onClick={() => move(attachment.id, index - 1)}
                  >
                    <ArrowLeft className='size-4' aria-hidden='true' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    draggable={!disabled}
                    disabled={disabled}
                    className='cursor-grab gap-1 text-gray-500 active:cursor-grabbing'
                    aria-label={`${attachment.name} 순서 끌어서 이동`}
                    title='선택 후 ←/→ 키 또는 드래그로 순서 변경'
                    onClick={() => select(attachment.id)}
                  >
                    <GripVertical className='size-3.5' aria-hidden='true' />
                    <span className='text-xs font-medium'>{index + 1}</span>
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-10 rounded-none'
                    disabled={disabled || index === attachments.length - 1}
                    aria-label={`${attachment.name} 뒤로 이동`}
                    title='뒤로 이동'
                    onClick={() => move(attachment.id, index + 1)}
                  >
                    <ArrowRight className='size-4' aria-hidden='true' />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className='text-xs text-gray-400'>
        이미지는 개당 7MB, 동영상은 50MB까지 첨부할 수 있습니다.
      </p>
      <ConfirmModal
        isOpen={!disabled && !!deleting}
        title='첨부 파일을 삭제할까요?'
        description={
          deleting
            ? `${deleting.name} 파일을 첨부 목록에서 제거합니다.`
            : undefined
        }
        confirmText='삭제'
        confirmVariant='destructive'
        confirmDisabled={disabled}
        onConfirm={() => {
          if (disabled) return;
          onChange(
            attachments.filter((attachment) => attachment.id !== deleteId)
          );
          if (selectedId === deleteId) setSelectedId(null);
          setDeleteId(null);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}

function AttachmentPreview({ attachment }: { attachment: NoticeAttachment }) {
  const [failed, setFailed] = useState(false);
  const isImage = attachment.type.startsWith('image/');
  const Icon = isImage ? ImageIcon : Video;
  if (failed)
    return (
      <div className='flex h-28 flex-col items-center justify-center gap-2 rounded bg-gray-50 px-3 text-center text-xs text-gray-500'>
        <Icon className='size-6' aria-hidden='true' />
        <p>미리보기를 불러올 수 없습니다. 파일 이름을 눌러 확인해 주세요.</p>
      </div>
    );
  if (isImage)
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        draggable={false}
        onError={() => setFailed(true)}
        className='h-28 w-full bg-gray-50 object-cover'
      />
    );
  return (
    <div className='relative bg-gray-50'>
      <video
        src={attachment.url}
        controls
        muted
        playsInline
        preload='metadata'
        draggable={false}
        aria-label={`${attachment.name} 동영상`}
        onError={() => setFailed(true)}
        className='h-28 w-full object-cover'
      />
    </div>
  );
}
