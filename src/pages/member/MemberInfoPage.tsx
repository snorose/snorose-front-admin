import { PageHeader } from '@/shared/components';

import {
  MemberDetailSection,
  MemberDirectorySection,
} from '@/domains/MemberInfo';
import { useMemberInfoPageState } from '@/domains/MemberInfo/hooks/useMemberInfoPageState';

export default function MemberInfoPage() {
  const {
    admissionYearOptions,
    currentPage,
    members,
    handleBack,
    handleCopy,
    handleLoadMorePenaltyHistory,
    handleLoadPenaltyHistory,
    handleOpenMemberDetail,
    handleRefreshDirectory,
    handleRefreshMemberDetail,
    handleRefreshPenaltyHistory,
    handleSaveEdit,
    handleSearch,
    handleSelectedAdmissionYearChange,
    handleSelectedMajorChange,
    handleSelectedRoleChange,
    handleHeaderSort,
    handleToggleAllVisibleRows,
    handleToggleRow,
    hasNextPenaltyHistory,
    isAllVisibleSelected,
    isDetailLoading,
    isDetailRoute,
    isEdit,
    isListLoading,
    isSortActive,
    isPenaltyHistoryLoading,
    penaltyHistory,
    majorOptions,
    roleOptions,
    searchQuery,
    selectedAdmissionYear,
    selectedIds,
    selectedMajor,
    selectedMember,
    selectedRole,
    sortDirection,
    sortType,
    totalCount,
    totalPage,
    penaltyHistoryTotalCount,
    setCurrentPage,
    setIsEdit,
    setSearchQuery,
  } = useMemberInfoPageState();

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
            hasNextPenaltyHistory={hasNextPenaltyHistory}
            onBack={handleBack}
            onCopy={handleCopy}
            onEditCancel={() => setIsEdit(false)}
            onEditStart={() => setIsEdit(true)}
            onChangedPenaltyHistory={async () => {
              await Promise.all([
                handleRefreshMemberDetail(),
                handleRefreshPenaltyHistory(),
              ]);
            }}
            onLoadMorePenaltyHistory={handleLoadMorePenaltyHistory}
            onOpenPenaltyHistory={handleLoadPenaltyHistory}
            onPointAdjusted={handleRefreshMemberDetail}
            onSaveEdit={handleSaveEdit}
            penaltyHistory={penaltyHistory}
            isPenaltyHistoryLoading={isPenaltyHistoryLoading}
            penaltyHistoryTotalCount={penaltyHistoryTotalCount}
          />
        ) : (
          <div className='rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm'>
            회원 정보를 불러오는 중입니다.
          </div>
        )
      ) : (
        <MemberDirectorySection
          currentPage={currentPage}
          members={members}
          isAllVisibleSelected={isAllVisibleSelected}
          isListLoading={isListLoading}
          majorOptions={majorOptions}
          onOpenMemberDetail={handleOpenMemberDetail}
          onPageChange={setCurrentPage}
          onRefreshDirectory={handleRefreshDirectory}
          onSearch={handleSearch}
          onSearchQueryChange={setSearchQuery}
          onSelectedAdmissionYearChange={handleSelectedAdmissionYearChange}
          onSelectedMajorChange={handleSelectedMajorChange}
          onSelectedRoleChange={handleSelectedRoleChange}
          onHeaderSort={handleHeaderSort}
          onToggleAllVisibleRows={handleToggleAllVisibleRows}
          onToggleRow={handleToggleRow}
          roleOptions={roleOptions}
          searchQuery={searchQuery}
          selectedAdmissionYear={selectedAdmissionYear}
          selectedIds={selectedIds}
          selectedMajor={selectedMajor}
          selectedRole={selectedRole}
          sortType={sortType}
          sortDirection={sortDirection}
          isSortActive={isSortActive}
          totalCount={totalCount}
          totalPage={totalPage}
          admissionYearOptions={admissionYearOptions}
        />
      )}
    </div>
  );
}
