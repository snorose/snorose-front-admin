import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { PATHS } from '@/shared/constants/paths';
import type { AdminUserListItem, MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  MemberDetailSection,
  MemberDirectorySection,
} from '@/domains/MemberInfo';
import {
  type FilterValue,
  createMemberDiffPayload,
  extractFirstSearchMember,
  getAdmissionYear,
  getAdmissionYearOptions,
  getMajorOptions,
  getRoleOptions,
  mapMemberInfoToAdminUserListItem,
  normalizeSearchResultMembers,
} from '@/domains/MemberInfo/utils/memberDirectory';

import { editUsersAPI, getAllUsersAPI, searchUsersAPI } from '@/apis';

export default function MemberInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { memberKey: rawMemberKey } = useParams<{ memberKey?: string }>();
  const memberKey = rawMemberKey ? decodeURIComponent(rawMemberKey) : null;
  const isDetailRoute = Boolean(memberKey);
  const [members, setMembers] = useState<AdminUserListItem[]>([]);
  const [searchResultMembers, setSearchResultMembers] = useState<
    AdminUserListItem[] | null
  >(null);
  const [searchResultDetails, setSearchResultDetails] = useState<
    Record<string, MemberInfo>
  >({});
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
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
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

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

  const filteredMembers = useMemo(() => {
    return displayMembers.filter((member) => {
      const matchesRole =
        selectedRole === 'ALL' || String(member.userRoleId) === selectedRole;
      const matchesAdmissionYear =
        selectedAdmissionYear === 'ALL' ||
        getAdmissionYear(member.studentNumber) === selectedAdmissionYear;
      const matchesMajor =
        selectedMajor === 'ALL' || member.major === selectedMajor;

      return matchesRole && matchesAdmissionYear && matchesMajor;
    });
  }, [displayMembers, selectedAdmissionYear, selectedMajor, selectedRole]);

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

  const fetchMemberDetail = useCallback(async (keywords: string[]) => {
    let latestError: unknown = null;

    for (const keyword of keywords) {
      if (!keyword.trim()) continue;

      try {
        const response = await searchUsersAPI(keyword);
        const resolvedMember = extractFirstSearchMember(response?.result);

        if (resolvedMember) {
          return resolvedMember;
        }
      } catch (error) {
        latestError = error;
      }
    }

    if (latestError) {
      throw latestError;
    }

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

      if (cachedMember) {
        return cachedMember;
      }

      let page = 0;
      let hasNext = true;

      while (hasNext) {
        const response = await getAllUsersAPI(page);
        const matchedMember =
          response.data.find(
            (member) => member.encryptedUserId === encryptedUserId
          ) ?? null;

        if (matchedMember) {
          return matchedMember;
        }

        hasNext = response.hasNext;
        page += 1;
      }

      return null;
    },
    [members, searchResultMembers]
  );

  useEffect(() => {
    if (!memberKey) {
      setSelectedMember(null);
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
        if (isMounted) {
          setIsDetailLoading(false);
        }
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
      setIsEdit(false);
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

  const handleSaveEdit = async (updated: MemberInfo) => {
    if (!selectedMember) return;

    try {
      const diffPayload = createMemberDiffPayload(selectedMember, updated);

      if (Object.keys(diffPayload).length === 0) {
        toast.info('변경 사항이 없습니다.');
        return;
      }

      await editUsersAPI(selectedMember.encryptedUserId, diffPayload);
      const refreshedMember = (await fetchMemberDetail([
        updated.studentNumber,
        updated.loginId,
        updated.userName,
      ])) ?? { ...selectedMember, ...updated };

      setSelectedMember(refreshedMember);
      setIsEdit(false);
      toast.success('회원 정보가 수정되었습니다.');
      await loadMembers(currentPage);
      setSearchResultMembers(null);
      setSearchResultDetails({});
    } catch (error) {
      toast.error(getErrorMessage(error, '회원 정보 수정에 실패했습니다.'));
    }
  };

  const handleRefreshDirectory = () => {
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
  };

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success('복사되었습니다.');
  };

  const handleBack = () => {
    setIsEdit(false);

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(PATHS.MEMBER_INFO, { replace: true });
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='회원 관리'
        description='회원 정보를 조회 및 관리할 수 있어요.'
      />

      {isDetailRoute ? (
        selectedMember ? (
          <MemberDetailSection
            member={selectedMember}
            isEdit={isEdit}
            isDetailLoading={isDetailLoading}
            onBack={handleBack}
            onCopy={handleCopy}
            onEditCancel={() => setIsEdit(false)}
            onEditStart={() => setIsEdit(true)}
            onSaveEdit={handleSaveEdit}
          />
        ) : (
          <div className='rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm'>
            회원 정보를 불러오는 중입니다.
          </div>
        )
      ) : (
        <MemberDirectorySection
          currentPage={currentPage}
          filteredMembers={filteredMembers}
          hasNextPage={hasNextPage}
          isAllVisibleSelected={isAllVisibleSelected}
          isListLoading={isListLoading}
          isSearchMode={isSearchMode}
          isSearching={isSearching}
          majorOptions={majorOptions}
          onOpenMemberDetail={handleOpenMemberDetail}
          onPageChange={setCurrentPage}
          onRefreshDirectory={handleRefreshDirectory}
          onResetFilters={() => {
            setSelectedRole('ALL');
            setSelectedAdmissionYear('ALL');
            setSelectedMajor('ALL');
            setSelectedIds([]);
          }}
          onSearch={handleSearch}
          onSearchQueryChange={setSearchQuery}
          onSelectedAdmissionYearChange={setSelectedAdmissionYear}
          onSelectedMajorChange={setSelectedMajor}
          onSelectedRoleChange={setSelectedRole}
          onToggleAllVisibleRows={() => {
            setSelectedIds(
              isAllVisibleSelected
                ? []
                : filteredMembers.map((member) => member.encryptedUserId)
            );
          }}
          onToggleRow={(encryptedUserId) => {
            setSelectedIds((prev) =>
              prev.includes(encryptedUserId)
                ? prev.filter((id) => id !== encryptedUserId)
                : [...prev, encryptedUserId]
            );
          }}
          roleOptions={roleOptions}
          searchQuery={searchQuery}
          selectedAdmissionYear={selectedAdmissionYear}
          selectedIds={selectedIds}
          selectedMajor={selectedMajor}
          selectedRole={selectedRole}
          admissionYearOptions={admissionYearOptions}
        />
      )}
    </div>
  );
}
