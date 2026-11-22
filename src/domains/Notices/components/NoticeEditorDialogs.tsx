import { ConfirmModal } from '@/shared/components/ui';

import type { NoticeForm, NoticeStatus } from '../types';
import { formatNoticeDate } from '../utils/notice';

interface NoticeEditorDialogsProps {
  form: NoticeForm;
  confirmStatus: NoticeStatus | null;
  originalStatus?: NoticeStatus;
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
  originalStatus,
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
          confirmStatus === 'draft'
            ? '임시저장할까요?'
            : confirmStatus === 'scheduled'
              ? originalStatus === 'scheduled'
                ? '예약 공지를 수정할까요?'
                : '예약 게시할까요?'
              : confirmStatus === 'private'
                ? '비공개 상태로 저장할까요?'
                : confirmStatus === 'published' && originalStatus === 'private'
                  ? '공개로 전환할까요?'
                  : '공지사항을 반영할까요?'
        }
        description={
          confirmStatus === 'draft'
            ? '선택한 게시판과 제목으로 임시저장합니다.'
            : confirmStatus === 'scheduled'
              ? form.scheduledAt
                ? `${formatNoticeDate(`${form.scheduledAt}+09:00`)}에 게시하도록 저장합니다.`
                : '기존 예약 시각을 유지하여 공지를 수정합니다.'
              : confirmStatus === 'private'
                ? originalStatus === 'scheduled'
                  ? '예약 게시를 취소하고 공지를 비공개로 전환합니다.'
                  : '유저 게시판에 표시되지 않도록 공지를 비공개로 전환합니다.'
                : confirmStatus === 'published' && originalStatus === 'private'
                  ? `${form.board} 게시판에 비공개 공지를 공개합니다.`
                  : `${form.board} 게시판에 입력한 내용을 저장합니다.`
        }
        confirmText={confirmStatus === 'draft' ? '임시저장' : '저장'}
        confirmDisabled={isSaving}
        onConfirm={onSave}
        onClose={onCloseSave}
      />
      <ConfirmModal
        isOpen={isLeaving}
        title='작성 중인 화면을 나갈까요?'
        description={
          createOutcomeUnknown
            ? `${originalStatus ? '수정 반영' : '등록'} 여부를 먼저 목록에서 확인해 주세요. 화면을 나가면 현재 입력 내용은 사라집니다.`
            : createdPostId !== undefined
              ? `공지 ${createdPostId}번은 ${originalStatus ? '수정' : '생성'}되었지만 첨부 처리가 완료되지 않았습니다. 목록에서 저장 상태를 확인해 주세요.`
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
