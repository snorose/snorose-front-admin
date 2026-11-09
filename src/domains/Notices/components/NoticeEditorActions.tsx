import { Link } from 'react-router-dom';

import { Clock3, Save, Send } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import type { NoticeEditorMode } from '../types';

interface NoticeEditorActionsProps {
  mode: NoticeEditorMode;
  canSaveDraft: boolean;
  canSave: boolean;
  isSaving: boolean;
  createdPostId?: number;
  createOutcomeUnknown: boolean;
  onRetry: () => void;
  actionText: string;
  onCancel: () => void;
  onToggleSchedule: () => void;
  onSaveDraft: () => void;
}

export default function NoticeEditorActions({
  mode,
  canSaveDraft,
  canSave,
  isSaving,
  createdPostId,
  createOutcomeUnknown,
  onRetry,
  actionText,
  onCancel,
  onToggleSchedule,
  onSaveDraft,
}: NoticeEditorActionsProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
      <Button
        type='button'
        variant='outline'
        disabled={isSaving}
        onClick={onCancel}
      >
        취소
      </Button>
      {createdPostId !== undefined ? (
        <Button type='button' onClick={onRetry} disabled={isSaving}>
          {isSaving ? '첨부 처리 중…' : '첨부 처리 다시 시도'}
        </Button>
      ) : createOutcomeUnknown ? (
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
              disabled={isSaving}
              onClick={onToggleSchedule}
            >
              <Clock3 className='size-4 text-blue-600' />
              {mode === 'scheduled' ? '즉시 게시로 변경' : '예약'}
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
