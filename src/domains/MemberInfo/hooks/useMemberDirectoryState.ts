import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { PATHS } from '@/shared/constants/paths';
import type { AdminUserListItem, MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  type FilterValue,
  getAdmissionYear,
  getAdmissionYearOptions,
  getMajorOptions,
  getRoleOptions,
  mapMemberInfoToAdminUserListItem,
  normalizeSearchResultMembers,
} from '@/domains/MemberInfo/utils/memberDirectory';

import { getAllUsersAPI, searchUsersAPI } from '@/apis';

export function useMemberDirectoryState(isDetailRoute: boolean) {
  const navigate = useNavigate();
  const [members, setMembers] = useState<AdminUserListItem[]>([]);
  const [searchResultMembers, setSearchResultMembers] = useState<
    AdminUserListItem[] | null
  >(null);
  const [searchResultDetails, setSearchResultDetails] = useState<
    Record<string, MemberInfo>
  >({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<FilterValue>('ALL');
  const [selectedAdmissionYear, setSelectedAdmissionYear] =
    useState<FilterValue>('ALL');
  const [selectedMajor, setSelectedMajor] = useState<FilterValue>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const loadMembers = useCallback(async (page: number) => {
    setIsListLoading(true);
    try {
      const response = await getAllUsersAPI(page);
      setMembers(response.data);
      setHasNextPage(response.hasNext);
      setSelectedIds([]);
    } catch (error) {
      toast.error(getErrorMessage(error, '회원 목록 조회에 실패했습니다.'));
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDetailRoute) {
      void loadMembers(currentPage);
    }
  }, [currentPage, isDetailRoute, loadMembers]);

  const displayMembers = searchResultMembers ?? members;
  const isSearchMode = searchResultMembers !== null;
  const roleOptions = useMemo(() => getRoleOptions(), []);
  const admissionYearOptions = useMemo(
    () => getAdmissionYearOptions(displayMembers),
    [displayMembers]
  );
  const majorOptions = useMemo(
    () => getMajorOptions(displayMembers),
    [displayMembers]
  );

  const filteredMembers = useMemo(
    () =>
      displayMembers.filter((member) => {
        const matchesRole =
          selectedRole === 'ALL' || String(member.userRoleId) === selectedRole;
        const matchesAdmissionYear =
          selectedAdmissionYear === 'ALL' ||
          getAdmissionYear(member.studentNumber) === selectedAdmissionYear;
        const matchesMajor =
          selectedMajor === 'ALL' || member.major === selectedMajor;
        return matchesRole && matchesAdmissionYear && matchesMajor;
      }),
    [displayMembers, selectedAdmissionYear, selectedMajor, selectedRole]
  );

  useEffect(() => {
    const visibleIds = new Set(
      filteredMembers.map((member) => member.encryptedUserId)
    );
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [filteredMembers]);

  const isAllVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) =>
      selectedIds.includes(member.encryptedUserId)
    );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.info('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsersAPI(searchQuery.trim());
      const resultMembers = normalizeSearchResultMembers(response?.result);
      if (resultMembers.length === 0) {
        toast.error('회원 검색 결과가 없습니다.');
        return;
      }

      setSearchResultMembers(
        resultMembers.map((member) => mapMemberInfoToAdminUserListItem(member))
      );
      setSearchResultDetails(
        Object.fromEntries(
          resultMembers.map((member) => [member.encryptedUserId, member])
        )
      );
      setSelectedIds([]);
    } catch (error) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleOpenMemberDetail = useCallback(
    (member: AdminUserListItem) => {
      navigate(
        `${PATHS.MEMBER_INFO}/${encodeURIComponent(member.encryptedUserId)}`,
        {
          state: {
            detailKeywords: [
              member.loginId,
              member.studentNumber,
              member.userName,
            ],
            prefetchedMember: searchResultDetails[member.encryptedUserId],
          },
        }
      );
    },
    [navigate, searchResultDetails]
  );

  const handleRefreshDirectory = useCallback(() => {
    setSearchQuery('');
    setSelectedRole('ALL');
    setSelectedAdmissionYear('ALL');
    setSelectedMajor('ALL');
    setSelectedIds([]);
    setSearchResultMembers(null);
    setSearchResultDetails({});

    if (currentPage === 0) {
      void loadMembers(0);
      return;
    }

    setCurrentPage(0);
  }, [currentPage, loadMembers]);

  const handleResetFilters = useCallback(() => {
    setSelectedRole('ALL');
    setSelectedAdmissionYear('ALL');
    setSelectedMajor('ALL');
    setSelectedIds([]);
  }, []);

  const handleToggleAllVisibleRows = useCallback(() => {
    setSelectedIds(
      isAllVisibleSelected
        ? []
        : filteredMembers.map((member) => member.encryptedUserId)
    );
  }, [filteredMembers, isAllVisibleSelected]);

  const handleToggleRow = useCallback((encryptedUserId: string) => {
    setSelectedIds((prev) =>
      prev.includes(encryptedUserId)
        ? prev.filter((id) => id !== encryptedUserId)
        : [...prev, encryptedUserId]
    );
  }, []);

  const updateCachedMember = useCallback((member: MemberInfo) => {
    setSearchResultDetails((prev) => ({
      ...prev,
      [member.encryptedUserId]: member,
    }));
    setSearchResultMembers((prev) =>
      prev
        ? prev.map((searchMember) =>
            searchMember.encryptedUserId === member.encryptedUserId
              ? mapMemberInfoToAdminUserListItem(member)
              : searchMember
          )
        : prev
    );
  }, []);

  return {
    admissionYearOptions,
    currentPage,
    filteredMembers,
    handleOpenMemberDetail,
    handleRefreshDirectory,
    handleResetFilters,
    handleSearch,
    handleToggleAllVisibleRows,
    handleToggleRow,
    hasNextPage,
    isAllVisibleSelected,
    isListLoading,
    isSearchMode,
    isSearching,
    loadMembers,
    majorOptions,
    members,
    roleOptions,
    searchQuery,
    searchResultDetails,
    searchResultMembers,
    selectedAdmissionYear,
    selectedIds,
    selectedMajor,
    selectedRole,
    setCurrentPage,
    setSearchQuery,
    setSelectedAdmissionYear,
    setSelectedIds,
    setSelectedMajor,
    setSelectedRole,
    updateCachedMember,
  };
}
