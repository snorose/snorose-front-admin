import { useEffect, useMemo, useRef, useState } from 'react';

import { toast } from 'sonner';

import type { MemberInfo } from '@/shared/types';

import { extractFirstSearchMember } from '@/domains/MemberInfo/utils/memberDirectory';

import { searchUsersAPI } from '@/apis/users';

import type { AdminGetPostResponse } from '../types/post';
import { useBulkDeletePost } from './useBulkDeletePost';
import { useDeletePost } from './useDeletePost';
import { usePostList } from './usePostList';
import { useUpdatePostVisibility } from './useUpdatePostVisibility';

interface UsePostTableStateProps {
  searchParams: {
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
}

export function usePostTableState({
  searchParams,
  refreshKey,
  currentPage,
}: UsePostTableStateProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [activePopoverId, setActivePopoverId] = useState<number | null>(null);
  const [popoverUser, setPopoverUser] = useState<MemberInfo | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    setActivePopoverId(null);
  }, [
    searchParams.encryptedUserId,
    searchParams.boardId,
    searchParams.isVisible,
    searchParams.isKeywordExist,
    searchParams.startDate,
    searchParams.endDate,
    searchParams.status,
  ]);

  const statusParams = useMemo(() => {
    if (
      !searchParams.status ||
      searchParams.status === 'all' ||
      searchParams.status === '전체'
    ) {
      return {};
    }
    const mapping: Record<
      string,
      { adminCommonStatuses?: string[]; isVisible?: boolean }
    > = {
      신고누적: { adminCommonStatuses: ['REPORTED'] },
      리자삭제: { adminCommonStatuses: ['ADMIN_DELETED'] },
      유저삭제: { adminCommonStatuses: ['USER_DELETED'] },
      자동숨김: { adminCommonStatuses: ['AUTO_HIDDEN'] },
      징계: { adminCommonStatuses: ['SANCTIONED'] },
      리자비공개: { isVisible: false },
      정상: { isVisible: true },

      REPORTED: { adminCommonStatuses: ['REPORTED'] },
      ADMIN_DELETED: { adminCommonStatuses: ['ADMIN_DELETED'] },
      USER_DELETED: { adminCommonStatuses: ['USER_DELETED'] },
      AUTO_HIDDEN: { adminCommonStatuses: ['AUTO_HIDDEN'] },
      SANCTIONED: { adminCommonStatuses: ['SANCTIONED'] },
      ADMIN_HIDDEN: { isVisible: false },
    };
    return mapping[searchParams.status] || {};
  }, [searchParams.status]);

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
      boardId:
        searchParams.boardId !== undefined &&
        searchParams.boardId !== null &&
        !isNaN(Number(searchParams.boardId))
          ? Number(searchParams.boardId)
          : undefined,
      isVisible:
        searchParams.isVisible !== undefined
          ? searchParams.isVisible
          : statusParams.isVisible,
      isKeywordExist: searchParams.isKeywordExist,
      startDate: searchParams.startDate || undefined,
      endDate: searchParams.endDate || undefined,
      adminCommonStatuses: statusParams.adminCommonStatuses,
    },
  });

  useEffect(() => {
    if (refreshKey) void refetch();
  }, [refreshKey, refetch]);

  const posts = useMemo<AdminGetPostResponse[]>(() => {
    return rawPosts ?? [];
  }, [rawPosts]);

  const { mutate: bulkDelete, isPending: isDeletePending } =
    useBulkDeletePost();
  const { mutate: singleDelete } = useDeletePost();
  const { mutate: bulkVisibility, isPending: isVisibilityPending } =
    useUpdatePostVisibility();

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const message = `선택한 ${selectedIds.length}개의 게시글을 삭제하시겠습니까?`;
    if (!window.confirm(message)) return;

    const deleteComments = window.confirm('댓글도 모두 삭제하시겠습니까?');

    bulkDelete(selectedIds, {
      onSuccess: (res) => {
        const deletedCount = res?.deletedCount ?? selectedIds.length;
        if (deleteComments) {
          toast.success(
            `${deletedCount}개의 게시글과 관련 댓글이 삭제되었습니다.`
          );
        } else {
          toast.success(`${deletedCount}개의 게시글이 삭제되었습니다.`);
        }
        setSelectedIds([]);
      },
      onError: () => toast.error('게시글 일괄 삭제 중 오류가 발생했습니다.'),
    });
  };

  const handleBulkVisibility = (isVisible: boolean) => {
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

  const handleSingleDelete = (postId: number) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

    singleDelete(postId, {
      onSuccess: () => {
        toast.success('게시글이 삭제되었습니다.');
        setSelectedIds((prev) => prev.filter((id) => id !== postId));
      },
      onError: () => toast.error('게시글 삭제 중 오류가 발생했습니다.'),
    });
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

  const handleNicknameClick = async (
    e: React.MouseEvent,
    post: AdminGetPostResponse
  ) => {
    e.stopPropagation();

    if (activePopoverId === post.postId) {
      setActivePopoverId(null);
      setPopoverUser(null);
      return;
    }

    setActivePopoverId(post.postId);
    setPopoverUser(null);
    setIsUserLoading(true);

    try {
      const display = post.nickName || '익명';
      const res = await searchUsersAPI(display);
      const member = extractFirstSearchMember(res?.result);
      if (member) {
        setPopoverUser(member);
      } else {
        setPopoverUser({
          encryptedUserId: post.encryptedUserId,
          loginId: '정보 없음',
          userName: display,
          email: '',
          nickname: display,
          userRoleId: 1,
          studentNumber: '정보 없음',
          major: '정보 없음',
          birthday: '',
          pointBalance: 0,
          createdAt: '',
          authenticatedAt: null,
          totalWarningCount: 0,
          isBlacklist: false,
          blacklistStartDate: null,
          blacklistEndDate: null,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('회원 상세 조회에 실패했습니다.');
    } finally {
      setIsUserLoading(false);
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
    activePopoverId,
    setActivePopoverId,
    popoverUser,
    isUserLoading,
    handleNicknameClick,
    handleBulkDelete,
    handleBulkVisibility,
    handleBulkRestore,
    handleSingleDelete,
    isDeletePending,
    isVisibilityPending,
    hasNext: hasNext ?? posts.length > 0,
    totalCount,
  };
}
