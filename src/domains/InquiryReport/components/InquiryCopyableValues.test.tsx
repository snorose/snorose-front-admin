import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { InquiryDetail, InquiryListItem } from '@/shared/types';

import {
  useInquiryDetail,
  useInquiryList,
} from '@/domains/InquiryReport/hooks';

import InquiryReportDetailPanel from './InquiryReportDetailPanel';
import InquiryReportTable from './InquiryReportTable';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/domains/InquiryReport/hooks', () => ({
  useInquiryList: vi.fn(),
  useInquiryDetail: vi.fn(),
  useInquiryComments: () => ({ data: { data: [] }, isLoading: false }),
  useCreateInquiryComment: () => ({ isPending: false }),
  useUpdateInquiryComment: () => ({}),
  useDeleteInquiryComment: () => ({}),
}));

const item: InquiryListItem = {
  postId: 123,
  title: '문의 제목',
  encryptedUserId: 'encrypted',
  userLoginId: 'snowrose',
  createdAt: '2026-01-01T00:00:00',
  updatedAt: null,
  isEdited: false,
  status: 'PENDING',
  group: 'INQUIRY',
  subGroup: 'ETC_INQUIRY',
};
const detail: InquiryDetail = {
  ...item,
  inquiryId: 12,
  userRoleId: 2,
  isWriter: false,
  category: 'ETC_INQUIRY',
  content: '문의 내용',
  reportCause: null,
  target: null,
  targetPostId: 0,
  targetBoardId: 0,
  commentCount: 0,
  isWriterWithdrawn: false,
  attachments: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useInquiryList).mockReturnValue({
    data: [item],
    isLoading: false,
  } as ReturnType<typeof useInquiryList>);
  vi.mocked(useInquiryDetail).mockReturnValue({
    data: detail,
    isLoading: false,
  } as ReturnType<typeof useInquiryDetail>);
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('문의·신고 공통 복사 UI', () => {
  test('목록에서 ID를 복사해도 행 선택은 바뀌지 않는다', async () => {
    const onRowSelect = vi.fn();
    render(
      <InquiryReportTable
        currentPage={1}
        onPageChange={vi.fn()}
        selectedPostId={null}
        onRowSelect={onRowSelect}
        onStatusChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '게시글 ID 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('123')
    );
    expect(onRowSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('문의 제목'));
    expect(onRowSelect).toHaveBeenCalledWith(123);
  });

  test('상세의 일반 작성자 아이디를 복사한다', async () => {
    render(
      <InquiryReportDetailPanel
        postId={123}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '작성자 아이디 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('snowrose')
    );
  });

  test('탈퇴 작성자의 아이디와 복사 버튼은 표시하지 않는다', () => {
    vi.mocked(useInquiryDetail).mockReturnValue({
      data: { ...detail, isWriterWithdrawn: true },
      isLoading: false,
    } as ReturnType<typeof useInquiryDetail>);
    render(
      <InquiryReportDetailPanel
        postId={123}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );
    expect(screen.getByText('탈퇴')).toBeInTheDocument();
    expect(screen.queryByText('snowrose')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '작성자 아이디 복사' })
    ).not.toBeInTheDocument();
  });
});
