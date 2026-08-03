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
  // 사용자가 헤더 정렬을 직접 선택했는지 여부(초기/초기화 상태에서는 헤더를 중립으로 표시).
  const [isSortActive, setIsSortActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
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
    // 빈 검색어로 검색하면 다른 필터는 유지한 채 검색 조건만 해제한다.
    setAppliedKeyword(searchQuery.trim());
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

  // 헤더 클릭 정렬: 같은 컬럼이면 방향 토글, 다른 컬럼이면 그 컬럼 내림차순.
  const handleHeaderSort = useCallback(
    (columnType: string) => {
      setIsSortActive(true);
      setCurrentPage(0);
      if (sortType === columnType) {
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortType(columnType as AdminUserSortType);
        setSortDirection('DESC');
      }
    },
    [sortType]
  );

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
    setIsSortActive(false);
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
    handleHeaderSort,
    handleToggleAllVisibleRows,
    handleToggleRow,
    isAllVisibleSelected,
    isListLoading,
    isSortActive,
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
