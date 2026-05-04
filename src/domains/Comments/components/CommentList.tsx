import { useEffect, useRef, useState } from 'react';

import { useCommentSearch } from '@/domains/Comments/hooks/useCommentSearch';
import { useDeleteComment } from '@/domains/Comments/hooks/useDeleteComment';

import { useBulkDeleteComment } from '../hooks/useBulkDeleteComment';
import BulkDeleteBar from './BulkDeleteBar';
import CommentListItem from './CommentListItem';

interface CommentListProps {
  selectedPostId: number | null;
}

export default function CommentList({ selectedPostId }: CommentListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: bulkDeleteComments } = useBulkDeleteComment();
  const { data: commentSearch } = useCommentSearch(0, {
    postId: selectedPostId ?? undefined,
  });

  const selectAllRef = useRef<HTMLInputElement>(null);

  const comments = commentSearch?.data ?? [];

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
        },
      });
    }
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold'>댓글 관리</h2>
        <p className='text-sm text-gray-500'>
          {selectedPostId
            ? `전체 ${commentSearch?.totalCount || commentSearch?.data?.length}개`
            : '왼쪽에서 게시글을 선택하면 댓글이 표시됩니다.'}
        </p>
      </div>

      <BulkDeleteBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
      />

      <div className='flex-1 overflow-y-auto rounded-md border'>
        {!selectedPostId ? (
          <p className='py-10 text-center text-sm text-gray-400'>
            게시글을 선택해 주세요.
          </p>
        ) : comments.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
