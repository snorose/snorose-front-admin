import { useCallback, useEffect, useRef, useState } from 'react';

import { Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import { useInquiryList } from '../hooks';
import type { Inquiry, InquiryListParams } from '../types';
import InquiryStatusBadge from './InquiryStatusBadge';
import {
  InquiryTableEmpty,
  InquiryTableEmptyRows,
  InquiryTableSkeleton,
} from './InquiryTableFallback';
import InquiryTablePagination from './InquiryTablePagination';

const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  { key: 'category', label: '분류', width: '60px' },
  { key: 'subCategory', label: '중분류', width: '120px' },
  { key: 'userId', label: '아이디', width: '140px' },
  { key: 'status', label: '답변여부', width: '80px' },
  { key: 'title', label: '제목', width: '200px' },
  { key: 'contentPreview', label: '내용 미리보기', width: '160px' },
  { key: 'assignee', label: '담당자', width: '80px' },
] as const;

interface InquiryTableProps {
  selectedId?: number | null;
  onRowSelect?: (inquiry: Inquiry | null) => void;
  checkedIds?: Set<number>;
  onCheckChange?: (ids: Set<number>) => void;
  searchParams?: Omit<InquiryListParams, 'page'>;
  currentPage?: number;
  onPageChange?: (page: number | ((prev: number) => number)) => void;
}

export default function InquiryTable({
  selectedId,
  onRowSelect,
  checkedIds = new Set(),
  onCheckChange,
  searchParams = {},
  currentPage: propCurrentPage,
  onPageChange,
}: InquiryTableProps) {
  const lastSelectedIdRef = useRef<number | null>(null);
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = propCurrentPage ?? internalPage;

  const setCurrentPage = useCallback(
    (pageOrUpdater: number | ((prev: number) => number)) => {
      if (onPageChange) {
        onPageChange(pageOrUpdater);
      } else {
        setInternalPage(pageOrUpdater);
      }
    },
    [onPageChange]
  );

  const { data, isLoading } = useInquiryList({
    ...searchParams,
    page: currentPage,
  });

  const rows = data?.data ?? [];
  const hasNext = data?.hasNext ?? false;
  const totalPages = data?.total
    ? Math.ceil(data.total / ITEMS_PER_PAGE)
    : undefined;

  // 현재 페이지 전체 선택 여부
  const pageIds = rows.map((r) => r.id);
  const allChecked =
    pageIds.length > 0 && pageIds.every((id) => checkedIds.has(id));
  const someChecked = pageIds.some((id) => checkedIds.has(id));

  const toggleAll = () => {
    if (!onCheckChange) return;
    if (allChecked) {
      const next = new Set(checkedIds);
      pageIds.forEach((id) => next.delete(id));
      onCheckChange(next);
    } else {
      const next = new Set(checkedIds);
      pageIds.forEach((id) => next.add(id));
      onCheckChange(next);
    }
  };

  const toggleOne = (id: number) => {
    if (!onCheckChange) return;
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onCheckChange(next);
  };

  // 상세 패널용 — 선택된 행이 데이터 갱신 후에도 최신 상태 유지
  useEffect(() => {
    if (selectedId && onRowSelect && rows.length > 0) {
      if (lastSelectedIdRef.current === selectedId) return;
      const updated = rows.find((r) => r.id === selectedId);
      if (updated) {
        lastSelectedIdRef.current = selectedId;
        onRowSelect(updated);
      }
    } else if (!selectedId) {
      lastSelectedIdRef.current = null;
    }
  }, [selectedId, rows, onRowSelect]);

  return (
    <>
      <div className='overflow-hidden rounded-md border'>
        <Table
          className={`${rows.length === 0 && !isLoading ? 'w-full' : 'table-fixed'} rounded-lg bg-white shadow`}
        >
          <Table.Header className='z-10 h-[40px] bg-gray-100 shadow-sm [&_tr]:border-b'>
            <Table.Row>
              {/* 전체 선택 체크박스 */}
              <Table.Head style={{ width: '40px', minWidth: '40px' }}>
                <input
                  type='checkbox'
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={toggleAll}
                  className='cursor-pointer'
                />
              </Table.Head>
              {COLUMNS.map((col) => (
                <Table.Head
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  className='overflow-hidden'
                >
                  {col.label}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading ? (
              <InquiryTableSkeleton itemsPerPage={ITEMS_PER_PAGE} />
            ) : rows.length === 0 ? (
              <InquiryTableEmpty />
            ) : (
              <>
                {rows.map((inquiry) => (
                  <Table.Row
                    key={inquiry.id}
                    className={cn(
                      'cursor-pointer [&_td]:h-[40px]',
                      selectedId === inquiry.id &&
                        'bg-blue-100 hover:bg-blue-100',
                      checkedIds.has(inquiry.id) &&
                        selectedId !== inquiry.id &&
                        'bg-indigo-50'
                    )}
                    onClick={() => {
                      onRowSelect?.(selectedId === inquiry.id ? null : inquiry);
                    }}
                  >
                    {/* 행 체크박스 */}
                    <Table.Cell onClick={(e) => e.stopPropagation()}>
                      <input
                        type='checkbox'
                        checked={checkedIds.has(inquiry.id)}
                        onChange={() => toggleOne(inquiry.id)}
                        className='cursor-pointer'
                      />
                    </Table.Cell>
                    <Table.Cell className='truncate'>
                      {inquiry.category}
                    </Table.Cell>
                    <Table.Cell className='truncate'>
                      {inquiry.subCategory}
                    </Table.Cell>
                    <Table.Cell className='truncate'>
                      {inquiry.userId}
                    </Table.Cell>
                    <Table.Cell>
                      <InquiryStatusBadge status={inquiry.status} />
                    </Table.Cell>
                    <Table.Cell className='truncate overflow-hidden'>
                      {inquiry.title}
                    </Table.Cell>
                    <Table.Cell className='truncate overflow-hidden text-gray-500'>
                      {inquiry.contentPreview}
                    </Table.Cell>
                    <Table.Cell className='text-center text-xs text-gray-500'>
                      {inquiry.assignee ?? '–'}
                    </Table.Cell>
                  </Table.Row>
                ))}
                <InquiryTableEmptyRows count={ITEMS_PER_PAGE - rows.length} />
              </>
            )}
          </Table.Body>
        </Table>
      </div>

      <InquiryTablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        hasNext={hasNext}
        totalPages={totalPages}
      />
    </>
  );
}
