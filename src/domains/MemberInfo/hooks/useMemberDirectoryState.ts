import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MAJOR_OPTIONS, PATHS } from '@/shared/constants';
import { useStableTotalCount } from '@/shared/hooks';
import type {
  AdminUserListItem,
  AdminUserListResult,
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
  const queryClient = useQueryClient();
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
  const [currentPage, setCurrentPage] = useState(1);
  const conditions = {
    keyword: appliedKeyword,
    selectedRole,
    selectedMajor,
    selectedAdmissionYear,
    sortType,
    sortDirection,
  };
  const params = buildAdminUserListParams({
    page: currentPage - 1,
    ...conditions,
  });
  const queryKey = ['members', 'directory', params] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getAllUsersAPI(params),
    enabled: !isDetailRoute,
    retry: false,
  });
  const members = useMemo(() => query.data?.data ?? [], [query.data]);
  const totalPage = query.data?.totalPage ?? 0;
  const totalCount = useStableTotalCount(query.data?.totalCount, conditions);
  const isListLoading = query.isFetching;
  const isListError = query.isError && !query.isFetching;

  useEffect(() => {
    if (query.error && !query.isFetching)
      toast.error(
        getErrorMessage(query.error, '회원 목록 조회에 실패했습니다.')
      );
  }, [query.error, query.isFetching]);

  useEffect(() => {
    if (!query.data) return;
    setCurrentPage((current) =>
      Math.min(current, Math.max(query.data.totalPage, 1))
    );
    setSelectedIds([]);
  }, [query.data]);

  const { refetch } = query;
  const loadMembers = useCallback(
    async (page: number) => {
      if (page !== currentPage) setCurrentPage(page);
      else await refetch();
    },
    [currentPage, refetch]
  );

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
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSelectedRoleChange = useCallback((value: string) => {
    setSelectedRole(value);
    setCurrentPage(1);
  }, []);

  const handleSelectedAdmissionYearChange = useCallback((value: string) => {
    setSelectedAdmissionYear(value);
    setCurrentPage(1);
  }, []);

  const handleSelectedMajorChange = useCallback((value: string) => {
    setSelectedMajor(value);
    setCurrentPage(1);
  }, []);

  // 헤더 클릭 정렬: 같은 컬럼이면 방향 토글, 다른 컬럼이면 그 컬럼 내림차순.
  const handleHeaderSort = useCallback(
    (columnType: string) => {
      setIsSortActive(true);
      setCurrentPage(1);
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
    setCurrentPage(1);
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

  const updateCachedMember = useCallback(
    (member: MemberInfo) => {
      queryClient.setQueriesData<AdminUserListResult>(
        { queryKey: ['members', 'directory'] },
        (previous) =>
          previous && {
            ...previous,
            data: previous.data.map((item) =>
              item.encryptedUserId === member.encryptedUserId
                ? mapMemberInfoToAdminUserListItem(member)
                : item
            ),
          }
      );
      // 등급·검색 조건과 정렬 순서, 건수는 회원 값만 교체해서 맞출 수 없다.
      // 현재 목록은 이어지는 loadMembers에서 조회하고, 다른 목록도 재진입 시 갱신한다.
      void queryClient.invalidateQueries({
        queryKey: ['members', 'directory'],
        refetchType: 'none',
      });
    },
    [queryClient]
  );

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
    isListError,
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
