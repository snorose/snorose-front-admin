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
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchMemberDetail = useCallback(async (keywords: string[]) => {
    let latestError: unknown = null;

    for (const keyword of keywords) {
      if (!keyword.trim()) continue;
      try {
        const response = await searchUsersAPI(keyword);
        const resolvedMember = extractFirstSearchMember(response?.result);
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

  useEffect(() => {
    if (!memberKey) {
      setSelectedMember(null);
      setLatestPenaltyHistory(null);
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
    if (!selectedMember?.encryptedUserId) {
      setLatestPenaltyHistory(null);
      return;
    }

    let isMounted = true;
    void (async () => {
      try {
        const response = await blacklistHistoryAPI(
          selectedMember.encryptedUserId
        );
        const history = Array.isArray(response?.result) ? response.result : [];
        if (!isMounted) return;
        setLatestPenaltyHistory(resolveLatestPenaltyHistory(history));
      } catch {
        if (!isMounted) return;
        setLatestPenaltyHistory(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedMember?.encryptedUserId]);

  const handleSaveEdit = useCallback(
    async (updated: MemberInfo) => {
      if (!selectedMember) return;

      try {
        const diffPayload = createMemberDiffPayload(selectedMember, updated);
        if (Object.keys(diffPayload).length === 0) {
          toast.info('변경 사항이 없습니다.');
          return;
        }

        const editResponse = await editUsersAPI(
          selectedMember.encryptedUserId,
          diffPayload
        );
        if (!editResponse?.isSuccess || editResponse.code !== 1000) {
          throw new Error(
            editResponse?.message || '회원 정보 수정에 실패했습니다.'
          );
        }

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
    handleSaveEdit,
    isDetailLoading,
    isEdit,
    latestPenaltyHistory,
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
