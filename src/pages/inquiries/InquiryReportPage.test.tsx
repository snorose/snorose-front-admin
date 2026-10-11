import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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
    await user.click(await screen.findByText('user-11'));
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

    await user.click(await screen.findByText('user-11'));
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=2&postId=11'
    );
    expect(screen.getByRole('region', { name: '문의 상세' })).toHaveTextContent(
      '상세 11'
    );
    await user.click(screen.getByText('user-11'));
    expect(screen.queryByRole('region', { name: '문의 상세' })).toBeNull();
    expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
      '/report/inquiry?page=2'
    );

    await user.click(screen.getByText('user-12'));
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
