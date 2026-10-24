import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { examReviewDetailQueryKey } from '@/domains/Reviews/hooks';
import type {
  ExamReview,
  ExamReviewDetailResult,
} from '@/domains/Reviews/types';

import { getExamReviewDetail } from '@/apis';

import ExamReviewPage from './ExamReviewPage';

vi.hoisted(() => {
  vi.stubEnv('VITE_USER_FRONT_BASE_URL', 'https://www.snorose.com');
});
afterAll(() => vi.unstubAllEnvs());

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getExamReviewDetail: vi.fn(),
}));

const review = (id: number): ExamReview => ({
  id,
  status: 'UNCONFIRMED',
  reviewTitle: `시험후기 ${id}`,
  courseName: '운영체제',
  professor: '김교수',
  semester: '2026-1',
  examType: '중간고사',
  classNumber: '1',
  questionDetail: '',
  uploadTime: '',
  userDisplay: '익명',
  isDiscussed: false,
  isReported: false,
  reportCount: 0,
  processStatuses: [],
});

const detail = (postId: number): ExamReviewDetailResult => ({
  encryptedUserId: 'mock-user',
  userNickname: '익명',
  postId,
  title: `시험후기 ${postId}`,
  commentCount: 0,
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
});

vi.mock('@/domains/Reviews/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/domains/Reviews/components')>()),
  ExamSearch: () => null,
  ExamTable: ({ onRowSelect }: { onRowSelect: (item: ExamReview) => void }) => (
    <>
      {[101, 102, 0].map((id) => (
        <button key={id} onClick={() => onRowSelect(review(id))}>
          후기 {id} 선택
        </button>
      ))}
    </>
  ),
}));

function deferred() {
  let resolve!: (value: ExamReviewDetailResult) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<ExamReviewDetailResult>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ExamReviewPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return client;
}

const link = () => screen.queryByRole('link', { name: /^스노로즈에서 보기/ });

describe('시험후기 원본 링크 주입', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('미선택·상세 로딩에는 숨기고 선택 변경 후 늦은 이전 응답을 노출하지 않는다', async () => {
    const user = userEvent.setup();
    const first = deferred();
    const second = deferred();
    vi.mocked(getExamReviewDetail)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const client = renderPage();
    expect(link()).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '후기 101 선택' }));
    expect(link()).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '후기 102 선택' }));
    expect(link()).not.toBeInTheDocument();
    await act(async () => second.resolve(detail(102)));
    await waitFor(() =>
      expect(link()).toHaveAttribute(
        'href',
        'https://www.snorose.com/board/exam-review/post/102'
      )
    );
    await act(async () => first.resolve(detail(101)));
    expect(link()).toHaveAttribute(
      'href',
      'https://www.snorose.com/board/exam-review/post/102'
    );
    client.clear();
  });

  test('캐시가 있어도 재조회 중·실패에는 숨기고 재시도 성공 시 복원한다', async () => {
    const user = userEvent.setup();
    const refreshed = deferred();
    vi.mocked(getExamReviewDetail)
      .mockResolvedValueOnce(detail(101))
      .mockReturnValueOnce(refreshed.promise)
      .mockResolvedValueOnce(detail(101));
    const client = renderPage();
    await user.click(screen.getByRole('button', { name: '후기 101 선택' }));
    await waitFor(() => expect(link()).toBeInTheDocument());

    act(() => {
      void client.invalidateQueries({
        queryKey: examReviewDetailQueryKey(101),
      });
    });
    await waitFor(() => expect(link()).not.toBeInTheDocument());
    await act(async () => refreshed.reject(new Error('상세 조회 실패')));
    await screen.findByRole('alert');
    expect(link()).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(link()).toBeInTheDocument());
    expect(link()).toHaveAttribute('target', '_blank');
    expect(link()).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link()).toHaveAttribute('title', '스노로즈에서 보기');
    client.clear();
  });

  test.each([
    [101, 102],
    [0, 0],
  ])(
    '선택 %i와 응답 %i가 일치하지 않거나 유효하지 않으면 숨긴다',
    async (selectedId, responseId) => {
      const user = userEvent.setup();
      vi.mocked(getExamReviewDetail).mockResolvedValueOnce(detail(responseId));
      const client = renderPage();
      await user.click(
        screen.getByRole('button', { name: `후기 ${selectedId} 선택` })
      );
      await waitFor(() =>
        expect(getExamReviewDetail).toHaveBeenCalledWith(selectedId)
      );
      await waitFor(() => expect(client.isFetching()).toBe(0));
      expect(link()).not.toBeInTheDocument();
      client.clear();
    }
  );

  test('삭제된 후기도 URL을 제공하고 탭·수정 상태와 독립적으로 유지한다', async () => {
    const user = userEvent.setup();
    vi.mocked(getExamReviewDetail).mockResolvedValueOnce({
      ...detail(101),
      deletionStatus: 'ADMIN_DELETED',
    });
    const client = renderPage();
    await user.click(screen.getByRole('button', { name: '후기 101 선택' }));
    await waitFor(() => expect(link()).toBeInTheDocument());
    expect(
      screen.queryByRole('button', { name: '시험 후기 삭제' })
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('tab', { name: '게시글 및 작성자 정보' })
    );
    expect(link()).toHaveAttribute(
      'href',
      'https://www.snorose.com/board/exam-review/post/101'
    );
    client.clear();
  });
});
