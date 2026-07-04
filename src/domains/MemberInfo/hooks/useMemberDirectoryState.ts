import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { MAJOR_OPTIONS } from '@/shared/constants/majors';
import { PATHS } from '@/shared/constants/paths';
import type {
  AdminUserListItem,
  AdminUserSortType,
  MemberInfo,
  SortDirection,
} from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  type FilterValue,
  buildAdminUserListParams,
  getAdmissionYearOptions,
  getRoleOptions,
  mapMemberInfoToAdminUserListItem,
} from '@/domains/MemberInfo/utils/memberDirectory';

import { getAllUsersAPI } from '@/apis';

const DEFAULT_SORT_TYPE: AdminUserSortType = 'CREATED_AT';
const DEFAULT_SORT_DIRECTION: SortDirection = 'DESC';

export function useMemberDirectoryState(isDetailRoute: boolean) {
  const navigate = useNavigate();
  const [members, setMembers] = useState<AdminUserListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState<FilterValue>('ALL');
  const [selectedAdmissionYear, setSelectedAdmissionYear] =
    useState<FilterValue>('ALL');
  const [selectedMajor, setSelectedMajor] = useState<FilterValue>('ALL');
  const [sortType, setSortType] =
    useState<AdminUserSortType>(DEFAULT_SORT_TYPE);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_SORT_DIRECTION
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPage, setTotalPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isListLoading, setIsListLoading] = useState(false);

  const loadMembers = useCallback(
    async (page: number) => {
      setIsListLoading(true);
      try {
        const params = buildAdminUserListParams({
          page,
          keyword: appliedKeyword,
          selectedRole,
          selectedMajor,
          selectedAdmissionYear,
          sortType,
          sortDirection,
        });

        const response = await getAllUsersAPI(params);
        setMembers(response.data);
        setHasNextPage(response.hasNext);
        setTotalPage(response.totalPage);
        setTotalCount(response.totalCount);
        setSelectedIds([]);
      } catch (error) {
        toast.error(getErrorMessage(error, '회원 목록 조회에 실패했습니다.'));
      } finally {
        setIsListLoading(false);
      }
    },
    [
      appliedKeyword,
      selectedRole,
      selectedMajor,
      selectedAdmissionYear,
      sortType,
      sortDirection,
    ]
  );

  // 필터/검색/정렬/페이지 상태가 바뀔 때마다 서버에서 다시 조회한다.
  useEffect(() => {
    if (!isDetailRoute) {
      void loadMembers(currentPage);
    }
  }, [currentPage, isDetailRoute, loadMembers]);

  const roleOptions = useMemo(() => getRoleOptions(), []);
  const admissionYearOptions = useMemo(() => getAdmissionYearOptions(), []);
  const majorOptions = MAJOR_OPTIONS;

  // 서버가 필터링한 결과이므로 목록을 그대로 표시한다.
  useEffect(() => {
    const visibleIds = new Set(members.map((member) => member.encryptedUserId));
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [members]);

  const isAllVisibleSelected =
    members.length > 0 &&
    members.every((member) => selectedIds.includes(member.encryptedUserId));

  const handleSearch = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      toast.info('검색어를 입력해주세요.');
      return;
    }

    setAppliedKeyword(trimmed);
    setCurrentPage(0);
  }, [searchQuery]);

  const handleSelectedRoleChange = useCallback((value: string) => {
    setSelectedRole(value);
    setCurrentPage(0);
  }, []);

  const handleSelectedAdmissionYearChange = useCallback((value: string) => {
    setSelectedAdmissionYear(value);
    setCurrentPage(0);
  }, []);

  const handleSelectedMajorChange = useCallback((value: string) => {
    setSelectedMajor(value);
    setCurrentPage(0);
  }, []);

  const handleSortTypeChange = useCallback((value: string) => {
    setSortType(value as AdminUserSortType);
    setCurrentPage(0);
  }, []);

  const handleSortDirectionChange = useCallback((value: string) => {
    setSortDirection(value as SortDirection);
    setCurrentPage(0);
  }, []);

  const handleOpenMemberDetail = useCallback(
    (member: AdminUserListItem) => {
      navigate(
        `${PATHS.MEMBER_INFO}/${encodeURIComponent(member.encryptedUserId)}`
      );
    },
    [navigate]
  );

  const handleRefreshDirectory = useCallback(() => {
    setSearchQuery('');
    setAppliedKeyword('');
    setSelectedRole('ALL');
    setSelectedAdmissionYear('ALL');
    setSelectedMajor('ALL');
    setSortType(DEFAULT_SORT_TYPE);
    setSortDirection(DEFAULT_SORT_DIRECTION);
    setSelectedIds([]);
    setCurrentPage(0);
  }, []);

  const handleToggleAllVisibleRows = useCallback(() => {
    setSelectedIds(
      isAllVisibleSelected
        ? []
        : members.map((member) => member.encryptedUserId)
    );
  }, [members, isAllVisibleSelected]);

  const handleToggleRow = useCallback((encryptedUserId: string) => {
    setSelectedIds((prev) =>
      prev.includes(encryptedUserId)
        ? prev.filter((id) => id !== encryptedUserId)
        : [...prev, encryptedUserId]
    );
  }, []);

  const updateCachedMember = useCallback((member: MemberInfo) => {
    setMembers((prev) =>
      prev.map((listMember) =>
        listMember.encryptedUserId === member.encryptedUserId
          ? mapMemberInfoToAdminUserListItem(member)
          : listMember
      )
    );
  }, []);

  return {
    admissionYearOptions,
    currentPage,
    handleOpenMemberDetail,
    handleRefreshDirectory,
    handleSearch,
    handleSelectedAdmissionYearChange,
    handleSelectedMajorChange,
    handleSelectedRoleChange,
    handleSortDirectionChange,
    handleSortTypeChange,
    handleToggleAllVisibleRows,
    handleToggleRow,
    hasNextPage,
    isAllVisibleSelected,
    isListLoading,
    loadMembers,
    majorOptions,
    members,
    roleOptions,
    searchQuery,
    selectedAdmissionYear,
    selectedIds,
    selectedMajor,
    selectedRole,
    setCurrentPage,
    setSearchQuery,
    sortDirection,
    sortType,
    totalCount,
    totalPage,
    updateCachedMember,
  };
}
