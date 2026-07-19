import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { PATHS } from '@/shared/constants/paths';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  createMemberDiffPayload,
  toBlacklistHistoryItem,
} from '@/domains/MemberInfo/utils/memberDirectory';

import { blacklistHistoryAPI, editUsersAPI, getUserDetailAPI } from '@/apis';

type UseMemberDetailStateParams = {
  currentPage: number;
  loadMembers: (page: number) => Promise<void>;
  memberKey: string | null;
  updateCachedMember: (member: MemberInfo) => void;
};

export function useMemberDetailState({
  currentPage,
  loadMembers,
  memberKey,
  updateCachedMember,
}: UseMemberDetailStateParams) {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [penaltyHistory, setPenaltyHistory] = useState<BlacklistHistoryItem[]>(
    []
  );
  const [penaltyHistoryPage, setPenaltyHistoryPage] = useState(0);
  const [hasNextPenaltyHistory, setHasNextPenaltyHistory] = useState(false);
  const [isPenaltyHistoryLoading, setIsPenaltyHistoryLoading] = useState(false);
  const [isPenaltyHistoryLoaded, setIsPenaltyHistoryLoaded] = useState(false);
  const [penaltyHistoryTotalCount, setPenaltyHistoryTotalCount] = useState(0);
  // 중복 호출 방지용 in-flight 가드(state는 비동기라 같은 틱 연타를 못 막는다).
  const isPenaltyHistoryFetchingRef = useRef(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // 상세 페이지는 encryptedUserId를 이미 알고 있으므로 단건 조회 API를 그대로 사용한다.
  const fetchMemberDetail = useCallback(
    (encryptedUserId: string) => getUserDetailAPI(encryptedUserId),
    []
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
      setPenaltyHistory([]);
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(false);
      setPenaltyHistoryTotalCount(0);
      setIsEdit(false);
      return;
    }

    setSelectedMember(null);

    let isMounted = true;
    setIsDetailLoading(true);

    void (async () => {
      try {
        const resultMember = await fetchMemberDetail(memberKey);

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
  }, [fetchMemberDetail, memberKey, navigate]);

  // 회원이 바뀌면 제재 이력 상태를 초기화한다.
  // 실제 조회는 히스토리 아이콘 클릭 시(handleLoadPenaltyHistory)에만 수행한다.
  useEffect(() => {
    setPenaltyHistory([]);
    setPenaltyHistoryPage(0);
    setHasNextPenaltyHistory(false);
    setPenaltyHistoryTotalCount(0);
    setIsPenaltyHistoryLoaded(false);
  }, [selectedMember?.encryptedUserId]);

  // 히스토리 아이콘을 눌렀을 때만 첫 페이지를 조회한다(회원당 1회).
  const handleLoadPenaltyHistory = useCallback(async () => {
    if (
      !selectedMember ||
      isPenaltyHistoryLoaded ||
      isPenaltyHistoryFetchingRef.current
    ) {
      return;
    }

    isPenaltyHistoryFetchingRef.current = true;
    try {
      setIsPenaltyHistoryLoading(true);
      const { history, response } = await fetchPenaltyHistoryPage(
        selectedMember.encryptedUserId,
        selectedMember.studentNumber,
        0
      );
      setPenaltyHistory(history);
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(response.hasNext);
      setPenaltyHistoryTotalCount(response.totalCount);
      setIsPenaltyHistoryLoaded(true);
    } catch (error) {
      toast.error(getErrorMessage(error, '제재 이력 조회에 실패했습니다.'));
    } finally {
      isPenaltyHistoryFetchingRef.current = false;
      setIsPenaltyHistoryLoading(false);
    }
  }, [fetchPenaltyHistoryPage, isPenaltyHistoryLoaded, selectedMember]);

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
      setPenaltyHistoryPage(0);
      setHasNextPenaltyHistory(response.hasNext);
      setPenaltyHistoryTotalCount(response.totalCount);
      setIsPenaltyHistoryLoaded(true);
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
      const refreshedMember = await fetchMemberDetail(
        selectedMember.encryptedUserId
      );

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
    handleLoadPenaltyHistory,
    handleRefreshMemberDetail,
    handleRefreshPenaltyHistory,
    handleSaveEdit,
    hasNextPenaltyHistory,
    isDetailLoading,
    isEdit,
    isPenaltyHistoryLoading,
    penaltyHistory,
    penaltyHistoryTotalCount,
    selectedMember,
    setIsEdit,
  };
}
