import { useId } from 'react';

import { Loader2, Search } from 'lucide-react';

import {
  ListResultHeader,
  PaginationBar,
  StatusBadge,
  TableStateRow,
} from '@/shared/components';
import { Button, InputGroup, Label, Table } from '@/shared/components/ui';
import type { AdminUserListItem } from '@/shared/types';
import { formatDateOnly } from '@/shared/utils';

import MemberDirectoryActionBar from '@/domains/MemberInfo/components/MemberDirectoryActionBar';
import SearchableSelect from '@/domains/MemberInfo/components/SearchableSelect';
import SortableHead from '@/domains/MemberInfo/components/SortableHead';
import type { DirectoryFilterOption } from '@/domains/MemberInfo/utils/memberDirectory';
import {
  formatPoint,
  getRoleBadgeMeta,
} from '@/domains/MemberInfo/utils/memberDirectory';

interface MemberDirectorySectionProps {
  currentPage: number;
  members: AdminUserListItem[];
  isAllVisibleSelected: boolean;
  isListLoading: boolean;
  isListError: boolean;
  isSortActive: boolean;
  majorOptions: DirectoryFilterOption[];
  onOpenMemberDetail: (member: AdminUserListItem) => void | Promise<void>;
  onPageChange: (page: number) => void;
  onRefreshDirectory: () => void;
  onSearch: () => void | Promise<void>;
  onSearchQueryChange: (value: string) => void;
  onSelectedAdmissionYearChange: (value: string) => void;
  onSelectedMajorChange: (value: string) => void;
  onSelectedRoleChange: (value: string) => void;
  onHeaderSort: (columnType: string) => void;
  onToggleAllVisibleRows: () => void;
  onToggleRow: (encryptedUserId: string) => void;
  roleOptions: DirectoryFilterOption[];
  searchQuery: string;
  selectedAdmissionYear: string;
  selectedIds: string[];
  selectedMajor: string;
  selectedRole: string;
  sortType: string;
  sortDirection: string;
  totalCount: number | undefined;
  totalPage: number;
  admissionYearOptions: DirectoryFilterOption[];
}

