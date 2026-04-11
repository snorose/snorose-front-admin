import { ArrowRight } from 'lucide-react';

import { PageHeader } from '@/shared/components';
import { Input, Select } from '@/shared/components/ui';

import type { AdminGetPostResponse } from '@/domains/Comments/types';

import usePostListFilter from '../hooks/usePostListFilter';
import BulkDeleteBar from './BulkDeleteBar';
import PostListItem from './PostListItem';

interface PostListProps {
  selectedPostId: number | null;
  onSelectPost: (post: AdminGetPostResponse | null) => void;
  onOpenModal: (post: AdminGetPostResponse) => void;
}

export default function PostList({
  selectedPostId,
  onSelectPost,
  onOpenModal,
}: PostListProps) {
  const {
    category,
    setCategory,
    keyword,
    setKeyword,
    reportFilter,
    setReportFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedIds,
    setSelectedIds,
    handleCheck,
    selectAllRef,
    isAllSelected,
    handleSelectAll,
    handleBulkDelete,
    handleDelete,
    filtered,
    categories,
  } = usePostListFilter({
    selectedPostId,
    onSelectPost,
  });

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='게시글 관리'
        description='커뮤니티에 있는 모든 게시글과 남겨진 댓글을 관리합니다.'
      />
      <Input
        placeholder='게시글 제목, 작성자(닉네임), 게시글 ID로 검색'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className='flex items-center'>
        <Input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <ArrowRight className='mx-2' />
        <Input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className='flex gap-2'>
        <Select value={category} onValueChange={setCategory}>
          <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
            <Select.Value placeholder='카테고리' />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value='전체'>전체</Select.Item>
            {categories.map((c) => (
              <Select.Item key={c} value={c}>
                {c}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={reportFilter} onValueChange={setReportFilter}>
          <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
            <Select.Value placeholder='미노출 사유' />
          </Select.Trigger>
          <Select.Content>
            {/* TODO: 백엔드 미노출 사유 enum API 연동 시 하드코딩 제거 후 map으로 교체 */}
            <Select.Item value='전체'>전체</Select.Item>
            <Select.Item value='신고됨'>신고누적</Select.Item>
            <Select.Item value='삭제됨'>삭제됨</Select.Item>
            <Select.Item value='리자삭제'>리자삭제</Select.Item>
            <Select.Item value='리자비공개'>리자비공개</Select.Item>
            <Select.Item value='해당없음'>해당없음</Select.Item>
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
                onClick={(post) =>
                  onSelectPost(selectedPostId === post.postId ? null : post)
                }
                onOpenModal={onOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
