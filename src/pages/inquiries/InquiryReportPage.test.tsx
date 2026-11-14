import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { InquiryListItem } from '@/shared/types';

import { getAdminInquiriesAPI } from '@/apis/inquiries';

import InquiryReportPage from './InquiryReportPage';

vi.mock('@/apis/inquiries', () => ({ getAdminInquiriesAPI: vi.fn() }));
vi.mock('@/domains/InquiryReport/hooks/useUpdateInquiryStatus', () => ({
  useUpdateInquiryStatus: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@/domains/InquiryReport/components/InquiryReportDetailPanel', () => ({
  default: ({ postId, onClose }: { postId: number; onClose: () => void }) => (
    <section aria-label='문의 상세'>
      상세 {postId}
      <button onClick={onClose}>상세 닫기</button>
    </section>
  ),
}));

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label='현재 URL'>
        {location.pathname + location.search}
      </output>
      <button onClick={() => navigate('/report/inquiry?postId=12&page=2')}>
        다른 문의 열기
      </button>
      <button onClick={() => navigate(-1)}>뒤로</button>
    </>
  );
}

function renderPage(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <InquiryReportPage />
        <Navigation />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.mocked(getAdminInquiriesAPI).mockResolvedValue({
    hasNext: false,
    data: Array.from(
      { length: 12 },
      (_, index): InquiryListItem => ({
        postId: index + 1,
        title: `문의 ${index + 1}`,
        encryptedUserId: 'user',
        userLoginId: `user-${index + 1}`,
        createdAt: '2026-10-10T12:00:00',
        updatedAt: null,
        isEdited: false,
        status: 'PENDING',
        group: 'INQUIRY',
        subGroup: 'ETC_INQUIRY',
      })
    ),
  });
});

