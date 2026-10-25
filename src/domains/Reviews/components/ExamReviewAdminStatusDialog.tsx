import { useEffect, useMemo, useRef } from 'react';

import { CalendarPlusIcon, PencilIcon, TriangleAlertIcon } from 'lucide-react';

import { Modal } from '@/shared/components/Modal';
import { Alert, Button, Skeleton, Tabs } from '@/shared/components/ui';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  useExamReviewAdminStatus,
  useExamReviewAdminStatusPeriods,
} from '@/domains/Reviews/hooks';
import { sortAdminStatusPeriods } from '@/domains/Reviews/utils';

import { ExamReviewAdminStatusList } from './ExamReviewAdminStatusList';
import { ExamReviewProgressChart } from './ExamReviewProgressChart';

interface ExamReviewAdminStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPeriodId: number | null;
  onSelectedPeriodChange: (periodId: number | null) => void;
  onOpenPeriodEditor: () => void;
}

function AdminStatusSkeleton() {
  return (
    <div
      role='status'
      aria-label='현황을 불러오는 중'
      className='grid gap-6 @min-[48rem]:grid-cols-2'
    >
      <div>
        <Skeleton className='h-6 w-40' />
        <div className='bg-muted/30 mt-2 rounded-lg border p-4'>
          <div className='grid grid-cols-3 gap-6'>
            {[0, 1, 2].map((item) => (
              <div key={item} className='space-y-1'>
                <Skeleton className='h-5 w-full max-w-20' />
                <Skeleton className='h-8 w-12 sm:h-9' />
              </div>
            ))}
          </div>
          <div className='mt-4 border-t pt-8 pb-4'>
            <Skeleton className='mx-auto size-36 rounded-full' />
          </div>
        </div>
      </div>
      <div>
        <Skeleton className='h-6 w-44' />
        <div className='mt-2 overflow-hidden rounded-lg border'>
          <div className='border-b px-4 py-2.5'>
            <Skeleton className='h-5 w-full' />
          </div>
          {Array.from({ length: 6 }, (_, item) => (
            <div
              key={item}
              className='flex items-center justify-between border-b px-4 py-3 last:border-b-0'
            >
              <Skeleton className='h-5 w-28' />
              <Skeleton className='h-5 w-10' />
            </div>
          ))}
        </div>
        <Skeleton className='mt-2 h-4 w-full max-w-80' />
      </div>
    </div>
  );
}

