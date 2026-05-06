import { useEffect, useMemo, useRef, useState } from 'react';

import { Input, Select } from '@/shared/components/ui';

import { useCommentSearch } from '@/domains/Comments/hooks/useCommentSearch';
import { useDeleteComment } from '@/domains/Comments/hooks/useDeleteComment';

import { useBulkDeleteComment } from '../hooks/useBulkDeleteComment';
import type { AdminCommentSearchRequest } from '../types';
import BulkDeleteBar from './BulkDeleteBar';
import CommentListItem from './CommentListItem';
import { useCommentVisibility } from './useCommentVisibility';

interface CommentListProps {
  selectedPostId: number | null;
}

export default function CommentList({ selectedPostId }: CommentListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: bulkDeleteComments } = useBulkDeleteComment();

  // body 객체를 메모이제이션하여 참조값 변화로 인한 무한 요청 방지
  const searchBody = useMemo(() => {
    const body: AdminCommentSearchRequest = {
      postId: selectedPostId ?? undefined,
    };
    if (submittedKeyword) body.content = submittedKeyword;
    if (visibilityFilter === 'visible') body.isVisible = true;
    if (visibilityFilter === 'hidden') body.isVisible = false;
    return body;
  }, [selectedPostId, submittedKeyword, visibilityFilter]);

  const {
    data: commentSearch,
    setIsSearchSubmitted,
    refetch,
  } = useCommentSearch(0, searchBody);

  // 게시글이 바뀌면 선택 상태와 키워드 초기화
  useEffect(() => {
    setSelectedIds([]);
    setKeyword('');
    setVisibilityFilter('all');
    setIsSearchSubmitted(false);
  }, [selectedPostId, setIsSearchSubmitted]);

  const selectAllRef = useRef<HTMLInputElement>(null);

  const comments = commentSearch?.data ?? [];
  const {
    visibilityLabel,
    handleBulkToggleVisibility,
    handleToggleVisibility,
  } = useCommentVisibility(comments, selectedIds);

  const allIds = comments.map((c) => c.commentId);
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

  const handleSelect = (commentId: number) => {
    setSelectedIds((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleDelete = (commentId: number) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      deleteComment(commentId, {
        onSuccess: () => {
          setSelectedIds((prev) => prev.filter((id) => id !== commentId));
          refetch();
        },
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `선택한 ${selectedIds.length}개의 댓글을 삭제하시겠습니까?`
      )
    ) {
      bulkDeleteComments(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          refetch();
        },
      });
    }
  };

  const handleSearch = () => {
    setIsSearchSubmitted(true);
    setSubmittedKeyword(keyword);
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold'>댓글 관리</h2>
        <p className='text-sm text-gray-500'>
          {selectedPostId
            ? `전체 ${commentSearch?.totalCount ?? commentSearch?.data?.length ?? ''}개`
            : '댓글 상세 검색을 이용하거나 왼쪽에서 게시글을 선택하세요.'}
        </p>
      </div>

      {/* 검색창 UI */}
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Select
            value={visibilityFilter}
            onValueChange={(v) => setVisibilityFilter(v)}
          >
            <Select.Trigger className='w-[120px] rounded-md border border-gray-200 bg-white px-3'>
              <Select.Value placeholder='노출 상태' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>전체</Select.Item>
              <Select.Item value='visible'>공개</Select.Item>
              <Select.Item value='hidden'>비공개</Select.Item>
            </Select.Content>
          </Select>
          <Input
            placeholder='댓글 내용으로 검색'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className='flex-1'
          />
          <button
            onClick={handleSearch}
            className='rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800'
          >
            검색
          </button>
        </div>
      </div>

      <BulkDeleteBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onBulkToggleVisibility={handleBulkToggleVisibility}
        visibilityLabel={visibilityLabel}
        onClearSelection={() => setSelectedIds([])}
      />

      <div className='flex-1 overflow-y-auto rounded-md border'>
        {comments.length === 0 ? (
          <p className='py-10 text-center text-sm text-gray-400'>
            댓글이 없습니다.
          </p>
        ) : (
          <div className='divide-y'>
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
            {comments.map((comment) => (
              <CommentListItem
                key={comment.commentId}
                comment={comment}
                isSelected={selectedIds.includes(comment.commentId)}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
