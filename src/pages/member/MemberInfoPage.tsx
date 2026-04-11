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
    filteredMembers,
    handleBack,
    handleCopy,
    handleOpenMemberDetail,
    handleRefreshDirectory,
    handleResetFilters,
    handleSaveEdit,
    handleSearch,
    handleToggleAllVisibleRows,
    handleToggleRow,
    hasNextPage,
    isAllVisibleSelected,
    isDetailLoading,
    isDetailRoute,
    isEdit,
    isListLoading,
    isSearchMode,
    isSearching,
    latestPenaltyHistory,
    majorOptions,
    roleOptions,
    searchQuery,
    selectedAdmissionYear,
    selectedIds,
    selectedMajor,
    selectedMember,
    selectedRole,
    setCurrentPage,
    setIsEdit,
    setSearchQuery,
    setSelectedAdmissionYear,
    setSelectedMajor,
    setSelectedRole,
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
            latestPenaltyHistory={latestPenaltyHistory}
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
          onResetFilters={handleResetFilters}
          onSearch={handleSearch}
          onSearchQueryChange={setSearchQuery}
          onSelectedAdmissionYearChange={setSelectedAdmissionYear}
          onSelectedMajorChange={setSelectedMajor}
          onSelectedRoleChange={setSelectedRole}
          onToggleAllVisibleRows={handleToggleAllVisibleRows}
          onToggleRow={handleToggleRow}
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
