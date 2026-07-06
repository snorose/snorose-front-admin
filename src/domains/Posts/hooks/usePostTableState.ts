import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import type { PostSearchParams } from '../types/post';
import { useBulkDeletePost } from './useBulkDeletePost';
import { usePostList } from './usePostList';
import { useUpdatePostVisibility } from './useUpdatePostVisibility';

interface UsePostTableStateProps {
  searchParams: PostSearchParams;
  refreshKey?: number;
  currentPage: number;
}

export function usePostTableState({
  searchParams,
  refreshKey,
  currentPage,
}: UsePostTableStateProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [
    searchParams.encryptedUserId,
    searchParams.boardId,
    searchParams.isNotice,
    searchParams.isVisible,
    searchParams.isKeywordExist,
    searchParams.keywordAuthor,
    searchParams.keywordPost,
    searchParams.postSearchScope,
    searchParams.startDate,
    searchParams.endDate,
    searchParams.sortTypes,
    searchParams.sortDirection,
    searchParams.adminCommonStatuses,
  ]);

  const {
    data: rawPosts,
    isLoading,
    error,
    hasNext,
    totalCount,
    refetch,
  } = usePostList({
    page: currentPage,
    body: {
      encryptedUserId: searchParams.encryptedUserId,
      boardId: searchParams.boardId,
      isVisible: searchParams.isVisible,
      isKeywordExist: searchParams.isKeywordExist,
      startDate: searchParams.startDate || undefined,
      endDate: searchParams.endDate || undefined,
      adminCommonStatuses: searchParams.adminCommonStatuses,
      keywordAuthor: searchParams.keywordAuthor,
      keywordPost: searchParams.keywordPost,
      postSearchScope: searchParams.postSearchScope,
      sortTypes: searchParams.sortTypes ? [searchParams.sortTypes] : undefined,
      sortDirection: searchParams.sortDirection,
      isNotice: searchParams.isNotice,
    },
  });

  useEffect(() => {
    if (refreshKey) void refetch();
  }, [refreshKey, refetch]);

  const posts = rawPosts ?? [];

  const { mutate: bulkDelete, isPending: isDeletePending } =
    useBulkDeletePost();
  const { mutate: bulkVisibility, isPending: isVisibilityPending } =
    useUpdatePostVisibility();

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = (memo: string) => {
    if (selectedIds.length === 0) return;
    bulkDelete(
      { postIds: selectedIds, memo },
      {
        onSuccess: (res) => {
          const deletedCount = res?.deletedCount ?? selectedIds.length;
          toast.success(`${deletedCount}개의 게시글이 삭제되었습니다.`);
          setSelectedIds([]);
          setIsDeleteModalOpen(false);
        },
        onError: () => toast.error('게시글 일괄 삭제 중 오류가 발생했습니다.'),
      }
    );
  };

  const handleBulkVisibility = (isVisible: boolean) => {
    // TODO: 추후 API 연동 완료 시 아래 플래그를 true로 변경하거나 블록 삭제
    const IS_READY = false;
    if (!IS_READY) {
      toast.info('개발 중입니다');
      return;
    }

    if (selectedIds.length === 0) return;
    bulkVisibility(
      { postIds: selectedIds, isVisible },
      {
        onSuccess: () => {
          toast.success(
            isVisible
              ? '선택한 게시글의 비공개가 해제되었습니다.'
              : '선택한 게시글이 비공개 처리되었습니다.'
          );
          setSelectedIds([]);
        },
        onError: () =>
          toast.error('노출 상태 일괄 변경 중 오류가 발생했습니다.'),
      }
    );
  };

  const handleBulkRestore = () => {
    // TODO: 추후 API 연동 완료 시 아래 플래그를 true로 변경하거나 블록 삭제
    const IS_READY = false;
    if (!IS_READY) {
      toast.info('개발 중입니다');
      return;
    }

    if (selectedIds.length === 0) return;
    bulkVisibility(
      { postIds: selectedIds, isVisible: true },
      {
        onSuccess: () => {
          toast.success('선택한 게시글과 댓글이 성공적으로 복구되었습니다.');
          setSelectedIds([]);
        },
        onError: () => toast.error('게시글 복구 중 오류가 발생했습니다.'),
      }
    );
  };

  const allPostIds = posts.map((p) => p.postId);
  const isAllSelected =
    allPostIds.length > 0 && allPostIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    allPostIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allPostIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allPostIds])));
    }
  };

  return {
    posts,
    isLoading,
    error,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    isSomeSelected,
    selectAllRef,
    handleSelectAll,
    handleBulkDelete,
    handleConfirmBulkDelete,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleBulkVisibility,
    handleBulkRestore,
    isDeletePending,
    isVisibilityPending,
    hasNext: hasNext ?? posts.length > 0,
    totalCount,
  };
}
