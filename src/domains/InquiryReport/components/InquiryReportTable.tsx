import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Search, X } from 'lucide-react';

import {
  CopyableValue,
  MemberInfoPopover,
  PaginationBar,
  SectionTitle,
  StatusBadge,
  TableStateRow,
} from '@/shared/components';
import {
  Button,
  InputGroup,
  Label,
  Select,
  Table,
} from '@/shared/components/ui';
import type {
  InquiryGroup,
  InquiryStatus,
  InquirySubGroup,
} from '@/shared/types';
import { clampOneBasedPage, formatDateTimeToMinutes } from '@/shared/utils';

import { getInquiryStatusBadgeMeta } from '@/domains/InquiryReport/constants/inquiryReportLabels';
import { useInquiryList } from '@/domains/InquiryReport/hooks';
import { isWithdrawnInquiryAuthor } from '@/domains/InquiryReport/utils/inquiryAuthorUtils';

import {
  InquiryGroupBadge,
  InquirySubGroupBadge,
} from './InquiryClassificationBadge';
import InquiryStatusSelect from './InquiryStatusSelect';
import WithdrawnUserBadge from './WithdrawnUserBadge';

interface InquiryReportTableProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedPostId: number | null;
  onRowSelect: (postId: number | null) => void;
  onStatusChange: (
    inquiryId: number,
    status: InquiryStatus
  ) => void | Promise<void>;
}

const GROUP_OPTIONS = [
  { label: '유형 전체', value: 'ALL' },
  { label: '문의', value: 'INQUIRY' },
  { label: '신고', value: 'REPORT' },
  { label: '기타', value: 'ETC' },
] as const;

const INQUIRY_SUB_GROUP_OPTIONS = [
  { label: '카테고리 전체', value: 'ALL' },
  { label: '족보 관련 문의', value: 'EXAM_REVIEW_INQUIRY' },
  { label: '이벤트 관련 문의', value: 'EVENT_INQUIRY' },
  { label: '공지 관련 문의', value: 'NOTICE_INQUIRY' },
  { label: '기타', value: 'ETC_INQUIRY' },
] as const;

const REPORT_SUB_GROUP_OPTIONS = [
  { label: '카테고리 전체', value: 'ALL' },
  { label: '게시글 신고', value: 'POST_REPORT' },
  { label: '족보 신고', value: 'EXAM_REVIEW_REPORT' },
  { label: '이용자 신고', value: 'USER_REPORT' },
  { label: '댓글 신고', value: 'COMMENT_REPORT' },
] as const;

const STATUS_OPTIONS = [
  { label: '답변 전체', value: 'ALL' },
  { label: '답변 전', value: 'PENDING' },
  { label: '답변 완료', value: 'COMPLETED' },
  { label: '이용자 철회', value: 'WITHDRAWN' },
  // TODO: 백엔드 HOLD 상태 지원 후 주석 해제
  // { label: '보류', value: 'HOLD' },
] as const;

const PAGE_SIZE = 10;

type GroupFilter = InquiryGroup | 'ALL';
type StatusFilter = (typeof STATUS_OPTIONS)[number]['value'];
type SubGroupFilter = InquirySubGroup | 'ALL';

