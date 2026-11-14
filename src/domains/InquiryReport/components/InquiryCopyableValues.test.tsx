import { MemoryRouter } from 'react-router-dom';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { InquiryDetail, InquiryListItem } from '@/shared/types';

import {
  useInquiryComments,
  useInquiryDetail,
  useInquiryList,
} from '@/domains/InquiryReport/hooks';

import { getUserDetailAPI } from '@/apis';

import InquiryReportDetailPanel from './InquiryReportDetailPanel';
import InquiryReportTable from './InquiryReportTable';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/apis', () => ({ getUserDetailAPI: vi.fn() }));
vi.mock('@/domains/InquiryReport/hooks', () => ({
  useInquiryList: vi.fn(),
  useInquiryDetail: vi.fn(),
  useInquiryComments: vi.fn(),
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
  vi.mocked(useInquiryComments).mockReturnValue({
    data: { data: [], hasNext: false },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useInquiryComments>);
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('문의·신고 공통 복사 UI', () => {
  test('댓글 조회 실패를 빈 목록과 구분하고 다시 조회할 수 있다', async () => {
    const refetch = vi.fn();
    vi.mocked(useInquiryComments).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useInquiryComments>);
    render(
      <MemoryRouter>
        <InquiryReportDetailPanel
          postId={123}
          onClose={vi.fn()}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '댓글을 불러오지 못했습니다.'
    );
    expect(
      screen.queryByText('등록된 댓글이 없습니다.')
    ).not.toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  test('목록에서 ID를 복사해도 행 선택은 바뀌지 않는다', async () => {
    const onRowSelect = vi.fn();
    render(
      <MemoryRouter>
        <InquiryReportTable
          currentPage={1}
          onPageChange={vi.fn()}
          selectedPostId={null}
          onRowSelect={onRowSelect}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: '게시글 ID 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('123')
    );
    expect(onRowSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('문의 제목'));
    expect(onRowSelect).toHaveBeenCalledWith(123);
  });

  test.each(['목록', '상세', '담당자'])(
    '%s의 공통 메뉴에서 해당 회원의 암호화 ID로 조회한다',
    async (view) => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      const encryptedUserId =
        view === '담당자' ? 'encrypted-admin' : 'encrypted';
      const displayName = view === '담당자' ? '관리송이' : 'snowrose';
      if (view === '담당자') {
        vi.mocked(useInquiryList).mockReturnValue({
          data: [
            {
              ...item,
              manager: displayName,
              encryptedAdminId: encryptedUserId,
            },
          ],
          isLoading: false,
        } as ReturnType<typeof useInquiryList>);
      }
      vi.mocked(getUserDetailAPI).mockResolvedValue({
        encryptedUserId,
        loginId: 'snowrose',
        userName: '김송이',
        email: 'author@example.com',
        nickname: '작성자',
        userRoleId: 1,
        studentNumber: '20260000',
        major: '컴퓨터과학',
        birthday: '2000-01-01',
        pointBalance: 10,
        createdAt: item.createdAt,
        authenticatedAt: null,
        totalWarningCount: 0,
        isBlacklist: false,
        blacklistStartDate: null,
        blacklistEndDate: null,
      });
      render(
        <MemoryRouter>
          {view !== '상세' ? (
            <InquiryReportTable
              currentPage={1}
              onPageChange={vi.fn()}
              selectedPostId={null}
              onRowSelect={onRowSelect}
              onStatusChange={vi.fn()}
            />
          ) : (
            <InquiryReportDetailPanel
              postId={123}
              onClose={vi.fn()}
              onStatusChange={vi.fn()}
            />
          )}
        </MemoryRouter>
      );
      await user.click(screen.getByRole('button', { name: displayName }));
      expect(onRowSelect).not.toHaveBeenCalled();
      expect(getUserDetailAPI).not.toHaveBeenCalled();
      expect(
        screen.getByRole('menuitem', { name: '작성 게시글' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: '제재하기' })
      ).toBeInTheDocument();
      await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
      expect(
        await screen.findByRole('dialog', { name: '회원 정보' })
      ).toBeInTheDocument();
      expect(getUserDetailAPI).toHaveBeenCalledWith(encryptedUserId);
      await user.click(
        screen.getByRole('button', { name: '유저 상세 페이지로 이동' })
      );
      expect(onRowSelect).not.toHaveBeenCalled();
    }
  );

  test('담당자는 작성일 뒤에 표시하고 ID가 없는 이름과 미지정 상태는 텍스트로 표시한다', () => {
    vi.mocked(useInquiryList).mockReturnValue({
      data: [
        { ...item, manager: '관리송이' },
        { ...item, postId: 124, manager: null },
      ],
      isLoading: false,
    } as ReturnType<typeof useInquiryList>);
    render(
      <MemoryRouter>
        <InquiryReportTable
          currentPage={1}
          onPageChange={vi.fn()}
          selectedPostId={123}
          onRowSelect={vi.fn()}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(
      screen.getAllByRole('columnheader').map((head) => head.textContent)
    ).toEqual([
      'postId',
      '유형',
      '카테고리',
      '작성자 아이디',
      '답변여부',
      '제목',
      '작성일',
      '담당자',
    ]);
    const rows = screen.getAllByRole('row').slice(1);
    const assigned = within(rows[0]).getAllByRole('cell')[7];
    expect(assigned).toHaveTextContent('관리송이');
    expect(within(assigned).queryByRole('button')).not.toBeInTheDocument();
    expect(within(rows[1]).getAllByRole('cell')[7]).toHaveTextContent('-');
    expect(within(rows[0]).getAllByRole('cell')[6]).toHaveTextContent(
      '2026-01-01 00:00'
    );
    expect(getUserDetailAPI).not.toHaveBeenCalled();
  });

  test.each(['목록', '상세'])(
    '%s에서 암호화 ID가 없으면 이름만 표시한다',
    (view) => {
      vi.mocked(useInquiryList).mockReturnValue({
        data: [{ ...item, encryptedUserId: '' }],
        isLoading: false,
      } as ReturnType<typeof useInquiryList>);
      vi.mocked(useInquiryDetail).mockReturnValue({
        data: { ...detail, encryptedUserId: '' },
        isLoading: false,
      } as ReturnType<typeof useInquiryDetail>);
      render(
        <MemoryRouter>
          {view === '목록' ? (
            <InquiryReportTable
              currentPage={1}
              onPageChange={vi.fn()}
              selectedPostId={null}
              onRowSelect={vi.fn()}
              onStatusChange={vi.fn()}
            />
          ) : (
            <InquiryReportDetailPanel
              postId={123}
              onClose={vi.fn()}
              onStatusChange={vi.fn()}
            />
          )}
        </MemoryRouter>
      );
      expect(screen.getByText('snowrose')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'snowrose' })
      ).not.toBeInTheDocument();
      expect(getUserDetailAPI).not.toHaveBeenCalled();
    }
  );

  test('목록에서 탈퇴 작성자는 ID가 있어도 회원 메뉴를 표시하지 않는다', () => {
    vi.mocked(useInquiryList).mockReturnValue({
      data: [{ ...item, userLoginId: '탈퇴' }],
      isLoading: false,
    } as ReturnType<typeof useInquiryList>);
    render(
      <MemoryRouter>
        <InquiryReportTable
          currentPage={1}
          onPageChange={vi.fn()}
          selectedPostId={null}
          onRowSelect={vi.fn()}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('탈퇴')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '탈퇴' })
    ).not.toBeInTheDocument();
    expect(getUserDetailAPI).not.toHaveBeenCalled();
  });

  test('상세의 작성자 아이디를 누르면 회원 메뉴를 표시한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <InquiryReportDetailPanel
          postId={123}
          onClose={vi.fn()}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'snowrose' }));
    expect(
      screen.getByRole('menuitem', { name: '회원 정보' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: '제재하기' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '작성자 아이디 복사' })
    ).not.toBeInTheDocument();
  });

  test('탈퇴 작성자의 아이디와 복사 버튼은 표시하지 않는다', () => {
    vi.mocked(useInquiryDetail).mockReturnValue({
      data: { ...detail, isWriterWithdrawn: true },
      isLoading: false,
    } as ReturnType<typeof useInquiryDetail>);
    render(
      <MemoryRouter>
        <InquiryReportDetailPanel
          postId={123}
          onClose={vi.fn()}
          onStatusChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('탈퇴')).toBeInTheDocument();
    expect(screen.queryByText('snowrose')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '작성자 아이디 복사' })
    ).not.toBeInTheDocument();
  });
});
