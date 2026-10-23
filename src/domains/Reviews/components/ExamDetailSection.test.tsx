import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
  ExamReview,
  ExamReviewDetailResult,
} from '@/domains/Reviews/types';

import {
  deleteExamReview,
  restoreExamReview,
  updateExamReview,
} from '@/apis/reviews';

import { ExamDetailSection } from './ExamDetailSection';

vi.mock('@/apis/reviews', () => ({
  deleteExamReview: vi.fn(),
  downloadExamReviewFile: vi.fn(),
  restoreExamReview: vi.fn(),
  updateExamReview: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/domains/Reviews/components', () => ({
  ExamReviewCommentSection: () => <div>댓글 목록</div>,
  ExamReviewDetailInfoSection: ({
    formData,
    setFormData,
    onFileNameRename,
    canRenameFileName,
  }: {
    formData: { fileName: string };
    setFormData: (partial: {
      isConfirmed?: boolean;
      lectureName?: string;
    }) => void;
    onFileNameRename: () => void;
    canRenameFileName: boolean;
  }) => (
    <div>
      <div>시험후기 상세정보 내용</div>
      <div>현재 파일명: {formData.fileName}</div>
      <button
        type='button'
        onClick={onFileNameRename}
        disabled={!canRenameFileName}
      >
        파일명 변경
      </button>
      <button type='button' onClick={() => setFormData({ isConfirmed: true })}>
        확인 상태로 변경
      </button>
      <button type='button' onClick={() => setFormData({ lectureName: ' ' })}>
        강의명 비우기
      </button>
    </div>
  ),
  ExamReviewFileNameModal: ({
    postId,
    currentFileName,
    onClose,
    onSuccess,
  }: {
    postId: number;
    currentFileName: string;
    onClose: () => void;
    onSuccess: (
      postId: number,
      result: { postId: number; fileName: string; logs: [] }
    ) => void;
  }) => (
    <div>
      <div>수정 대상 파일명: {currentFileName}</div>
      <button
        type='button'
        onClick={() => {
          onSuccess(postId, { postId, fileName: 'renamed.pdf', logs: [] });
          onClose();
        }}
      >
        파일명 저장
      </button>
    </div>
  ),
  ExamReviewLogSection: () => <div>관리 이력 내용</div>,
  ExamReviewPostInfoSection: () => <div>게시글 및 작성자 정보 내용</div>,
  ExamReviewUpdateConfirmModal: ({
    isOpen,
    onConfirm,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <button type='button' onClick={onConfirm}>
        수정 확인
      </button>
    ) : null,
}));

const selectedExamReview: ExamReview = {
  id: 101,
  status: 'UNCONFIRMED',
  reviewTitle: '운영체제 중간고사',
  courseName: '운영체제',
  professor: '김교수',
  semester: '2026-1',
  examType: '중간고사',
  classNumber: '1',
  questionDetail: '서술형 3문항',
  uploadTime: '2026-04-20 10:00',
  userDisplay: '익명',
  isDiscussed: false,
  isReported: false,
  reportCount: 0,
  processStatuses: [],
};

const selectedExamReviewDetail: ExamReviewDetailResult = {
  encryptedUserId: 'encrypted-user-id',
  userDisplay: '익명',
  postId: 101,
  title: '운영체제 중간고사',
  commentCount: 0,
  status: 'UNCONFIRMED',
  createdAt: '2026-04-20T10:00:00',
  lectureName: '운영체제',
  professor: '김교수',
  classNumber: 1,
  lectureYear: 2026,
  semester: 'FIRST',
  lectureType: 'MAJOR_REQUIRED',
  isPF: false,
  isOnline: false,
  examType: 'MIDTERM',
  isConfirmed: false,
  isDiscussed: false,
  deletionStatus: null,
  isSanctioned: false,
  visibilityStatus: null,
  memo: null,
  fileName: 'exam.pdf',
  questionDetail: '서술형 3문항',
  logs: [],
};

const selectedExamReviewDetailWithMemo: ExamReviewDetailResult = {
  ...selectedExamReviewDetail,
  memo: '기존 운영자 메모',
};

describe('ExamDetailSection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test.each(['USER_DELETED', 'ADMIN_DELETED'] as const)(
    '%s 후기에서는 삭제 대신 복구 버튼을 표시한다',
    (deletionStatus) => {
      render(
        <ExamDetailSection
          selectedExamReview={selectedExamReview}
          selectedExamReviewDetail={{
            ...selectedExamReviewDetailWithMemo,
            deletionStatus,
          }}
        />
      );

      expect(
        screen.queryByRole('button', { name: '시험 후기 삭제' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제 복구' })).toBeEnabled();
    }
  );

  test.each(['USER_DELETED', 'ADMIN_DELETED'] as const)(
    '%s 후기의 복구 사유를 저장한 뒤 복구하고 해당 ID로 성공을 알린다',
    async (deletionStatus) => {
      const user = userEvent.setup();
      const onRestoreSuccess = vi.fn();
      const restoredMemo = '기존 운영자 메모\n\n[복구 사유]\n삭제 취소 요청';
      vi.mocked(updateExamReview).mockResolvedValueOnce({
        ...selectedExamReviewDetailWithMemo,
        memo: restoredMemo,
        deletionStatus,
      });
      vi.mocked(restoreExamReview).mockResolvedValueOnce({ postId: 101 });

      render(
        <ExamDetailSection
          selectedExamReview={selectedExamReview}
          selectedExamReviewDetail={{
            ...selectedExamReviewDetailWithMemo,
            deletionStatus,
          }}
          onRestoreSuccess={onRestoreSuccess}
        />
      );

      await user.click(screen.getByRole('button', { name: '삭제 복구' }));
      const dialog = screen.getByRole('dialog', { name: '시험 후기 복구' });
      const confirmButton = within(dialog).getByRole('button', {
        name: '복구',
      });
      expect(within(dialog).getByLabelText('기존 메모')).toHaveValue(
        '기존 운영자 메모'
      );
      expect(confirmButton).toBeDisabled();
      await user.type(
        within(dialog).getByLabelText('복구 사유'),
        '  삭제 취소 요청  '
      );
      expect(confirmButton).toBeEnabled();
      await user.click(confirmButton);

      await waitFor(() => expect(onRestoreSuccess).toHaveBeenCalledWith(101));
      expect(updateExamReview).toHaveBeenCalledExactlyOnceWith(101, {
        post: { memo: restoredMemo },
      });
      expect(restoreExamReview).toHaveBeenCalledExactlyOnceWith(101);
      expect(updateExamReview).toHaveBeenCalledBefore(
        vi.mocked(restoreExamReview)
      );
      expect(restoreExamReview).toHaveBeenCalledBefore(onRestoreSuccess);
      expect(onRestoreSuccess).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('시험 후기가 복구되었습니다.');
      expect(
        screen.queryByRole('dialog', { name: '시험 후기 복구' })
      ).not.toBeInTheDocument();
    }
  );

  describe.each(['USER_DELETED', 'ADMIN_DELETED'] as const)(
    '%s 후기 복구 실패',
    (deletionStatus) => {
      test.each(['메모 저장', '복구 요청'] as const)(
        '%s 실패 시 성공 처리를 실행하지 않는다',
        async (failureStep) => {
          const user = userEvent.setup();
          const onRestoreSuccess = vi.fn();
          if (failureStep === '메모 저장') {
            vi.mocked(updateExamReview).mockRejectedValueOnce(
              new Error('메모 저장 실패')
            );
          } else {
            vi.mocked(updateExamReview).mockResolvedValueOnce(
              selectedExamReviewDetailWithMemo
            );
            vi.mocked(restoreExamReview).mockRejectedValueOnce(
              new Error('복구 요청 실패')
            );
          }

          render(
            <ExamDetailSection
              selectedExamReview={selectedExamReview}
              selectedExamReviewDetail={{
                ...selectedExamReviewDetailWithMemo,
                deletionStatus,
              }}
              onRestoreSuccess={onRestoreSuccess}
            />
          );

          await user.click(screen.getByRole('button', { name: '삭제 복구' }));
          const dialog = screen.getByRole('dialog', { name: '시험 후기 복구' });
          await user.type(
            within(dialog).getByLabelText('복구 사유'),
            '삭제 취소 요청'
          );
          await user.click(
            within(dialog).getByRole('button', { name: '복구' })
          );

          await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
              '시험 후기 복구에 실패했습니다. 다시 시도해주세요.'
            )
          );
          expect(updateExamReview).toHaveBeenCalledExactlyOnceWith(101, {
            post: { memo: '기존 운영자 메모\n\n[복구 사유]\n삭제 취소 요청' },
          });
          if (failureStep === '메모 저장') {
            expect(restoreExamReview).not.toHaveBeenCalled();
          } else {
            expect(restoreExamReview).toHaveBeenCalledExactlyOnceWith(101);
            expect(updateExamReview).toHaveBeenCalledBefore(
              vi.mocked(restoreExamReview)
            );
          }
          expect(onRestoreSuccess).not.toHaveBeenCalled();
          expect(toast.success).not.toHaveBeenCalled();
          expect(dialog).toBeInTheDocument();
          expect(within(dialog).getByLabelText('복구 사유')).toHaveValue(
            '삭제 취소 요청'
          );
          expect(
            within(dialog).getByRole('button', { name: '복구' })
          ).toBeEnabled();
        }
      );
    }
  );

  test('삭제 사유를 메모로 저장한 뒤 시험 후기를 삭제한다', async () => {
    const user = userEvent.setup();
    const onDeleteSuccess = vi.fn();
    vi.mocked(updateExamReview).mockResolvedValue({
      ...selectedExamReviewDetail,
      memo: '부적절한 시험후기',
    });
    vi.mocked(deleteExamReview).mockResolvedValue({ postId: 101 });

    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        onDeleteSuccess={onDeleteSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: '시험 후기 삭제' }));

    const dialog = screen.getByRole('dialog', { name: '시험 후기 삭제' });
    const reasonInput = within(dialog).getByLabelText('삭제 사유');
    const confirmButton = within(dialog).getByRole('button', { name: '삭제' });

    expect(confirmButton).toBeDisabled();

    await user.type(reasonInput, '  부적절한 시험후기  ');
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    await waitFor(() => {
      expect(updateExamReview).toHaveBeenCalledWith(101, {
        post: { memo: '[삭제 사유]\n부적절한 시험후기' },
      });
    });
    await waitFor(() => expect(deleteExamReview).toHaveBeenCalledWith(101));
    expect(toast.success).toHaveBeenCalledWith(
      '시험 후기가 성공적으로 삭제되었습니다.'
    );
    expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
  });

  test('삭제 모달에서 기존 메모를 보여주고 삭제 사유를 기존 메모 아래에 저장한다', async () => {
    const user = userEvent.setup();
    vi.mocked(updateExamReview).mockResolvedValue({
      ...selectedExamReviewDetailWithMemo,
      memo: '기존 운영자 메모\n\n[삭제 사유]\n부적절한 시험후기',
    });
    vi.mocked(deleteExamReview).mockResolvedValue({ postId: 101 });

    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetailWithMemo}
      />
    );

    await user.click(screen.getByRole('button', { name: '시험 후기 삭제' }));

    const dialog = screen.getByRole('dialog', { name: '시험 후기 삭제' });
    expect(within(dialog).getByLabelText('기존 메모')).toHaveValue(
      '기존 운영자 메모'
    );

    await user.type(
      within(dialog).getByLabelText('삭제 사유'),
      '부적절한 시험후기'
    );
    await user.click(within(dialog).getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(updateExamReview).toHaveBeenCalledWith(101, {
        post: { memo: '기존 운영자 메모\n\n[삭제 사유]\n부적절한 시험후기' },
      });
    });
    expect(deleteExamReview).toHaveBeenCalledWith(101);
  });

  test('기존 메모에 같은 삭제 사유가 있으면 중복으로 추가하지 않는다', async () => {
    const user = userEvent.setup();
    const memoWithDeleteReason =
      '기존 운영자 메모\n\n[삭제 사유]\n부적절한 시험후기';
    vi.mocked(updateExamReview).mockResolvedValue({
      ...selectedExamReviewDetailWithMemo,
      memo: memoWithDeleteReason,
    });
    vi.mocked(deleteExamReview).mockResolvedValue({ postId: 101 });

    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={{
          ...selectedExamReviewDetailWithMemo,
          memo: memoWithDeleteReason,
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: '시험 후기 삭제' }));

    const dialog = screen.getByRole('dialog', { name: '시험 후기 삭제' });
    await user.type(
      within(dialog).getByLabelText('삭제 사유'),
      '부적절한 시험후기'
    );
    await user.click(within(dialog).getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(updateExamReview).toHaveBeenCalledWith(101, {
        post: { memo: memoWithDeleteReason },
      });
    });
    expect(deleteExamReview).toHaveBeenCalledWith(101);
  });

  test('확인여부 변경을 시험후기 수정 API payload에 포함한다', async () => {
    const user = userEvent.setup();
    const onSaveSuccess = vi.fn();
    const updatedDetail = {
      ...selectedExamReviewDetail,
      isConfirmed: true,
      status: 'CONFIRMED',
    };
    vi.mocked(updateExamReview).mockResolvedValue(updatedDetail);

    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        onSaveSuccess={onSaveSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: '편집 모드' }));
    await user.click(screen.getByRole('button', { name: '확인 상태로 변경' }));
    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.click(screen.getByRole('button', { name: '수정 확인' }));

    await waitFor(() => {
      expect(updateExamReview).toHaveBeenCalledWith(101, {
        post: { isConfirmed: true },
      });
    });
    expect(onSaveSuccess).toHaveBeenCalledWith(updatedDetail);
  });

  test('편집 모드에 들어가지 않고 파일명을 변경한다', async () => {
    const user = userEvent.setup();
    const onFileNameChangeSuccess = vi.fn();
    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        onFileNameChangeSuccess={onFileNameChangeSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: '파일명 변경' }));
    expect(screen.getByText('수정 대상 파일명: exam.pdf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '파일명 저장' }));

    expect(onFileNameChangeSuccess).toHaveBeenCalledWith(101, {
      postId: 101,
      fileName: 'renamed.pdf',
      logs: [],
    });
    expect(updateExamReview).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: '저장' })
    ).not.toBeInTheDocument();
  });

  test('편집 중 파일명을 수정해도 작성 중인 변경사항을 유지한다', async () => {
    const user = userEvent.setup();
    const onFileNameChangeSuccess = vi.fn();
    vi.mocked(updateExamReview).mockResolvedValue({
      ...selectedExamReviewDetail,
      isConfirmed: true,
      fileName: 'renamed.pdf',
    });

    const { rerender } = render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        onFileNameChangeSuccess={onFileNameChangeSuccess}
      />
    );

    const renameButton = screen.getByRole('button', { name: '파일명 변경' });
    expect(renameButton).toBeEnabled();

    await user.click(screen.getByRole('button', { name: '편집 모드' }));
    await user.click(screen.getByRole('button', { name: '확인 상태로 변경' }));
    expect(renameButton).toBeEnabled();

    await user.click(renameButton);
    expect(screen.getByText('수정 대상 파일명: exam.pdf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '파일명 저장' }));
    expect(onFileNameChangeSuccess).toHaveBeenCalledWith(101, {
      postId: 101,
      fileName: 'renamed.pdf',
      logs: [],
    });

    rerender(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={{
          ...selectedExamReviewDetail,
          fileName: 'renamed.pdf',
        }}
        onFileNameChangeSuccess={onFileNameChangeSuccess}
      />
    );

    expect(screen.getByText('현재 파일명: renamed.pdf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.click(screen.getByRole('button', { name: '수정 확인' }));
    await waitFor(() => {
      expect(updateExamReview).toHaveBeenCalledWith(101, {
        post: { isConfirmed: true },
      });
    });
  });

  test('필수값이 비어 있으면 시험후기 수정 API를 호출하지 않는다', async () => {
    const user = userEvent.setup();

    render(
      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
      />
    );

    await user.click(screen.getByRole('button', { name: '편집 모드' }));
    await user.click(screen.getByRole('button', { name: '강의명 비우기' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(toast.error).toHaveBeenCalledWith('강의명을 입력해주세요.');
    expect(screen.queryByRole('button', { name: '수정 확인' })).toBeNull();
    expect(updateExamReview).not.toHaveBeenCalled();
  });
});
