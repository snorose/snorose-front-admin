import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { PATHS } from '@/shared/constants/paths';
import type {
  AdminUserListItem,
  BlacklistHistoryItem,
  MemberInfo,
} from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  createMemberDiffPayload,
  extractFirstSearchMember,
  toBlacklistHistoryItem,
} from '@/domains/MemberInfo/utils/memberDirectory';

import { blacklistHistoryAPI, editUsersAPI, searchUsersAPI } from '@/apis';

type UseMemberDetailStateParams = {
  currentPage: number;
  loadMembers: (page: number) => Promise<void>;
  memberKey: string | null;
  members: AdminUserListItem[];
  searchResultMembers: AdminUserListItem[] | null;
  updateCachedMember: (member: MemberInfo) => void;
};

export function useMemberDetailState({
  currentPage,
  loadMembers,
  memberKey,
  members,
  searchResultMembers,
  updateCachedMember,
}: UseMemberDetailStateParams) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [latestPenaltyHistory, setLatestPenaltyHistory] =
    useState<BlacklistHistoryItem | null>(null);
  const [penaltyHistory, setPenaltyHistory] = useState<BlacklistHistoryItem[]>(
    []
  );
  const [penaltyHistoryPage, setPenaltyHistoryPage] = useState(0);
  const [hasNextPenaltyHistory, setHasNextPenaltyHistory] = useState(false);
  const [isPenaltyHistoryLoading, setIsPenaltyHistoryLoading] = useState(false);
  const [penaltyHistoryTotalCount, setPenaltyHistoryTotalCount] = useState(0);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchMemberDetail = useCallback(async (keywords: string[]) => {
    let latestError: unknown = null;

    for (const keyword of keywords) {
      if (!keyword.trim()) continue;
      try {
        const response = await searchUsersAPI(keyword);
        const resolvedMember = extractFirstSearchMember(response);
        if (resolvedMember) return resolvedMember;
      } catch (error) {
        latestError = error;
      }
    }

    if (latestError) throw latestError;
    return null;
  }, []);

  const findMemberListItemByEncryptedUserId = useCallback(
    async (encryptedUserId: string) => {
      const cachedMember =
        members.find((member) => member.encryptedUserId === encryptedUserId) ??
        searchResultMembers?.find(
          (member) => member.encryptedUserId === encryptedUserId
        ) ??
        null;

      return cachedMember;
    },
    [members, searchResultMembers]
  );

  const fetchPenaltyHistoryPage = useCallback(
    async (encryptedUserId: string, studentNumber: string, page: number) => {
      const response = await blacklistHistoryAPI(encryptedUserId, {
        page,
      });
      const history = response.data.map((item) =>
        toBlacklistHistoryItem(item, {
          encryptedUserId,
          studentNumber,
        })
      );

      return { history, response };
    },
    []
  );

  useEffect(() => {
    if (!memberKey) {
      setSelectedMember(null);
      setLatestPenaltyHistory(null);
      setPenaltyHistory([]);
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(false);
      setPenaltyHistoryTotalCount(0);
      setIsEdit(false);
      return;
    }

    const locationState = location.state as {
      detailKeywords?: string[];
      prefetchedMember?: MemberInfo;
    } | null;
    const prefetchedMember = locationState?.prefetchedMember;
    const detailKeywords = locationState?.detailKeywords ?? [];

    setSelectedMember(
      prefetchedMember?.encryptedUserId === memberKey ? prefetchedMember : null
    );

    let isMounted = true;
    setIsDetailLoading(true);

    void (async () => {
      try {
        let resultMember =
          prefetchedMember?.encryptedUserId === memberKey
            ? prefetchedMember
            : await fetchMemberDetail(detailKeywords);

        if (!resultMember) {
          const matchedListMember =
            await findMemberListItemByEncryptedUserId(memberKey);
          if (matchedListMember) {
            resultMember = await fetchMemberDetail([
              matchedListMember.loginId,
              matchedListMember.studentNumber,
              matchedListMember.userName,
            ]);
          }
        }

        if (!isMounted) return;
        if (!resultMember) {
          toast.error('회원 상세 정보를 찾지 못했습니다.');
          navigate(PATHS.MEMBER_INFO, { replace: true });
          return;
        }

        setSelectedMember(resultMember);
      } catch (error) {
        if (!isMounted) return;
        toast.error(
          getErrorMessage(error, '회원 상세 정보를 불러오지 못했습니다.')
        );
        navigate(PATHS.MEMBER_INFO, { replace: true });
      } finally {
        if (isMounted) setIsDetailLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    fetchMemberDetail,
    findMemberListItemByEncryptedUserId,
    location.state,
    memberKey,
    navigate,
  ]);

  useEffect(() => {
    const encryptedUserId = selectedMember?.encryptedUserId;
    const studentNumber = selectedMember?.studentNumber;

    if (!encryptedUserId || !studentNumber) {
      setLatestPenaltyHistory(null);
      setPenaltyHistory([]);
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(false);
      setPenaltyHistoryTotalCount(0);
      return;
    }

    let isMounted = true;
    void (async () => {
      try {
        setIsPenaltyHistoryLoading(true);
        const { history, response } = await fetchPenaltyHistoryPage(
          encryptedUserId,
          studentNumber,
          0
        );
        if (!isMounted) return;
        setPenaltyHistory(history);
        setLatestPenaltyHistory(resolveLatestPenaltyHistory(history));
        setPenaltyHistoryPage(0);
        setHasNextPenaltyHistory(response.hasNext);
        setPenaltyHistoryTotalCount(response.totalCount);
      } catch (error) {
        if (!isMounted) return;
        toast.error(getErrorMessage(error, '제재 이력 조회에 실패했습니다.'));
        setPenaltyHistory([]);
        setLatestPenaltyHistory(null);
        setPenaltyHistoryPage(0);
        setHasNextPenaltyHistory(false);
        setPenaltyHistoryTotalCount(0);
      } finally {
        if (isMounted) setIsPenaltyHistoryLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    fetchPenaltyHistoryPage,
    selectedMember?.encryptedUserId,
    selectedMember?.studentNumber,
  ]);

  const handleLoadMorePenaltyHistory = useCallback(async () => {
    if (!selectedMember || isPenaltyHistoryLoading || !hasNextPenaltyHistory) {
      return;
    }

    const nextPage = penaltyHistoryPage + 1;

    try {
      setIsPenaltyHistoryLoading(true);
      const { history: nextHistory, response } = await fetchPenaltyHistoryPage(
        selectedMember.encryptedUserId,
        selectedMember.studentNumber,
        nextPage
      );

      setPenaltyHistory((prev) => [...prev, ...nextHistory]);
      setPenaltyHistoryPage(nextPage);
      setHasNextPenaltyHistory(response.hasNext);
      setPenaltyHistoryTotalCount(response.totalCount);
    } catch (error) {
      toast.error(
        getErrorMessage(error, '다음 제재 이력을 불러오지 못했습니다.')
      );
    } finally {
      setIsPenaltyHistoryLoading(false);
    }
  }, [
    fetchPenaltyHistoryPage,
    hasNextPenaltyHistory,
    isPenaltyHistoryLoading,
    penaltyHistoryPage,
    selectedMember,
  ]);

  const handleRefreshPenaltyHistory = useCallback(async () => {
    if (!selectedMember) return;

    try {
      setIsPenaltyHistoryLoading(true);
      const { history, response } = await fetchPenaltyHistoryPage(
        selectedMember.encryptedUserId,
        selectedMember.studentNumber,
        0
      );
      setPenaltyHistory(history);
      setLatestPenaltyHistory(resolveLatestPenaltyHistory(history));
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(response.hasNext);
      setPenaltyHistoryTotalCount(response.totalCount);
    } catch (error) {
      toast.error(
        getErrorMessage(error, '제재 이력을 다시 불러오지 못했습니다.')
      );
    } finally {
      setIsPenaltyHistoryLoading(false);
    }
  }, [fetchPenaltyHistoryPage, selectedMember]);

  const handleSaveEdit = useCallback(
    async (updated: MemberInfo) => {
      if (!selectedMember) return;

      try {
        const diffPayload = createMemberDiffPayload(selectedMember, updated);
        if (Object.keys(diffPayload).length === 0) {
          toast.info('변경 사항이 없습니다.');
          return;
        }

        await editUsersAPI(selectedMember.encryptedUserId, diffPayload);

        const nextSelectedMember = { ...selectedMember, ...updated };
        setSelectedMember(nextSelectedMember);
        updateCachedMember(nextSelectedMember);
        setIsEdit(false);
        toast.success('회원 정보가 수정되었습니다.');
        await loadMembers(currentPage);
      } catch (error) {
        toast.error(getErrorMessage(error, '회원 정보 수정에 실패했습니다.'));
      }
    },
    [currentPage, loadMembers, selectedMember, updateCachedMember]
  );

  const handleRefreshMemberDetail = useCallback(async () => {
    if (!selectedMember) return;

    setIsDetailLoading(true);
    try {
      const refreshedMember = await fetchMemberDetail([
        selectedMember.loginId,
        selectedMember.studentNumber,
        selectedMember.userName,
      ]);

      if (!refreshedMember) {
        toast.error('회원 상세 정보를 다시 불러오지 못했습니다.');
        return;
      }

      setSelectedMember(refreshedMember);
      updateCachedMember(refreshedMember);
      await loadMembers(currentPage);
    } catch (error) {
      toast.error(
        getErrorMessage(error, '회원 상세 정보를 다시 불러오지 못했습니다.')
      );
    } finally {
      setIsDetailLoading(false);
    }
  }, [
    currentPage,
    fetchMemberDetail,
    loadMembers,
    selectedMember,
    updateCachedMember,
  ]);

  const handleCopy = useCallback(async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success('복사되었습니다.');
  }, []);

  const handleBack = useCallback(() => {
    setIsEdit(false);

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(PATHS.MEMBER_INFO, { replace: true });
  }, [navigate]);

  return {
    handleBack,
    handleCopy,
    handleLoadMorePenaltyHistory,
    handleRefreshMemberDetail,
    handleRefreshPenaltyHistory,
    handleSaveEdit,
    hasNextPenaltyHistory,
    isDetailLoading,
    isEdit,
    isPenaltyHistoryLoading,
    latestPenaltyHistory,
    penaltyHistory,
    penaltyHistoryTotalCount,
    selectedMember,
    setIsEdit,
  };
}

function resolveLatestPenaltyHistory(history: BlacklistHistoryItem[]) {
  if (history.length === 0) return null;

  const sortedHistory = [...history].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    sortedHistory.find(
      (item) => item.type !== '경고' && item.type !== 'WARNING'
    ) ?? sortedHistory[0]
  );
}
