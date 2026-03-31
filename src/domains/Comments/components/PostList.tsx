// TODO: API 연동 시 usePostList 훅으로 상태/로직 분리 예정
import { useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/shared/components';
import { Input, Select } from '@/shared/components/ui';

import { MOCK_BOARDS, MOCK_POSTS } from '@/domains/Comments/mocks/posts';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

import BulkDeleteBar from './BulkDeleteBar';
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  //TODO: API 연동 후 클라이언트에서 필터링 제거
  const filtered = MOCK_POSTS.filter((post) => {
    if (deletedIds.includes(post.postId)) return false;
    const matchesKeyword =
      post.title.includes(keyword) ||
      post.userDisplay.includes(keyword) ||
      String(post.postId).includes(keyword);
    const matchesBoard = board === '전체' || board === String(post.boardId);
    const matchesReport = reportFilter === '전체' || post.reportCount > 0;
    return matchesKeyword && matchesBoard && matchesReport;
  });

  const allIds = filtered.map((p) => p.postId);
  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    allIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : allIds);
  };

  const handleCheck = (postId: number) => {
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleDelete = (postId: number) => {
    // TODO: 단일 삭제 API 연동
    setDeletedIds((prev) => [...prev, postId]);
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
    if (selectedPostId === postId) onSelectPost(null);
  };

  const handleBulkDelete = () => {
    // TODO: 일괄 삭제 API 연동
    setDeletedIds((prev) => [...prev, ...selectedIds]);
    if (selectedPostId !== null && selectedIds.includes(selectedPostId))
      onSelectPost(null);
    setSelectedIds([]);
  };

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
      <BulkDeleteBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
      />
      <div className='flex-1 overflow-y-auto rounded-md border'>
        {filtered.length === 0 ? (
          <p className='py-10 text-center text-sm text-gray-400'>
            게시글이 없습니다.
          </p>
        ) : (
          <div className='divide-y divide-gray-200'>
            <div className='flex items-center gap-3 px-4 py-2 text-sm text-gray-500'>
              <input
                ref={selectAllRef}
                type='checkbox'
                className='cursor-pointer'
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
              <span>전체 선택</span>
            </div>
            {filtered.map((post) => (
              <PostListItem
                key={post.postId}
                post={post}
                isSelected={selectedPostId === post.postId}
                isChecked={selectedIds.includes(post.postId)}
                onCheck={handleCheck}
                onClick={(p) =>
                  onSelectPost(selectedPostId === p.postId ? null : p)
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
