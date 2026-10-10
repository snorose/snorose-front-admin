import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { useBulkDelete } from '@/shared/hooks';

import { bulkDeletePosts } from '@/apis';

import type { PostSearchParams } from '../types/post';
import { useDeletePost } from './useDeletePost';
import { usePostList } from './usePostList';
import { useRestorePost } from './useRestorePost';
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
  const [visibilityModalType, setVisibilityModalType] = useState<
    'SHOW' | 'HIDE' | null
  >(null);

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
    isFetching,
    error,
    totalPage,
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

  const { mutate: bulkDelete, isPending: isDeletePending } = useBulkDelete({
    deleteFn: bulkDeletePosts,
    queryKey: ['posts'],
  });
  const { mutate: singleDelete } = useDeletePost();
  const { mutate: restorePost, isPending: isRestorePending } = useRestorePost();
  const { mutate: bulkVisibility, isPending: isVisibilityPending } =
    useUpdatePostVisibility();

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = (memo: string) => {
    if (selectedIds.length === 0) return;
    bulkDelete(
      { ids: selectedIds, memo },
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

  // 목록 버튼을 누르면 모달만 엽니다.
  const handleBulkVisibility = (isVisible: boolean) => {
    if (selectedIds.length === 0) return;

    setVisibilityModalType(isVisible ? 'SHOW' : 'HIDE');
  };

  // 모달에서 확인하면 입력한 메모로 요청합니다.
  const handleConfirmBulkVisibility = (memo: string) => {
    if (visibilityModalType === null || selectedIds.length === 0) return;
    if (!memo.trim()) return;

    bulkVisibility(
      {
        postIds: selectedIds,
        isVisible: visibilityModalType === 'SHOW',
        memo,
      },
      {
        onSuccess: (result) => {
          if (result.succeededCount === 0) {
            toast.error('선택한 게시글의 공개 상태를 변경하지 못했습니다.');
            return;
          }

          if (result.failedPosts.length > 0) {
            toast.warning(
              `${result.succeededCount}개 변경 완료, ${result.failedPosts.length}개 실패했습니다.`
            );
          } else {
            toast.success(
              `${result.succeededCount}개의 공개 상태를 변경했습니다.`
            );
          }

          const succeededIds = new Set(result.succeededPostIds);
          setSelectedIds((prev) => prev.filter((id) => !succeededIds.has(id)));
          setVisibilityModalType(null);
        },
        onError: () => toast.error('공개 상태 변경에 실패했습니다.'),
      }
    );
  };

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    restorePost(selectedIds, {
      onSuccess: ({ restored, restoredIds, failedIds }) => {
        if (failedIds.length > 0) {
          toast.warning(
            `${restored.length}개의 게시글이 복구되었고, ${failedIds.length}개는 실패했습니다.`
          );
        } else {
          toast.success(`${restored.length}개의 게시글이 복구되었습니다.`);
        }

        const restoredIdSet = new Set(restoredIds);
        setSelectedIds((prev) => prev.filter((id) => !restoredIdSet.has(id)));
      },
      onError: () => toast.error('게시글 복구 중 오류가 발생했습니다.'),
    });
  };

  const handleSingleDelete = (postId: number) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

    singleDelete(
      { postId, memo: '' },
      {
        onSuccess: () => {
          toast.success('게시글이 삭제되었습니다.');
          setSelectedIds((prev) => prev.filter((id) => id !== postId));
        },
        onError: () => toast.error('게시글 삭제 중 오류가 발생했습니다.'),
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
    isFetching,
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
    visibilityModalType,
    setVisibilityModalType,
    handleConfirmBulkVisibility,
    handleBulkRestore,
    handleSingleDelete,
    isDeletePending,
    isVisibilityPending: isVisibilityPending || isRestorePending,
    totalPage,
    totalCount,
  };
}
