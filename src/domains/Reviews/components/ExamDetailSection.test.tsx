import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
  ExamReview,
  ExamReviewDetailResult,
} from '@/domains/Reviews/types';

import { deleteExamReview, updateExamReview } from '@/apis/reviews';

import { ExamDetailSection } from './ExamDetailSection';

vi.mock('@/apis/reviews', () => ({
  confirmExamReview: vi.fn(),
  deleteExamReview: vi.fn(),
  downloadExamReviewFile: vi.fn(),
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
  ExamReviewDetailInfoSection: () => <div>시험후기 상세정보 내용</div>,
  ExamReviewLogSection: () => <div>관리 이력 내용</div>,
  ExamReviewPostInfoSection: () => <div>게시글 및 작성자 정보 내용</div>,
  ExamReviewUpdateConfirmModal: () => null,
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
    vi.clearAllMocks();
  });

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
    expect(deleteExamReview).toHaveBeenCalledWith(101);
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
});
