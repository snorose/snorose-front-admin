import { ConfirmModal } from '@/shared/components/ui';

import type { NoticeForm, NoticeStatus } from '../types';
import { formatNoticeDate } from '../utils/notice';

interface NoticeEditorDialogsProps {
  form: NoticeForm;
  confirmStatus: NoticeStatus | null;
  isLeaving: boolean;
  isSaving: boolean;
  createdPostId?: number;
  createOutcomeUnknown: boolean;
  onSave: () => void;
  onCloseSave: () => void;
  onLeave: () => void;
  onCloseLeave: () => void;
}

export default function NoticeEditorDialogs({
  form,
  confirmStatus,
  isLeaving,
  isSaving,
  createdPostId,
  createOutcomeUnknown,
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
          createdPostId !== undefined
            ? '첨부 처리를 다시 시도할까요?'
            : confirmStatus === 'draft'
              ? '임시저장할까요?'
              : confirmStatus === 'scheduled'
                ? '예약 게시할까요?'
                : confirmStatus === 'private'
                  ? '비공개 상태로 저장할까요?'
                  : '공지사항을 반영할까요?'
        }
        description={
          createdPostId !== undefined
            ? `공지 ${createdPostId}번의 실패한 첨부 처리만 다시 시도합니다.`
            : confirmStatus === 'draft'
              ? '선택한 게시판과 제목으로 임시저장합니다.'
              : confirmStatus === 'scheduled'
                ? `${form.scheduledAt ? formatNoticeDate(`${form.scheduledAt}+09:00`) : ''}에 게시하도록 저장합니다.`
                : `${form.board} 게시판에 입력한 내용을 저장합니다.`
        }
        confirmText={
          createdPostId !== undefined
            ? '다시 시도'
            : confirmStatus === 'draft'
              ? '임시저장'
              : '저장'
        }
        confirmDisabled={isSaving}
        onConfirm={onSave}
        onClose={onCloseSave}
      />
      <ConfirmModal
        isOpen={isLeaving}
        title='작성 중인 화면을 나갈까요?'
        description={
          createOutcomeUnknown
            ? '등록 여부를 먼저 목록에서 확인해 주세요. 화면을 나가면 현재 입력 내용은 사라집니다.'
            : createdPostId !== undefined
              ? `공지 ${createdPostId}번은 생성되었지만 첨부 처리가 완료되지 않았습니다. 화면을 나가면 여기서 업로드를 다시 시도할 수 없습니다.`
              : '저장하지 않은 변경사항은 사라집니다.'
        }
        confirmDisabled={isSaving}
        confirmText='나가기'
        closeText='계속 작성'
        onConfirm={onLeave}
        onClose={onCloseLeave}
      />
    </>
  );
}
