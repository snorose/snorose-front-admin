import { useMemo, useState } from 'react';

import { Loader2, X } from 'lucide-react';

import { Badge, Select, Table } from '@/shared/components/ui';
import type {
  InquiryGroup,
  InquiryListItem,
  InquiryStatus,
  InquirySubGroup,
} from '@/shared/types';

import { ExamReviewTablePagination } from '@/domains/Reviews/components';

import { INQUIRY_REPORT_SAMPLE_DATA } from '@/__mocks__';

interface InquiryReportTableProps {
  currentPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

const GROUP_LABELS: Record<InquiryGroup, string> = {
  INQUIRY: '문의',
  REPORT: '신고',
  ETC: '기타',
};

const SUB_GROUP_LABELS: Record<InquirySubGroup, string> = {
  EXAM_REVIEW_INQUIRY: '족보 관련 문의',
  EVENT_INQUIRY: '이벤트 관련 문의',
  NOTICE_INQUIRY: '공지 관련 문의',
  ETC_INQUIRY: '기타',
  POST_REPORT: '게시글 신고',
  EXAM_REVIEW_REPORT: '족보 신고',
  COMMENT_REPORT: '댓글 신고',
  USER_REPORT: '이용자 신고',
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '답변 전',
  COMPLETED: '답변 완료',
  HOLD: '보류',
};

const STATUS_BADGE_CLASS_NAMES: Record<InquiryStatus, string> = {
  PENDING:
    'rounded-full border-none bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50',
  COMPLETED:
    'rounded-full border-none bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50',
  HOLD: 'rounded-full border-none bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-50',
};

const GROUP_OPTIONS = [
  { label: '분류', value: 'ALL' },
  { label: '문의', value: 'INQUIRY' },
  { label: '신고', value: 'REPORT' },
] as const;

const INQUIRY_SUB_GROUP_OPTIONS = [
  { label: '중분류', value: 'ALL' },
  { label: '족보 관련 문의', value: 'EXAM_REVIEW_INQUIRY' },
  { label: '이벤트 관련 문의', value: 'EVENT_INQUIRY' },
  { label: '공지 관련 문의', value: 'NOTICE_INQUIRY' },
  { label: '기타', value: 'ETC_INQUIRY' },
] as const;

const REPORT_SUB_GROUP_OPTIONS = [
  { label: '중분류', value: 'ALL' },
  { label: '게시글 신고', value: 'POST_REPORT' },
  { label: '족보 신고', value: 'EXAM_REVIEW_REPORT' },
  { label: '이용자 신고', value: 'USER_REPORT' },
  { label: '댓글 신고', value: 'COMMENT_REPORT' },
] as const;

const STATUS_OPTIONS = [
  { label: '답변여부', value: 'ALL' },
  { label: '답변 전', value: 'PENDING' },
  { label: '답변 완료', value: 'COMPLETED' },
  { label: '보류', value: 'HOLD' },
] as const;

const PAGE_SIZE = 10;

type GroupFilter = (typeof GROUP_OPTIONS)[number]['value'];
type StatusFilter = (typeof STATUS_OPTIONS)[number]['value'];
type SubGroupFilter = InquirySubGroup | 'ALL';

export default function InquiryReportTable({
  currentPage,
  onPageChange,
}: InquiryReportTableProps) {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('ALL');
  const [subGroupFilter, setSubGroupFilter] = useState<SubGroupFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading] = useState(false);

  const subGroupOptions = useMemo(() => {
    if (groupFilter === 'INQUIRY') return INQUIRY_SUB_GROUP_OPTIONS;
    if (groupFilter === 'REPORT') return REPORT_SUB_GROUP_OPTIONS;

    return [
      { label: '중분류', value: 'ALL' },
      ...INQUIRY_SUB_GROUP_OPTIONS.filter((option) => option.value !== 'ALL'),
      ...REPORT_SUB_GROUP_OPTIONS.filter((option) => option.value !== 'ALL'),
    ];
  }, [groupFilter]);

  const filteredInquiries = useMemo(() => {
    return INQUIRY_REPORT_SAMPLE_DATA.filter((inquiry) => {
      return (
        (groupFilter === 'ALL' || inquiry.group === groupFilter) &&
        (subGroupFilter === 'ALL' || inquiry.subGroup === subGroupFilter) &&
        (statusFilter === 'ALL' || inquiry.status === statusFilter)
      );
    });
  }, [groupFilter, statusFilter, subGroupFilter]);