describe('문의·신고 어드민 바로가기', () => {
  test('검색 영역 안의 필터는 즉시 적용하고 미적용 검색어는 검색 버튼으로 서버에 전달한다', async () => {
    const user = userEvent.setup();
    const original = await getAdminInquiriesAPI();
    const report: InquiryListItem = {
      ...original.data[11],
      status: 'WITHDRAWN',
      group: 'REPORT',
      subGroup: 'USER_REPORT',
    };
    const rows = [...original.data.slice(0, 11), report];
    vi.mocked(getAdminInquiriesAPI).mockImplementation(async (params) => ({
      hasNext: false,
      data: params?.searchKey
        ? [
            {
              ...report,
              title: '학번 검색으로 찾은 신고',
              userLoginId: 'searched-user',
            },
          ]
        : rows.filter((row) => !params?.group || row.group === params.group),
    }));
    renderPage('/report/inquiry?page=2&postId=12');
    await screen.findByText('user-12');
    const form = screen.getByRole('form', { name: '문의 및 신고 검색' });
    const input = within(form).getByLabelText('통합 검색');
    await user.type(input, ' 20260000 ');
    await user.click(within(form).getByRole('combobox', { name: '유형' }));
    await user.click(screen.getByRole('option', { name: '신고' }));
    await waitFor(() =>
      expect(getAdminInquiriesAPI).toHaveBeenLastCalledWith(
        { group: 'REPORT', page: 0 },
        expect.anything()
      )
    );
    expect(input).toHaveValue(' 20260000 ');
    expect(screen.getByLabelText('현재 URL')).not.toHaveTextContent(
      'searchKey='
    );
    const count = vi.mocked(getAdminInquiriesAPI).mock.calls.length;
    await user.click(within(form).getByRole('combobox', { name: '답변여부' }));
    await user.click(screen.getByRole('option', { name: '이용자 철회' }));
    expect(getAdminInquiriesAPI).toHaveBeenCalledTimes(count);
    expect(screen.getByText('user-12')).toBeInTheDocument();
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent('page=1');
    await user.click(within(form).getByRole('button', { name: '검색' }));
    expect(await screen.findByText('searched-user')).toBeInTheDocument();
    expect(getAdminInquiriesAPI).toHaveBeenLastCalledWith(
      { searchKey: '20260000', group: 'REPORT', page: 0 },
      expect.anything()
    );
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      'searchKey=20260000'
    );
    expect(
      screen.queryByRole('region', { name: '문의 상세' })
    ).not.toBeInTheDocument();
    await user.click(
      within(form).getByRole('button', { name: '검색 조건 초기화' })
    );
    expect(input).toHaveValue('');
    expect(await screen.findByText('user-1')).toBeInTheDocument();
    expect(
      within(form).getByRole('combobox', { name: '유형' })
    ).toHaveTextContent('유형 전체');
    expect(
      within(form).getByRole('combobox', { name: '답변여부' })
    ).toHaveTextContent('답변 전체');
  });

  test('URL 검색어를 복원하고 한글 조합 Enter는 무시하며 초기화는 입력 중인 값도 지운다', async () => {
    const user = userEvent.setup();
    renderPage('/report/inquiry?searchKey=20260000');
    await screen.findByText('user-1');
    const input = screen.getByLabelText('통합 검색');
    expect(input).toHaveValue('20260000');
    await user.clear(input);
    await user.type(input, '새 검색어');
    const count = vi.mocked(getAdminInquiriesAPI).mock.calls.length;
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(getAdminInquiriesAPI).toHaveBeenCalledTimes(count);
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(getAdminInquiriesAPI).toHaveBeenLastCalledWith(
        { searchKey: '새 검색어', page: 0 },
        expect.anything()
      )
    );
    const reset = screen.getByRole('button', { name: '검색 조건 초기화' });
    await user.click(reset);
    await user.type(input, '미적용 입력');
    await user.click(reset);
    expect(input).toHaveValue('');
  });

  test('목록 조회 실패는 빈 결과와 구분하며 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminInquiriesAPI).mockRejectedValueOnce(
      new Error('서버 오류')
    );
    renderPage('/report/inquiry?searchKey=검색어');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '목록을 불러오지 못했습니다.'
    );
    expect(
      screen.queryByText('필터 조건에 해당하는 항목이 없습니다.')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('user-1')).toBeInTheDocument();
  });

  test('철회 항목을 표시하고 이용자 철회 필터 선택 시 첫 페이지에서 해당 항목만 조회한다', async () => {
    const user = userEvent.setup();
    const originalResponse = await getAdminInquiriesAPI();
    vi.mocked(getAdminInquiriesAPI).mockResolvedValue({
      ...originalResponse,
      data: originalResponse.data.map((item) =>
        item.postId === 12
          ? {
              ...item,
              group: 'REPORT',
              subGroup: 'POST_REPORT',
              status: 'WITHDRAWN',
            }
          : item
      ),
    });
    renderPage('/report/inquiry?page=2');
    await screen.findByText('user-12');
    expect(
      within(screen.getByRole('table')).getByText('이용자 철회')
    ).toBeInTheDocument();
    expect(screen.queryByText('알 수 없음')).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: '답변여부' }));
    await user.click(screen.getByRole('option', { name: '이용자 철회' }));
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=1'
    );
    expect(screen.getByText('user-12')).toBeInTheDocument();
    expect(screen.queryByText('user-1')).not.toBeInTheDocument();
    expect(screen.queryByText('user-11')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: '답변여부 필터 초기화' })
    );
    expect(await screen.findByText('user-1')).toBeInTheDocument();
    expect(screen.queryByText('user-12')).not.toBeInTheDocument();
  });

  test.each([
    [
      '/report/inquiry?page=1&inquiryId=1&postId=12',
      '/report/inquiry?page=1&postId=12',
      12,
    ],
    [
      '/report/inquiry?page=1&inquiryId=12',
      '/report/inquiry?page=1&postId=12',
      12,
    ],
    [
      '/report/inquiry?inquiryId=invalid&postId=12',
      '/report/inquiry?postId=12',
      12,
    ],
    ['/report/inquiry?inquiryId=invalid', '/report/inquiry', null],
    [
      '/report/inquiry?inquiryId=12&postId=invalid',
      '/report/inquiry?postId=invalid',
      null,
    ],
  ])(
    '이전 URL %s를 postId 기준으로 정리한다',
    async (url, expectedUrl, postId) => {
      renderPage(url);
      await waitFor(() =>
        expect(screen.getByLabelText('현재 URL').textContent).toBe(expectedUrl)
      );
      if (postId === null) {
        expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
      } else {
        expect(
          screen.getByRole('region', { name: '문의 상세' })
        ).toHaveTextContent(`상세 ${postId}`);
      }
    }
  );

  test('이전 URL을 보정한 뒤 글을 바꾸거나 닫아도 inquiryId가 다시 생기지 않는다', async () => {
    const user = userEvent.setup();
    renderPage('/report/inquiry?page=999&inquiryId=11&postId=12');
    await waitFor(() =>
      expect(screen.getByLabelText('현재 URL').textContent).toBe(
        '/report/inquiry?page=2&postId=12'
      )
    );
    await user.click(await screen.findByText('11'));
    expect(screen.getByLabelText('현재 URL').textContent).toBe(
      '/report/inquiry?page=2&postId=11'
    );
    await user.click(screen.getByRole('button', { name: '상세 닫기' }));
    expect(screen.getByLabelText('현재 URL').textContent).toBe(
      '/report/inquiry?page=2'
    );
    expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
  });

  test('URL로 진입하면 현재 목록 페이지에 없는 문의도 상세를 연다', async () => {
    renderPage('/report/inquiry?postId=12');
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 12'
    );
    await screen.findByText('user-1');
    expect(screen.queryByText('user-12')).not.toBeInTheDocument();
  });

  test('행 선택·재선택과 닫기를 URL에 반영하고 페이지를 유지한다', async () => {
    const user = userEvent.setup();
    renderPage('/report/inquiry?page=2');

    await user.click(await screen.findByText('11'));
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=2&postId=11'
    );
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 11'
    );
    await user.click(screen.getByText('11'));
    expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=2'
    );

    await user.click(screen.getByText('12'));
    await user.click(screen.getByRole('button', { name: '상세 닫기' }));
    expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=2'
    );
  });

  test('URL 이동과 뒤로 가기에 따라 선택된 상세를 전환한다', async () => {
    const user = userEvent.setup();
    renderPage('/report/inquiry?postId=1');
    await screen.findByText('user-1');
    await user.click(screen.getByRole('button', { name: '다른 문의 열기' }));
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 12'
    );
    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 1'
    );
  });

  test('페이지 번호를 보정해도 바로가기의 선택된 상세를 유지한다', async () => {
    renderPage('/report/inquiry?postId=12&page=999');
    await waitFor(() =>
      expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
        '/report/inquiry?postId=12&page=2'
      )
    );
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 12'
    );
  });

  test('유효하지 않은 문의 번호로는 상세를 열지 않는다', async () => {
    renderPage('/report/inquiry?postId=invalid');
    await screen.findByText('user-1');
    expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
  });
});
