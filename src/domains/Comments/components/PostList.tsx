import { useState } from 'react';

import { PageHeader } from '@/shared/components';
import { Input, Select } from '@/shared/components/ui';

import { MOCK_BOARDS, MOCK_POSTS } from '@/domains/Comments/mocks/posts';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

import PostListItem from './PostListItem';

interface PostListProps {
  selectedPostId: number | null;
  onSelectPost: (post: AdminGetPostResponse | null) => void;
}

export default function PostList({
  selectedPostId,
  onSelectPost,
}: PostListProps) {
  const [keyword, setKeyword] = useState('');
  const [board, setBoard] = useState('전체');
  const [reportFilter, setReportFilter] = useState('전체');

  //TODO: API 연동 후 클라이언트에서 필터링 제거
  const filtered = MOCK_POSTS.filter((post) => {
    const matchesKeyword =
      post.title.includes(keyword) ||
      post.userDisplay.includes(keyword) ||
      String(post.postId).includes(keyword);
    const matchesBoard = board === '전체' || board === String(post.boardId);
    const matchesReport = reportFilter === '전체' || post.reportCount > 0;
    return matchesKeyword && matchesBoard && matchesReport;
  });

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='게시글 관리'
        description='커뮤니티에 있는 모든 게시글과 남겨진 댓글을 관리합니다.'
      />
      <Input
        placeholder='댓글 내용, 작성자(닉네임), 게시글 ID로 검색'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className='flex gap-2'>
        <Select value={board} onValueChange={setBoard}>
          <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value='전체'>전체</Select.Item>
            {MOCK_BOARDS.map((b) => (
              <Select.Item key={b.boardId} value={String(b.boardId)}>
                {b.boardName}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={reportFilter} onValueChange={setReportFilter}>
          <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value='전체'>전체</Select.Item>
            <Select.Item value='신고됨'>신고됨만</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className='flex-1 overflow-y-auto rounded-md border'>
        {filtered.length === 0 ? (
          <p className='py-10 text-center text-sm text-gray-400'>
            게시글이 없습니다.
          </p>
        ) : (
          <div className='divide-y divide-gray-200'>
            {filtered.map((post) => (
              <PostListItem
                key={post.postId}
                post={post}
                isSelected={selectedPostId === post.postId}
                onClick={(p) =>
                  onSelectPost(selectedPostId === p.postId ? null : p)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