  const inquiries = useMemo(() => {
    const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInquiries.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);
  }, [currentPage, filteredInquiries]);

  const totalPage = Math.ceil(filteredInquiries.length / PAGE_SIZE);
  const hasNext = filteredInquiries.length > currentPage * PAGE_SIZE;
  const pageStartNumber = (currentPage - 1) * PAGE_SIZE;
  const isEmpty = !isLoading && inquiries.length === 0;

  const activeFilterCount = [
    groupFilter !== 'ALL',
    subGroupFilter !== 'ALL',
    statusFilter !== 'ALL',
  ].filter(Boolean).length;

  return (
    <div className='flex flex-col gap-3'>
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
              className={`h-9 w-[112px] ${groupFilter !== 'ALL' ? 'bg-blue-50' : 'bg-white'}`}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content align='start'>
              {GROUP_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {groupFilter !== 'ALL' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGroupFilter('ALL');
                setSubGroupFilter('ALL');
                onPageChange(1);
              }}
              className='absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center bg-blue-50 text-blue-400 hover:text-blue-600'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>

        <div className='relative'>
          <Select
            disabled={groupFilter === 'ALL'}
            value={subGroupFilter}
            onValueChange={(value) => {
              setSubGroupFilter(value as SubGroupFilter);
              onPageChange(1);
            }}
          >
            <Select.Trigger
              className={`h-9 w-[160px] ${groupFilter === 'ALL' ? 'bg-gray-50' : subGroupFilter !== 'ALL' ? 'bg-blue-50' : 'bg-white'}`}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content align='start'>
              {subGroupOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {subGroupFilter !== 'ALL' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSubGroupFilter('ALL');
                onPageChange(1);
              }}
              className='absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center bg-blue-50 text-blue-400 hover:text-blue-600'
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
              className={`h-9 w-[124px] ${statusFilter !== 'ALL' ? 'bg-blue-50' : 'bg-white'}`}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content align='start'>
              {STATUS_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {statusFilter !== 'ALL' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatusFilter('ALL');
                onPageChange(1);
              }}
              className='absolute top-1/2 right-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center bg-blue-50 text-blue-400 hover:text-blue-600'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>
      </div>

      <div className='overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm'>
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[860px] table-fixed text-[13px]'>
            <Table.Header className='h-[42px] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700'>
              <Table.Row>
                <Table.Head
                  style={{ width: '72px' }}
                  className='px-3 text-center'
                >
                  번호
                </Table.Head>
                <Table.Head
                  style={{ width: '96px' }}
                  className='px-3 text-center'
                >
                  분류
                </Table.Head>
                <Table.Head style={{ width: '150px' }} className='px-3'>
                  중분류
                </Table.Head>
                <Table.Head style={{ width: '180px' }} className='px-3'>
                  아이디
                </Table.Head>
                <Table.Head
                  style={{ width: '110px' }}
                  className='px-3 text-center'
                >
                  답변여부
                </Table.Head>
                <Table.Head style={{ width: '252px' }} className='px-3'>
                  제목
                </Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className='h-48 text-center'>
                    <div className='flex items-center justify-center gap-2 text-gray-500'>
                      <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
                      <span>문의 및 신고 목록을 불러오는 중입니다...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : isEmpty ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className='h-48 text-center text-sm text-gray-400'
                  >
                    {activeFilterCount > 0
                      ? '필터 조건에 해당하는 항목이 없습니다.'
                      : '등록된 문의 및 신고가 없습니다.'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                inquiries.map((inquiry, index) => (
                  <Table.Row
                    key={`${inquiry.postId}-${inquiry.createdAt}`}
                    className='border-b border-gray-100 bg-white last:border-0 hover:bg-gray-50 [&_td]:h-[54px]'
                  >
                    <Table.Cell className='px-3 text-center text-gray-600'>
                      {pageStartNumber + index + 1}
                    </Table.Cell>
                    <Table.Cell className='px-3 text-center'>
                      {getGroupLabel(inquiry.group)}
                    </Table.Cell>
                    <Table.Cell
                      className='truncate px-3 text-gray-700'
                      title={getSubGroupLabel(inquiry.subGroup)}
                    >
                      {getSubGroupLabel(inquiry.subGroup)}
                    </Table.Cell>
                    <Table.Cell
                      className='truncate px-3 text-gray-900'
                      title={getUserDisplay(inquiry)}
                    >
                      {getUserDisplay(inquiry)}
                    </Table.Cell>
                    <Table.Cell className='px-3 text-center'>
                      <Badge
                        className={STATUS_BADGE_CLASS_NAMES[inquiry.status]}
                      >
                        {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell
                      className='truncate px-3 font-bold text-gray-900'
                      title={inquiry.title}
                    >
                      {inquiry.title}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      <ExamReviewTablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        hasNext={hasNext}
        totalPage={totalPage}
      />
    </div>
  );
}

function getGroupLabel(group: InquiryGroup) {
  return GROUP_LABELS[group] ?? group;
}

function getSubGroupLabel(subGroup: InquirySubGroup) {
  return SUB_GROUP_LABELS[subGroup] ?? subGroup;
}

function getUserDisplay(inquiry: InquiryListItem) {
  return `${inquiry.userLoginId}(${inquiry.userId})`;
}
