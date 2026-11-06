import { Clock3, Save, Send } from 'lucide-react';

import { Button } from '@/shared/components/ui';

import type { NoticeEditorMode } from '../types';

interface NoticeEditorActionsProps {
  mode: NoticeEditorMode;
  canSaveDraft: boolean;
  actionText: string;
  onCancel: () => void;
  onToggleSchedule: () => void;
  onSaveDraft: () => void;
}

export default function NoticeEditorActions({
  mode,
  canSaveDraft,
  actionText,
  onCancel,
  onToggleSchedule,
  onSaveDraft,
}: NoticeEditorActionsProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
      <Button type='button' variant='outline' onClick={onCancel}>
        취소
      </Button>
      <div className='flex flex-wrap gap-2'>
        {mode !== 'private' && (
          <Button type='button' variant='outline' onClick={onToggleSchedule}>
            <Clock3 className='size-4 text-blue-600' />
            {mode === 'scheduled' ? '즉시 게시로 변경' : '예약'}
          </Button>
        )}
        {canSaveDraft && (
          <Button type='button' variant='outline' onClick={onSaveDraft}>
            <Save className='size-4' />
            임시저장
          </Button>
        )}
        <Button type='submit'>
          <Send className='size-4' />
          {actionText}
        </Button>
      </div>
    </div>
  );
}
