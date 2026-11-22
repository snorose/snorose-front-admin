import { Link } from 'react-router-dom';

import { Clock3, Eye, EyeOff, Save, Send, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import type { NoticeEditorMode } from '../types';

interface NoticeEditorActionsProps {
  mode: NoticeEditorMode;
  isDraft: boolean;
  canSaveDraft: boolean;
  canSchedule: boolean;
  visibilityAction?: 'public' | 'private';
  canSave: boolean;
  isSaving: boolean;
  createdPostId?: number;
  createOutcomeUnknown: boolean;
  actionText: string;
  onCancel: () => void;
  onToggleSchedule: () => void;
  onSaveDraft: () => void;
  onChangeVisibility: () => void;
}

export default function NoticeEditorActions({
  mode,
  isDraft,
  canSaveDraft,
  canSchedule,
  visibilityAction,
  canSave,
  isSaving,
  createdPostId,
  createOutcomeUnknown,
  actionText,
  onCancel,
  onToggleSchedule,
  onSaveDraft,
  onChangeVisibility,
}: NoticeEditorActionsProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          disabled={isSaving}
          onClick={onCancel}
        >
          취소
        </Button>
        {isDraft && (
          <Button
            type='button'
            variant='destructive-outline'
            disabled
            title='임시저장 공지 삭제 기능은 준비 중입니다.'
          >
            <Trash2 className='size-4' aria-hidden='true' />
            삭제
          </Button>
        )}
      </div>
      {createdPostId !== undefined || createOutcomeUnknown ? (
        <Button asChild>
          <Link
            to={PATHS.NOTICE_GENERAL}
            target='_blank'
            rel='noopener noreferrer'
          >
            목록에서 확인 (새 창)
          </Link>
        </Button>
      ) : (
        <div className='flex flex-wrap gap-2'>
          {mode !== 'private' && (
            <Button
              type='button'
              variant='outline'
              disabled={!canSave || !canSchedule || isSaving}
              title={
                !canSchedule
                  ? '게시된 공지는 예약 상태로 변경할 수 없습니다.'
                  : undefined
              }
              onClick={onToggleSchedule}
            >
              <Clock3 className='size-4 text-blue-600' />
              {mode === 'scheduled' ? '즉시 게시로 변경' : '예약'}
            </Button>
          )}
          {visibilityAction && (
            <Button
              type='button'
              variant={
                visibilityAction === 'private'
                  ? 'destructive-outline'
                  : 'outline'
              }
              disabled={!canSave || isSaving}
              onClick={onChangeVisibility}
            >
              {visibilityAction === 'private' ? (
                <EyeOff className='size-4' />
              ) : (
                <Eye className='size-4' />
              )}
              {visibilityAction === 'private' ? '비공개' : '공개'}
            </Button>
          )}
          {canSaveDraft && (
            <Button
              type='button'
              variant='outline'
              disabled={!canSave || isSaving}
              onClick={onSaveDraft}
            >
              <Save className='size-4' />
              임시저장
            </Button>
          )}
          <Button type='submit' disabled={!canSave || isSaving}>
            <Send className='size-4' />
            {isSaving ? '저장 중…' : actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