export default function InquiryReportTable({
  currentPage,
  onPageChange,
  selectedPostId,
  onRowSelect,
  onStatusChange,
}: InquiryReportTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.get('searchKey')?.trim() ?? '';
  const [searchInput, setSearchInput] = useState(searchKey);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('ALL');
  const [subGroupFilter, setSubGroupFilter] = useState<SubGroupFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const subGroupOptions = useMemo<
    ReadonlyArray<{ label: string; value: SubGroupFilter }>
  >(() => {
    if (groupFilter === 'INQUIRY') return INQUIRY_SUB_GROUP_OPTIONS;
    if (groupFilter === 'REPORT') return REPORT_SUB_GROUP_OPTIONS;

    return [
      { label: '카테고리 전체', value: 'ALL' },
      ...INQUIRY_SUB_GROUP_OPTIONS.filter((option) => option.value !== 'ALL'),
      ...REPORT_SUB_GROUP_OPTIONS.filter((option) => option.value !== 'ALL'),
    ];
  }, [groupFilter]);

  const { data, isLoading, isError, refetch } = useInquiryList({
    ...(searchKey ? { searchKey } : {}),
    ...(groupFilter !== 'ALL' ? { group: groupFilter } : {}),
    // 기존 ETC와 ETC_INQUIRY를 함께 표시해야 하므로 기타 문의는 클라이언트에서 합칩니다.
    ...(subGroupFilter !== 'ALL' && subGroupFilter !== 'ETC_INQUIRY'
      ? { subGroup: subGroupFilter }
      : {}),
  });

  useEffect(() => {
    setSearchInput(searchKey);
  }, [searchKey]);

  const applySearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    const keyword = value.trim();
    if (keyword) next.set('searchKey', keyword);
    else next.delete('searchKey');
    next.set('page', '1');
    next.delete('postId');
    next.delete('inquiryId');
    setSearchParams(next, { replace: true });
  };

  const filteredInquiries = useMemo(() => {
    return (data ?? []).filter((inquiry) => {
      return (
        (groupFilter === 'ALL' || inquiry.group === groupFilter) &&
        (subGroupFilter === 'ALL' ||
          inquiry.subGroup === subGroupFilter ||
          (subGroupFilter === 'ETC_INQUIRY' && inquiry.subGroup === 'ETC')) &&
        (statusFilter === 'ALL' || inquiry.status === statusFilter)
      );
    });
  }, [data, groupFilter, subGroupFilter, statusFilter]);

  const inquiries = useMemo(() => {
    const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInquiries.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);
  }, [currentPage, filteredInquiries]);

  const totalPage = Math.ceil(filteredInquiries.length / PAGE_SIZE);
  const isEmpty = !isLoading && !isError && inquiries.length === 0;

  useEffect(() => {
    if (isLoading || isError) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) onPageChange(validPage);
  }, [currentPage, isLoading, isError, onPageChange, totalPage]);

  const activeFilterCount = [
    groupFilter !== 'ALL',
    subGroupFilter !== 'ALL',
    statusFilter !== 'ALL',
    !!searchKey,
  ].filter(Boolean).length;

  return (
    <div className='flex flex-col gap-3'>
      <section
        aria-labelledby='inquiry-search-title'
        className='flex min-w-0 flex-col gap-1'
      >
        <SectionTitle id='inquiry-search-title'>문의 및 신고 검색</SectionTitle>
        <form
          aria-labelledby='inquiry-search-title'
          className='border-border bg-background @container flex min-w-0 flex-col gap-4 rounded-lg border p-4'
          onSubmit={(event) => {
            event.preventDefault();
            applySearch(searchInput);
          }}
        >
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='inquiry-search-key'>통합 검색</Label>
            <InputGroup className='shadow-none'>
              <InputGroup.Addon>
                <Search aria-hidden='true' />
              </InputGroup.Addon>
              <InputGroup.Input
                id='inquiry-search-key'
                value={searchInput}
                placeholder='학번, 아이디, 제목, 내용으로 검색'
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  if (
                    event.nativeEvent.isComposing ||
                    event.nativeEvent.keyCode === 229
                  )
                    return;
                  applySearch(searchInput);
                }}
              />
            </InputGroup>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative'>
              <Select
                value={groupFilter}
                onValueChange={(value) => {
                  setGroupFilter(value as GroupFilter);
                  setSubGroupFilter('ALL');
                  onPageChange(1);
                }}
              >
                <Select.Trigger
                  aria-label='유형'
                  className='bg-background h-9 w-[112px]'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  {GROUP_OPTIONS.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      textValue={option.label}
                    >
                      {option.value === 'ALL' ? (
                        option.label
                      ) : (
                        <InquiryGroupBadge group={option.value} />
                      )}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {groupFilter !== 'ALL' && (
                <button
                  type='button'
                  aria-label='유형 필터 초기화'
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupFilter('ALL');
                    setSubGroupFilter('ALL');
                    onPageChange(1);
                  }}
                  className='bg-background text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>

            <div className='relative'>
              <Select
                disabled={groupFilter === 'ALL' || groupFilter === 'ETC'}
                value={subGroupFilter}
                onValueChange={(value) => {
                  setSubGroupFilter(value as SubGroupFilter);
                  onPageChange(1);
                }}
              >
                <Select.Trigger
                  aria-label='카테고리'
                  className={`h-9 w-[160px] ${groupFilter === 'ALL' || groupFilter === 'ETC' ? 'bg-muted' : 'bg-background'}`}
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  {subGroupOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      textValue={option.label}
                    >
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {subGroupFilter !== 'ALL' && (
                <button
                  type='button'
                  aria-label='카테고리 필터 초기화'
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubGroupFilter('ALL');
                    onPageChange(1);
                  }}
                  className='bg-background text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>

            <div className='relative'>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  onPageChange(1);
                }}
              >
                <Select.Trigger
                  aria-label='답변여부'
                  className='bg-background h-9 w-[124px]'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  {STATUS_OPTIONS.map((option) => {
                    const badge = getInquiryStatusBadgeMeta(option.value);

                    return (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        textValue={option.label}
                      >
                        {option.value === 'ALL' ? (
                          option.label
                        ) : (
                          <StatusBadge tone={badge.tone}>
                            {badge.label}
                          </StatusBadge>
                        )}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select>
              {statusFilter !== 'ALL' && (
                <button
                  type='button'
                  aria-label='답변여부 필터 초기화'
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('ALL');
                    onPageChange(1);
                  }}
                  className='bg-background text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
          </div>
          <div className='flex gap-2 @md:ml-auto'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
              aria-label='검색 조건 초기화'
              onClick={() => {
                setSearchInput('');
                setGroupFilter('ALL');
                setSubGroupFilter('ALL');
                setStatusFilter('ALL');
                applySearch('');
              }}
            >
              초기화
            </Button>
            <Button
              type='submit'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
            >
              검색
            </Button>
          </div>
        </form>
      </section>
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='w-full overflow-x-auto'>
          <Table className='w-full table-fixed text-sm'>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '9%' }} />
            </colgroup>
            <Table.Header className='h-[42px] border-b border-gray-200'>
              <Table.Row>
                <Table.Head className='px-2 text-left'>postId</Table.Head>
                <Table.Head className='px-2 text-center'>유형</Table.Head>
                <Table.Head className='px-2'>카테고리</Table.Head>
                <Table.Head className='px-2'>작성자 아이디</Table.Head>
                <Table.Head className='px-2 text-center'>답변여부</Table.Head>
                <Table.Head className='px-2'>제목</Table.Head>
                <Table.Head className='px-2'>작성일</Table.Head>
                <Table.Head className='px-2'>담당자</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {isLoading ? (
                <TableStateRow
                  state='loading'
                  colSpan={8}
                  message='문의 및 신고 목록을 불러오는 중입니다.'
                />
              ) : isError ? (
                <TableStateRow
                  state='error'
                  colSpan={8}
                  message={
                    <span className='flex items-center gap-2'>
                      목록을 불러오지 못했습니다.
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => void refetch()}
                      >
                        다시 시도
                      </Button>
                    </span>
                  }
                />
              ) : isEmpty ? (
                <TableStateRow
                  state='empty'
                  colSpan={8}
                  message={
                    activeFilterCount > 0
                      ? '필터 조건에 해당하는 항목이 없습니다.'
                      : '등록된 문의 및 신고가 없습니다.'
                  }
                />
              ) : (
                inquiries.map((inquiry) => {
                  const inquiryStatus = inquiry.status;
                  const [createdDate, createdTime] = formatDateTimeToMinutes(
                    inquiry.createdAt
                  ).split(' ');

                  return (
                    <Table.Row
                      key={`${inquiry.postId}-${inquiry.createdAt}`}
                      onClick={() =>
                        onRowSelect(
                          inquiry.postId === selectedPostId
                            ? null
                            : inquiry.postId
                        )
                      }
                      className={`cursor-pointer border-b border-gray-100 last:border-0 [&_td]:h-[54px] ${
                        inquiry.postId === selectedPostId
                          ? 'bg-blue-50'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Table.Cell className='px-2 text-left text-sm text-gray-600'>
                        <CopyableValue
                          value={inquiry.postId}
                          label='게시글 ID'
                        />
                      </Table.Cell>
                      <Table.Cell className='px-2 text-center'>
                        <div className='flex justify-center'>
                          <InquiryGroupBadge group={inquiry.group} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className='px-2'>
                        <InquirySubGroupBadge subGroup={inquiry.subGroup} />
                      </Table.Cell>
                      <Table.Cell className='truncate px-2 text-gray-900'>
                        {isWithdrawnInquiryAuthor(inquiry) ? (
                          <WithdrawnUserBadge />
                        ) : inquiry.encryptedUserId?.trim() ? (
                          <MemberInfoPopover
                            key={inquiry.encryptedUserId}
                            encryptedUserId={inquiry.encryptedUserId}
                            displayName={inquiry.userLoginId || '-'}
                          />
                        ) : (
                          <span title={inquiry.userLoginId}>
                            {inquiry.userLoginId || '-'}
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell
                        className='px-2 text-center'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InquiryStatusSelect
                          ariaLabel={`${inquiry.title} 상태 변경`}
                          className='mx-auto w-full min-w-0 justify-center [&>div]:max-w-full [&>div]:min-w-0'
                          inquiryId={inquiry.postId}
                          status={inquiryStatus}
                          title={inquiry.title}
                          onStatusChange={onStatusChange}
                        />
                      </Table.Cell>
                      <Table.Cell
                        className='truncate px-2 font-semibold text-gray-900'
                        title={inquiry.title}
                      >
                        {inquiry.title}
                      </Table.Cell>
                      <Table.Cell className='px-2 text-sm text-gray-600'>
                        <time
                          dateTime={inquiry.createdAt}
                          title={formatDateTimeToMinutes(inquiry.createdAt)}
                        >
                          <span className='block'>{createdDate}</span>{' '}
                          <span className='block text-xs text-gray-500'>
                            {createdTime}
                          </span>
                        </time>
                      </Table.Cell>
                      <Table.Cell className='truncate px-2 text-gray-900'>
                        {inquiry.encryptedAdminId?.trim() ? (
                          <MemberInfoPopover
                            key={inquiry.encryptedAdminId}
                            encryptedUserId={inquiry.encryptedAdminId}
                            displayName={
                              inquiry.manager?.trim() ? inquiry.manager : '-'
                            }
                          />
                        ) : (
                          <span title={inquiry.manager ?? undefined}>
                            {inquiry.manager?.trim() ? inquiry.manager : '-'}
                          </span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      <PaginationBar
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPage={totalPage}
      />
    </div>
  );
}
