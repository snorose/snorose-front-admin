import { useEffect, useState } from 'react';

import { History, Loader2 } from 'lucide-react';

import {
  STATUS_HISTORY_META,
  UNKNOWN_STATUS_HISTORY_META,
} from '@/shared/constants/status-history';
import { useStableTotalPage } from '@/shared/hooks';
import type { AdminStatusHistory } from '@/shared/types/status-history';
import { clampOneBasedPage, formatDateTimeToMinutes } from '@/shared/utils';

import { PaginationBar } from './PaginationBar';
import { StatusBadge } from './StatusBadge';
import { Button, Dialog } from './ui';

interface StatusHistoryCardProps {
  title: string;
  statusLogs: AdminStatusHistory[];
  totalCount?: number;
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  totalPage?: number;
  onPageChange: (page: number) => void;
}

export function StatusHistoryCard({
  title,
  statusLogs,
  totalCount,
  isLoading,
  isError,
  currentPage,
  totalPage: responseTotalPage,
  onPageChange,
}: StatusHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalPage = useStableTotalPage(responseTotalPage, currentPage);

  useEffect(() => {
    if (isLoading) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) onPageChange(validPage);
  }, [currentPage, isLoading, totalPage, onPageChange]);

  const latestLog = statusLogs[0];
  return (
    <>
      <div className='flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-[14px] font-bold text-gray-900'>{title}</h3>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`${title} 전체 보기`}
            onClick={() => setIsOpen(true)}
          >
            <History aria-hidden='true' />
          </Button>
        </div>
        {isLoading ? (
          <p className='text-xs text-gray-500'>
            상태 변경 내역을 불러오는 중입니다.
          </p>
        ) : isError ? (
          <p className='text-xs text-red-500'>
            상태 변경 내역을 불러오지 못했습니다.
          </p>
        ) : latestLog ? (
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <span className='text-gray-500'>이전 상태</span>
            <span className='text-gray-500'>상태 변경일</span>
            <span>
              <StatusBadge
                tone={
                  (
                    STATUS_HISTORY_META[latestLog.changedStatus] ??
                    UNKNOWN_STATUS_HISTORY_META
                  ).tone
                }
              >
                {
                  (
                    STATUS_HISTORY_META[latestLog.changedStatus] ??
                    UNKNOWN_STATUS_HISTORY_META
                  ).label
                }
              </StatusBadge>
            </span>
            <span>{formatDateTimeToMinutes(latestLog.changedAt)}</span>
          </div>
        ) : (
          <p className='py-4 text-center text-xs text-gray-400'>
            상태 변경 내역이 없습니다.
          </p>
        )}
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) onPageChange(1);
        }}
      >
        <Dialog.Content className='max-h-[calc(100dvh-4rem)] gap-0 overflow-hidden p-0 sm:max-w-xl'>
          <div className='flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col'>
            <Dialog.Header className='shrink-0 gap-2 px-6 pt-5 pb-4 text-left'>
              <Dialog.Title className='flex items-center gap-2 pr-6'>
                <History className='size-4 shrink-0' aria-hidden='true' />
                {title}
              </Dialog.Title>
              <Dialog.Description>
                전체 상태 변경 내역을 확인할 수 있습니다.
              </Dialog.Description>
            </Dialog.Header>
            <div className='shrink-0 border-t' />
            <div className='shrink-0 px-6 pt-4'>
              <p className='text-muted-foreground text-xs'>
                전체 상태 변경 내역{' '}
                {(totalCount ?? statusLogs.length).toLocaleString()}건
              </p>
            </div>
            <div
              className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-3 pb-5'
              aria-label={title}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div
                  role='status'
                  className='text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm'
                >
                  <Loader2 className='size-4 animate-spin' aria-hidden='true' />
                  상태 변경 내역을 불러오는 중입니다.
                </div>
              ) : isError ? (
                <div
                  role='alert'
                  className='py-4 text-center text-sm text-red-500'
                >
                  상태 변경 내역을 불러오지 못했습니다.
                </div>
              ) : statusLogs.length === 0 ? (
                <div
                  role='status'
                  className='bg-muted text-muted-foreground rounded-md px-4 py-10 text-center text-sm'
                >
                  상태 변경 내역이 없습니다.
                </div>
              ) : (
                <ol className='border-border relative ml-1.5 space-y-4 border-l pl-4'>
                  {statusLogs.map((log, index) => {
                    const status =
                      STATUS_HISTORY_META[log.changedStatus] ??
                      UNKNOWN_STATUS_HISTORY_META;
                    return (
                      <li
                        key={`${log.changedAt}-${log.changedStatus}-${index}`}
                        className='relative'
                      >
                        <span
                          aria-hidden='true'
                          className='absolute top-4 -left-[1.4375rem] size-3 rounded-full bg-rose-500'
                        />
                        <article className='rounded-lg border border-slate-100 bg-white p-4'>
                          <dl className='grid min-w-0 grid-cols-3 gap-x-4 gap-y-5'>
                            <div className='flex min-w-0 flex-col gap-2'>
                              <dt className='text-xs font-medium text-slate-500'>
                                상태
                              </dt>
                              <dd>
                                <StatusBadge tone={status.tone}>
                                  {status.label}
                                </StatusBadge>
                              </dd>
                            </div>
                            <div className='flex min-w-0 flex-col gap-2'>
                              <dt className='text-xs font-medium text-slate-500'>
                                관리자명
                              </dt>
                              <dd
                                className='truncate text-sm font-semibold text-gray-700'
                                title={log.actorNickname ?? '시스템'}
                              >
                                {log.actorNickname ?? '시스템'}
                              </dd>
                            </div>
                            <div className='flex min-w-0 flex-col gap-2'>
                              <dt className='text-xs font-medium text-slate-500'>
                                상태 변경일
                              </dt>
                              <dd>
                                <time
                                  dateTime={log.changedAt}
                                  title={log.changedAt.replace('T', ' ')}
                                  className='text-sm font-semibold whitespace-nowrap text-gray-700'
                                >
                                  {formatDateTimeToMinutes(log.changedAt)}
                                </time>
                              </dd>
                            </div>
                            {log.memo && (
                              <div className='col-span-3 flex min-w-0 flex-col gap-2'>
                                <dt className='text-xs font-medium text-slate-500'>
                                  운영자 메모
                                </dt>
                                <dd className='rounded-xl bg-slate-100 px-3 py-4 text-sm font-semibold wrap-anywhere whitespace-pre-wrap text-gray-700'>
                                  {log.memo}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              )}
              {!isLoading && !isError && totalPage > 1 && (
                <div className='mt-4'>
                  <PaginationBar
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    totalPage={totalPage}
                  />
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
