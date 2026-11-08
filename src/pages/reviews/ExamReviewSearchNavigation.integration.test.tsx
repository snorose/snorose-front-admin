import { MemoryRouter, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { getExamReviews } from '@/apis';

import ExamReviewPage from './ExamReviewPage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getExamReviews: vi.fn(),
}));

function Navigation() {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => navigate('/reviews/exam?keywordAuthor=새회원&page=1')}
      >
        작성 시험후기
      </button>
      <button
        onClick={() => navigate('/reviews/exam?keywordAuthor=새회원&page=2')}
      >
        다음 페이지
      </button>
    </>
  );
}

test('같은 경로의 작성자 이동은 검색 폼을 갱신하고 페이지 이동은 입력을 유지한다', async () => {
  vi.mocked(getExamReviews).mockResolvedValue({
    data: [],
    totalCount: 0,
    totalPage: 2,
    hasNext: false,
  });
  const user = userEvent.setup();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[
          '/reviews/exam?keywordAuthor=이전회원&keywordPost=이전후기&isConfirmed=true&page=1',
        ]}
      >
        <Navigation />
        <ExamReviewPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await user.click(screen.getByRole('button', { name: '작성 시험후기' }));
  const author = screen.getByRole('textbox', {
    name: '작성자 검색 (아이디, 닉네임, 학번)',
  });
  expect(author).toHaveValue('새회원');
  expect(
    screen.getByRole('textbox', { name: '시험후기명 또는 postId 검색' })
  ).toHaveValue('');
  await user.click(screen.getByRole('button', { name: '검색' }));
  await waitFor(() =>
    expect(getExamReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({
        keywordAuthor: '새회원',
        keywordPost: undefined,
        isConfirmed: undefined,
      })
    )
  );

  await user.type(author, '입력중');
  await user.click(screen.getByRole('button', { name: '다음 페이지' }));
  expect(author).toHaveValue('새회원입력중');
  client.clear();
});
