import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, Popover } from '@/shared/components/ui';

import {
  InquiryDetailPanel,
  InquirySearch,
  InquiryTable,
} from '@/domains/Inquiry/components';
import type {
  Inquiry,
  InquiryListParams,
  InquiryStatus,
} from '@/domains/Inquiry/types';

const MOCK_ADMINS = ['admin01', 'admin02', 'admin03'];

const STATUS_OPTIONS: InquiryStatus[] = ['접수', '진행중', '진행완료', '보류'];

const STATUS_SELECT_STYLE: Record<InquiryStatus, string> = {
  접수: 'bg-gray-100 text-gray-600 border-gray-300',
  진행중: 'bg-blue-100 text-blue-700 border-blue-300',
  진행완료: 'bg-green-100 text-green-700 border-green-300',
  보류: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export default function InquiryPage() {
  const queryClient = useQueryClient();
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [searchParams, setSearchParams] = useState<
    Omit<InquiryListParams, 'page'>
  >({});

  // 담당자 팝오버
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState('');
  const assigneeInputRef = useRef<HTMLInputElement>(null);

  const currentPage = parseInt(searchParamsFromUrl.get('page') || '1', 10);

  const handleSearchChange = (params: Omit<InquiryListParams, 'page'>) => {
    setSearchParams(params);
    const next = new URLSearchParams();
    next.set('page', '1');
    setSearchParamsFromUrl(next, { replace: true });
    setSelectedInquiry(null);
    setCheckedIds(new Set());
  };

  const handlePageChange = (
    pageOrUpdater: number | ((prev: number) => number)
  ) => {
    const next =
      typeof pageOrUpdater === 'function'
        ? pageOrUpdater(currentPage)
        : pageOrUpdater;
    const newParams = new URLSearchParams(searchParamsFromUrl);
    newParams.set('page', next.toString());
    setSearchParamsFromUrl(newParams, { replace: true });
  };

  // 캐시 일괄 반영 유틸
  const patchCache = (ids: number[], patch: Partial<Inquiry>) => {
    queryClient.setQueriesData<{
      data: Inquiry[];
      hasNext: boolean;
      total: number;
    }>({ queryKey: ['inquiryList'] }, (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((item) =>
          ids.includes(item.id)
            ? { ...item, ...patch, updatedAt: new Date().toISOString() }
            : item
        ),
      };
    });
    // 상세 캐시도 갱신
    ids.forEach((id) => {
      const prev = queryClient.getQueryData<Inquiry>(['inquiryDetail', id]);
      if (prev) {
        queryClient.setQueryData(['inquiryDetail', id], {
          ...prev,
          ...patch,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    // 선택된 상세 패널도 갱신
    if (selectedInquiry && ids.includes(selectedInquiry.id)) {
      setSelectedInquiry((prev) =>
        prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev
      );
    }
  };

  // ── 일괄 상태 변경 ────────────────────────────────────────────────────────
  const handleBulkStatusChange = (status: InquiryStatus) => {
    const ids = [...checkedIds];
    patchCache(ids, { status });
    toast.success(`${ids.length}건의 상태를 "${status}"로 변경했습니다.`);
  };

  // ── 일괄 담당자 지정 ──────────────────────────────────────────────────────
  const handleBulkAssignee = (name: string) => {
    const ids = [...checkedIds];
    patchCache(ids, { assignee: name || undefined });
    setIsAssigneeOpen(false);
    setAssigneeInput('');
    toast.success(
      name
        ? `${ids.length}건에 담당자 "${name}"을 지정했습니다.`
        : `${ids.length}건의 담당자를 해제했습니다.`
    );
  };

  // ── 단건 상세 저장 ────────────────────────────────────────────────────────
  const handleSaveSuccess = (updated: Inquiry) => {
    patchCache([updated.id], updated);
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='문의/신고 관리'
        description='접수된 문의 및 신고를 확인하고 처리할 수 있어요.'
      />

      <div className='flex flex-col gap-2'>
        <InquirySearch onSearchChange={handleSearchChange} />

        {/* ── 일괄 처리 바 ─────────────────────────────────────── */}
        {checkedIds.size > 0 && (
          <div className='flex items-center gap-3 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2'>
            <span className='text-sm font-medium text-indigo-700'>
              {checkedIds.size}건 선택됨
            </span>

            {/* 상태 변경 */}
            <select
              defaultValue=''
              onChange={(e) => {
                if (e.target.value)
                  handleBulkStatusChange(e.target.value as InquiryStatus);
                e.target.value = '';
              }}
              className='h-7 cursor-pointer rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none'
            >
              <option value='' disabled>
                상태 변경
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className={STATUS_SELECT_STYLE[s]}>
                  {s}
                </option>
              ))}
            </select>

            {/* 담당자 지정 */}
            <Popover open={isAssigneeOpen} onOpenChange={setIsAssigneeOpen}>
              <Popover.Trigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 gap-1.5 border-gray-300 bg-white text-xs'
                >
                  <UserRound className='h-3.5 w-3.5' />
                  담당자 지정
                </Button>
              </Popover.Trigger>
              <Popover.Content
                align='start'
                className='w-52 p-3'
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  setTimeout(() => assigneeInputRef.current?.focus(), 50);
                }}
              >
                <p className='mb-2 text-xs font-semibold text-gray-600'>
                  담당자 지정 ({checkedIds.size}건)
                </p>
                <input
                  ref={assigneeInputRef}
                  type='text'
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  placeholder='아이디 직접 입력'
                  className='mb-2 h-7 w-full rounded border border-gray-300 px-2 text-xs focus:border-blue-400 focus:outline-none'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBulkAssignee(assigneeInput);
                  }}
                />
                <div className='mb-2 flex flex-col gap-0.5'>
                  {MOCK_ADMINS.map((admin) => (
                    <button
                      key={admin}
                      type='button'
                      onClick={() => {
                        setAssigneeInput(admin);
                        handleBulkAssignee(admin);
                      }}
                      className='rounded px-2 py-1 text-left text-xs hover:bg-gray-100'
                    >
                      {admin}
                    </button>
                  ))}
                </div>
                <div className='flex justify-between gap-1'>
                  <button
                    type='button'
                    onClick={() => handleBulkAssignee('')}
                    className='text-xs text-gray-400 hover:text-red-500'
                  >
                    지정 해제
                  </button>
                  <Button
                    size='sm'
                    className='h-6 bg-gray-700 text-xs hover:bg-gray-800'
                    onClick={() => handleBulkAssignee(assigneeInput)}
                  >
                    저장
                  </Button>
                </div>
              </Popover.Content>
            </Popover>

            <button
              type='button'
              onClick={() => setCheckedIds(new Set())}
              className='ml-auto text-xs text-gray-400 hover:text-gray-600'
            >
              선택 해제
            </button>
          </div>
        )}

        <InquiryTable
          selectedId={selectedInquiry?.id}
          onRowSelect={setSelectedInquiry}
          checkedIds={checkedIds}
          onCheckChange={setCheckedIds}
          searchParams={searchParams}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <InquiryDetailPanel
        selectedInquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
