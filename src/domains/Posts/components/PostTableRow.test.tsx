import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { AdminGetPostResponse } from '../types/post';
import PostTableRow from './PostTableRow';

const DELETED_POST: AdminGetPostResponse = {
  postId: 1725732,
  encryptedUserId: 'encrypted-user-id',
  boardName: '주거',
  nickName: '리자',
  category: '외부기숙사',
  title: '외부기숙사 태그',
  content: '<p>완벽</p>',
  commentCount: 0,
  viewCount: 0,
  likeCount: 0,
  scrapCount: 0,
  reportCount: 0,
  isNotice: false,
  isVisible: false,
  isKeywordExist: false,
  adminCommonStatuses: ['ADMIN_DELETED'],
  createdAt: '2026-08-30T21:55:00',
};

describe('PostTableRow', () => {
  test('상세 이동 전에 목록의 게시글을 상세 쿼리 캐시에 저장한다', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/posts/manage']}>
          <Routes>
            <Route
              path='/posts/manage'
              element={
                <table>
                  <tbody>
                    <PostTableRow
                      post={DELETED_POST}
                      isSelected={false}
                      onSelectToggle={vi.fn()}
                    />
                  </tbody>
                </table>
              }
            />
            <Route path='/posts/manage/:postId' element={<p>게시글 상세</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await user.click(screen.getByText(DELETED_POST.title));

    expect(queryClient.getQueryData(['post', DELETED_POST.postId])).toEqual(
      DELETED_POST
    );
    expect(screen.getByText('게시글 상세')).toBeInTheDocument();
  });
});
