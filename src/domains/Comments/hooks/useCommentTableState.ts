import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import type { AdminCommentResponse } from '../types/comment';
import { getCommentStatus } from '../utils/commentUtils';
import { useBulkDeleteComment } from './useBulkDeleteComment';
import { useCommentList } from './useCommentList';
import { useUpdateCommentVisibility } from './useUpdateCommentVisibility';

interface UseCommentTableStateProps {
  searchParams: {
    content?: string;
    postId?: number;
    parentId?: number | null;
    encryptedUserId?: string;
    boardId?: number;
    isVisible?: boolean;
    isKeywordExist?: boolean;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
  refreshKey?: number;
  currentPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export function useCommentTableState({
  searchParams,
  refreshKey,
  currentPage,
  onPageChange,
}: UseCommentTableStateProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy] = useState<'reportCount' | 'createdAt'>('createdAt');
  const [sortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch } = useCommentList({
    page: currentPage,
    body: {
      content: searchParams.content,
      postId: searchParams.postId,
      parentId: searchParams.parentId,
      encryptedUserId: searchParams.encryptedUserId,
      boardId: searchParams.boardId,
      isVisible: searchParams.isVisible,
      isKeywordExist: searchParams.isKeywordExist,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    },
  });

  useEffect(() => {
    if (refreshKey) void refetch();
  }, [refreshKey, refetch]);

  const comments = useMemo<AdminCommentResponse[]>(() => {
    let list = data?.data ?? [];

    // 상태 필터링 (클라이언트 보완 필터)
    if (searchParams.status && searchParams.status !== '전체') {
      list = list.filter((c) => getCommentStatus(c) === searchParams.status);
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'reportCount') {
        return sortDir === 'asc'
          ? a.reportCount - b.reportCount
          : b.reportCount - a.reportCount;
      }
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? ta - tb : tb - ta;
    });
  }, [data, sortBy, sortDir, searchParams.status]);

  const hasNext = data?.hasNext ?? false;

  const { mutate: bulkDelete, isPending: isDeletePending } =
    useBulkDeleteComment();
  const { mutate: bulkVisibility, isPending: isVisibilityPending } =
    useUpdateCommentVisibility();

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const hasSelectedParentWithChildren = comments.some(
      (c) =>
        selectedIds.includes(c.commentId) &&
        c.parentId === null &&
        comments.some((child) => child.parentId === c.commentId)
    );

    const message = hasSelectedParentWithChildren
      ? '하위댓글도 모두 삭제하시겠습니까?'
      : `선택한 ${selectedIds.length}개의 댓글을 삭제하시겠습니까?`;

    if (!window.confirm(message)) return;

    bulkDelete(selectedIds, {
      onSuccess: (res) => {
        toast.success(`${res.deletedCount}개의 댓글이 삭제되었습니다.`);
        setSelectedIds([]);
        void refetch();
      },
      onError: () => toast.error('댓글 일괄 삭제 중 오류가 발생했습니다.'),
    });
  };

  const handleBulkVisibility = (isVisible: boolean) => {
    if (selectedIds.length === 0) return;
    bulkVisibility(
      { commentIds: selectedIds, isVisible },
      {
        onSuccess: () => {
          toast.success(
            isVisible
              ? '선택한 댓글의 비공개가 해제되었습니다.'
              : '선택한 댓글이 비공개 처리되었습니다.'
          );
          setSelectedIds([]);
          void refetch();
        },
        onError: () =>
          toast.error('노출 상태 일괄 변경 중 오류가 발생했습니다.'),
      }
    );
  };

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    bulkVisibility(
      { commentIds: selectedIds, isVisible: true },
      {
        onSuccess: () => {
          toast.success('선택한 댓글이 성공적으로 복구되었습니다.');
          setSelectedIds([]);
          void refetch();
        },
        onError: () => toast.error('댓글 복구 중 오류가 발생했습니다.'),
      }
    );
  };

  // 체크박스 제어
  const allCommentIds = comments.map((c) => c.commentId);
  const isAllSelected =
    allCommentIds.length > 0 &&
    allCommentIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    allCommentIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allCommentIds.includes(id))
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...allCommentIds]))
      );
    }
  };

  // 비공개 해제 / 삭제 복구 단건 토글 액션
  const handleSingleVisibility = (comment: AdminCommentResponse) => {
    const isCurrentlyVisible = comment.isVisible;
    bulkVisibility(
      { commentIds: [comment.commentId], isVisible: !isCurrentlyVisible },
      {
        onSuccess: () => {
          toast.success(
            !isCurrentlyVisible
              ? '댓글이 공개로 전환되었습니다.'
              : '댓글이 비공개 처리되었습니다.'
          );
          void refetch();
        },
        onError: () => toast.error('상태 변경 실패'),
      }
    );
  };

  // 더블클릭 필터 적용 유틸리티
  const handleFilterByPostId = (postId: number) => {
    onPageChange(1);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('postId', String(postId));
    newParams.set('page', '1');
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const handleFilterByParentId = (parentId: number) => {
    onPageChange(1);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('parentId', String(parentId));
    newParams.set('page', '1');
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  return {
    comments,
    isLoading,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    isSomeSelected,
    selectAllRef,
    handleSelectAll,
    handleSingleVisibility,
    handleFilterByPostId,
    handleFilterByParentId,
    handleBulkDelete,
    handleBulkVisibility,
    handleBulkRestore,
    isDeletePending,
    isVisibilityPending,
    hasNext,
    totalCount: data?.totalCount,
  };
}
