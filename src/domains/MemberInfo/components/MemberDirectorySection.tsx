import { Loader2, RotateCcw, Search, Users } from 'lucide-react';

import { Button, Input, Table } from '@/shared/components/ui';
import type { AdminUserListItem } from '@/shared/types';

import MemberDirectoryActionBar from '@/domains/MemberInfo/components/MemberDirectoryActionBar';
import MemberDirectoryPagination from '@/domains/MemberInfo/components/MemberDirectoryPagination';
import SearchableSelect from '@/domains/MemberInfo/components/SearchableSelect';
import SortableHead from '@/domains/MemberInfo/components/SortableHead';
import type { DirectoryFilterOption } from '@/domains/MemberInfo/utils/memberDirectory';
import {
  formatDate,
  formatPoint,
  getRoleBadgeClassName,
} from '@/domains/MemberInfo/utils/memberDirectory';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';

interface MemberDirectorySectionProps {
  currentPage: number;
  members: AdminUserListItem[];
  isAllVisibleSelected: boolean;
  isListLoading: boolean;
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
  totalCount: number;
  totalPage: number;
  admissionYearOptions: DirectoryFilterOption[];
}

export default function MemberDirectorySection({
  currentPage,
  members,
  isAllVisibleSelected,
  isListLoading,
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
  return (
    <article className='flex w-full flex-col gap-4'>
      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
          <Users className='h-5 w-5' />
          회원 관리
        </div>

        <div className='mt-6 space-y-5'>
          <div className='flex flex-col gap-2 md:flex-row'>
            <div className='relative flex-1'>
              <Search className='pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                type='text'
                value={searchQuery}
                placeholder='이름, 학번, 아이디, 닉네임, 이메일로 검색...'
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void onSearch();
                  }
                }}
                className='h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 shadow-none'
              />
            </div>

            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-2xl border-slate-200 px-6'
              onClick={() => void onSearch()}
              disabled={isListLoading}
            >
              {isListLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Search className='h-4 w-4' />
              )}
              회원 검색
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]'>
            <SearchableSelect
              label='등급'
              value={selectedRole}
              placeholder='전체'
              options={roleOptions}
              onValueChange={onSelectedRoleChange}
              isActive={selectedRole !== 'ALL'}
            />
            <SearchableSelect
              label='입학연도'
              value={selectedAdmissionYear}
              placeholder='전체'
              options={admissionYearOptions}
              onValueChange={onSelectedAdmissionYearChange}
              isActive={selectedAdmissionYear !== 'ALL'}
            />
            <SearchableSelect
              label='전공'
              value={selectedMajor}
              placeholder='전체'
              options={majorOptions}
              onValueChange={onSelectedMajorChange}
              isActive={selectedMajor !== 'ALL'}
            />
            <div className='flex items-end'>
              <Button
                type='button'
                variant='outline'
                className='h-11 w-full rounded-2xl border-slate-200 px-6 whitespace-nowrap text-slate-600'
                onClick={onRefreshDirectory}
                disabled={isListLoading}
              >
                <RotateCcw className='h-4 w-4' />
                초기화
              </Button>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3'>
            <MemberDirectoryActionBar hasSelection={selectedIds.length > 0} />

            <span className='text-sm text-slate-500'>
              총 {totalCount.toLocaleString()}명
            </span>
          </div>

          <div className='overflow-hidden rounded-2xl border border-slate-200'>
            <Table className='min-w-[920px]'>
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
                  <Table.Row className='hover:bg-transparent'>
                    <Table.Cell
                      colSpan={11}
                      className='px-4 py-16 text-center text-sm text-slate-500'
                    >
                      {isListLoading
                        ? '회원 목록을 불러오는 중입니다.'
                        : '조건에 맞는 회원이 없습니다.'}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  members.map((member) => {
                    const isSelected = selectedIds.includes(
                      member.encryptedUserId
                    );

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
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClassName(
                              member.userRoleId
                            )}`}
                          >
                            {convertUserRoleIdToEnum(member.userRoleId)}
                          </span>
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {member.major}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatPoint(member.pointBalance)}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatDate(member.createdAt)}
                        </Table.Cell>
                        <Table.Cell className='px-4 text-slate-700'>
                          {formatDate(member.authenticatedAt)}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </div>

          <MemberDirectoryPagination
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={onPageChange}
          />
        </div>
      </section>
    </article>
  );
}