export default function MemberDirectorySection({
  currentPage,
  members,
  isAllVisibleSelected,
  isListLoading,
  isListError,
  isSortActive,
  majorOptions,
  onOpenMemberDetail,
  onPageChange,
  onRefreshDirectory,
  onSearch,
  onSearchQueryChange,
  onSelectedAdmissionYearChange,
  onSelectedMajorChange,
  onSelectedRoleChange,
  onHeaderSort,
  onToggleAllVisibleRows,
  onToggleRow,
  roleOptions,
  searchQuery,
  selectedAdmissionYear,
  selectedIds,
  selectedMajor,
  selectedRole,
  sortType,
  sortDirection,
  totalCount,
  totalPage,
  admissionYearOptions,
}: MemberDirectorySectionProps) {
  const searchInputId = useId();
  return (
    <article className='flex w-full min-w-0 flex-col gap-6'>
      <section
        aria-labelledby={`${searchInputId}-search-heading`}
        className='flex w-full min-w-0 flex-col gap-1'
      >
        <h2
          id={`${searchInputId}-search-heading`}
          className='text-lg font-bold'
        >
          회원 검색
        </h2>

        <form
          aria-labelledby={`${searchInputId}-search-heading`}
          className='border-border bg-background @container flex min-w-0 flex-col gap-4 rounded-md border p-4'
          onSubmit={(event) => {
            event.preventDefault();
            if (!isListLoading) {
              void onSearch();
            }
          }}
        >
          <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-2 @5xl:grid-cols-4'>
            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor={searchInputId}>회원 검색어</Label>
              <InputGroup className='shadow-none'>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  id={searchInputId}
                  type='text'
                  value={searchQuery}
                  placeholder='이름, 학번, 아이디, 닉네임, 이메일'
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (!event.nativeEvent.isComposing && !isListLoading) {
                        void onSearch();
                      }
                    }
                  }}
                />
              </InputGroup>
            </div>

            <div className='min-w-0'>
              <SearchableSelect
                label='등급'
                value={selectedRole}
                placeholder='전체'
                options={roleOptions}
                onValueChange={onSelectedRoleChange}
                isActive={selectedRole !== 'ALL'}
              />
            </div>
            <div className='min-w-0'>
              <SearchableSelect
                label='입학연도'
                value={selectedAdmissionYear}
                placeholder='전체'
                options={admissionYearOptions}
                onValueChange={onSelectedAdmissionYearChange}
                isActive={selectedAdmissionYear !== 'ALL'}
              />
            </div>
            <div className='min-w-0'>
              <SearchableSelect
                label='전공'
                value={selectedMajor}
                placeholder='전체'
                options={majorOptions}
                onValueChange={onSelectedMajorChange}
                isActive={selectedMajor !== 'ALL'}
              />
            </div>
          </div>
          <div className='flex flex-col gap-3 pt-4 @md:flex-row @md:items-center'>
            <div className='flex gap-2 @md:ml-auto'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
                aria-label='검색 조건 초기화'
                onClick={onRefreshDirectory}
                disabled={isListLoading}
              >
                초기화
              </Button>
              <Button
                type='submit'
                size='sm'
                className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
                aria-label={isListLoading ? '검색 중...' : undefined}
                disabled={isListLoading}
              >
                {isListLoading ? (
                  <Loader2 aria-hidden='true' className='animate-spin' />
                ) : (
                  '검색'
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section
        aria-labelledby={`${searchInputId}-results-heading`}
        className='flex min-w-0 flex-col gap-1'
      >
        <div className='flex min-w-0 flex-col gap-3'>
          <ListResultHeader
            title='회원 목록'
            titleId={`${searchInputId}-results-heading`}
            totalCount={totalCount}
            status={isListLoading ? 'loading' : isListError ? 'error' : 'ready'}
          />
          <MemberDirectoryActionBar />

          <div className='overflow-hidden rounded-md border border-slate-200'>
            <Table className='min-w-230'>
              <Table.Header>
                <Table.Row className='border-b border-slate-200 bg-slate-50 hover:bg-slate-50'>
                  <Table.Head className='w-12 px-4'>
                    <input
                      type='checkbox'
                      aria-label='전체 선택'
                      checked={isAllVisibleSelected}
                      onChange={onToggleAllVisibleRows}
                      className='h-4 w-4 rounded border-slate-300'
                    />
                  </Table.Head>
                  <Table.Head className='px-4'>아이디</Table.Head>
                  <Table.Head className='px-4'>닉네임</Table.Head>
                  <Table.Head className='px-4'>이름</Table.Head>
                  <Table.Head className='px-4'>학번</Table.Head>
                  <Table.Head className='px-4'>이메일</Table.Head>
                  <Table.Head className='px-4'>등급</Table.Head>
                  <Table.Head className='px-4'>전공</Table.Head>
                  <SortableHead
                    label='보유 포인트'
                    columnType='POINT_BALANCE'
                    sortType={sortType}
                    sortDirection={sortDirection}
                    isSortActive={isSortActive}
                    onSort={onHeaderSort}
                  />
                  <SortableHead
                    label='가입일'
                    columnType='CREATED_AT'
                    sortType={sortType}
                    sortDirection={sortDirection}
                    isSortActive={isSortActive}
                    onSort={onHeaderSort}
                  />
                  <SortableHead
                    label='등업일'
                    columnType='AUTHENTICATED_AT'
                    sortType={sortType}
                    sortDirection={sortDirection}
                    isSortActive={isSortActive}
                    onSort={onHeaderSort}
                  />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {members.length === 0 ? (
                  <TableStateRow
                    state={isListLoading ? 'loading' : 'empty'}
                    colSpan={11}
                    message={
                      isListLoading
                        ? '회원 목록을 불러오는 중입니다.'
                        : '조건에 맞는 회원이 없습니다.'
                    }
                  />
                ) : (
                  members.map((member) => {
                    const isSelected = selectedIds.includes(
                      member.encryptedUserId
                    );
                    const roleBadge = getRoleBadgeMeta(member.userRoleId);

                    return (
                      <Table.Row
                        key={member.encryptedUserId}
                        onClick={() => void onOpenMemberDetail(member)}
                        className={`cursor-pointer border-b border-slate-100 bg-white hover:bg-slate-50 ${
                          isSelected ? 'bg-slate-50' : ''
                        }`}
                      >
                        <Table.Cell
                          className='px-4'
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => onToggleRow(member.encryptedUserId)}
                            aria-label={`${member.userName} 선택`}
                            className='h-4 w-4 rounded border-slate-300'
                          />
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.loginId}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.nickname}
                        </Table.Cell>
                        <Table.Cell className='px-4 font-semibold text-slate-900'>
                          {member.userName}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.studentNumber}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.email}
                        </Table.Cell>
                        <Table.Cell className='px-4'>
                          <StatusBadge tone={roleBadge.tone}>
                            {roleBadge.label}
                          </StatusBadge>
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.major}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatPoint(member.pointBalance)}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatDateOnly(member.createdAt)}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatDateOnly(member.authenticatedAt)}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={onPageChange}
          />
        </div>
      </section>
    </article>
  );
}
