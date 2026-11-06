import { ConfirmModal } from '@/shared/components/ui';

import type { NoticeForm, NoticeStatus } from '../types';
import { formatNoticeDate } from '../utils/notice';

interface NoticeEditorDialogsProps {
  form: NoticeForm;
  confirmStatus: NoticeStatus | null;
  isLeaving: boolean;
  onSave: () => void;
  onCloseSave: () => void;
  onLeave: () => void;
  onCloseLeave: () => void;
}

export default function NoticeEditorDialogs({
  form,
  confirmStatus,
  isLeaving,
  onSave,
  onCloseSave,
  onLeave,
  onCloseLeave,
}: NoticeEditorDialogsProps) {
  return (
    <>
      <ConfirmModal
        isOpen={confirmStatus !== null}
        title={
          confirmStatus === 'draft'
            ? '임시저장할까요?'
            : confirmStatus === 'scheduled'
              ? '예약 게시할까요?'
              : confirmStatus === 'private'
                ? '비공개 상태로 저장할까요?'
                : '공지사항을 반영할까요?'
        }
        description={
          confirmStatus === 'draft'
            ? '선택한 게시판과 제목으로 저장합니다. 목록에서 이어서 작성할 수 있습니다.'
            : confirmStatus === 'scheduled'
              ? `${form.scheduledAt ? formatNoticeDate(`${form.scheduledAt}+09:00`) : ''}에 게시하도록 저장합니다.`
              : `${form.board} 게시판에 입력한 내용을 저장합니다.`
        }
        confirmText={confirmStatus === 'draft' ? '임시저장' : '저장'}
        onConfirm={onSave}
        onClose={onCloseSave}
      />
      <ConfirmModal
        isOpen={isLeaving}
        title='작성 중인 화면을 나갈까요?'
        description='저장하지 않은 변경사항은 사라집니다.'
        confirmText='나가기'
        closeText='계속 작성'
        onConfirm={onLeave}
        onClose={onCloseLeave}
      />
    </>
  );
}