export function ExamReviewAdminStatusDialog({
  open,
  onOpenChange,
  selectedPeriodId,
  onSelectedPeriodChange,
  onOpenPeriodEditor,
}: ExamReviewAdminStatusDialogProps) {
  const isDefaultSelectionRef = useRef(false);
  const { periodsQuery } = useExamReviewAdminStatusPeriods(open);
  const periods = useMemo(
    () => sortAdminStatusPeriods(periodsQuery.data ?? []),
    [periodsQuery.data]
  );
  const selectedPeriod = periods.find(
    (period) => period.id === selectedPeriodId
  );
  const statusQuery = useExamReviewAdminStatus(selectedPeriod, open);

  useEffect(() => {
    if (!open) {
      isDefaultSelectionRef.current = false;
      return;
    }
    if (periodsQuery.isPending || periodsQuery.isError) return;
    if (selectedPeriodId === null) isDefaultSelectionRef.current = true;

    const selectedPeriodStillExists = periods.some(
      (period) => period.id === selectedPeriodId
    );

    if (selectedPeriodStillExists && !isDefaultSelectionRef.current) return;

    const firstPeriodId = periods[0]?.id ?? null;
    if (firstPeriodId !== selectedPeriodId)
      onSelectedPeriodChange(firstPeriodId);
  }, [
    onSelectedPeriodChange,
    periods,
    periodsQuery.isPending,
    periodsQuery.isError,
    open,
    selectedPeriodId,
  ]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title='담당 관리자 현황'
      subtitle='기간별 확인 상태와 관리자별 처리 이력을 확인합니다.'
      size='xl'
      className='@container h-[85dvh] sm:max-w-[960px] lg:h-[min(38rem,85dvh)]'
    >
      <div className='min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6'>
        {periodsQuery.isPending ? (
          <div className='flex flex-col gap-6'>
            <div className='space-y-2'>
              <div className='flex h-6 items-center gap-3 @max-[22rem]:h-11'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-4 w-56 max-w-full' />
              </div>
              <div className='flex h-12 items-center justify-between gap-3 sm:h-9'>
                <Skeleton className='h-full w-3/5' />
                <Skeleton className='h-11 w-24 shrink-0 sm:h-9' />
              </div>
            </div>
            <AdminStatusSkeleton />
          </div>
        ) : periodsQuery.isError ? (
          <Alert variant='destructive'>
            <TriangleAlertIcon />
            <Alert.Title>기간을 불러오지 못했습니다.</Alert.Title>
            <Alert.Description>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => periodsQuery.refetch()}
              >
                다시 시도
              </Button>
            </Alert.Description>
          </Alert>
        ) : periods.length === 0 ? (
          <div className='flex min-h-56 flex-col items-center justify-center gap-4 py-6 text-center'>
            <div>
              <h3 className='font-semibold'>
                등록된 현황 집계 기간이 없습니다.
              </h3>
              <p className='text-muted-foreground mt-1 text-sm'>
                기간을 추가하면 해당 범위의 시험후기 현황을 확인할 수 있어요.
              </p>
            </div>
            <Button type='button' onClick={onOpenPeriodEditor}>
              <CalendarPlusIcon />
              기간 추가
            </Button>
          </div>
        ) : (
          <Tabs
            value={selectedPeriodId === null ? '' : String(selectedPeriodId)}
            onValueChange={(value) => {
              isDefaultSelectionRef.current = false;
              onSelectedPeriodChange(Number(value));
            }}
            className='min-w-0 gap-6'
          >
            <div className='flex min-w-0 flex-col gap-2'>
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <h3 className='shrink-0 text-base font-semibold'>조회 기간</h3>
                {selectedPeriod && (
                  <p className='text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs leading-5 tabular-nums'>
                    <time
                      className='whitespace-nowrap'
                      dateTime={selectedPeriod.startAt}
                    >
                      {formatDateTimeToMinutes(selectedPeriod.startAt)}
                    </time>
                    <span>~</span>
                    <time
                      className='whitespace-nowrap'
                      dateTime={selectedPeriod.endAt}
                    >
                      {formatDateTimeToMinutes(selectedPeriod.endAt)}
                    </time>
                  </p>
                )}
              </div>
              <div className='flex min-w-0 items-start gap-3'>
                <div className='min-w-0 flex-1'>
                  <Tabs.List
                    aria-label='조회 기간 선택'
                    className='max-w-full flex-wrap justify-start p-0.5 group-data-[orientation=horizontal]/tabs:h-auto sm:p-[3px]'
                  >
                    {periods.map((period) => (
                      <Tabs.Trigger
                        key={period.id}
                        value={String(period.id)}
                        className='min-h-11 max-w-full flex-none px-3 break-all whitespace-normal focus-visible:outline-none focus-visible:ring-inset sm:min-h-[30px]'
                      >
                        {period.title}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='border-foreground min-h-11 shrink-0 sm:min-h-9'
                  onClick={onOpenPeriodEditor}
                >
                  <PencilIcon className='size-3.5' aria-hidden='true' />
                  기간 편집
                </Button>
              </div>
            </div>

            <Tabs.Content
              value={selectedPeriodId === null ? '' : String(selectedPeriodId)}
              aria-busy={statusQuery.isFetching}
              className='min-w-0'
            >
              {statusQuery.isPending ? (
                <AdminStatusSkeleton />
              ) : statusQuery.isError ? (
                <Alert variant='destructive'>
                  <TriangleAlertIcon />
                  <Alert.Title>현황을 불러오지 못했습니다.</Alert.Title>
                  <Alert.Description>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => statusQuery.refetch()}
                    >
                      다시 시도
                    </Button>
                  </Alert.Description>
                </Alert>
              ) : statusQuery.data ? (
                <div className='grid gap-6 @min-[48rem]:grid-cols-2'>
                  <ExamReviewProgressChart summary={statusQuery.data} />
                  <ExamReviewAdminStatusList
                    managers={statusQuery.data.adminStatics}
                  />
                </div>
              ) : null}
            </Tabs.Content>
          </Tabs>
        )}
      </div>
    </Modal>
  );
}
