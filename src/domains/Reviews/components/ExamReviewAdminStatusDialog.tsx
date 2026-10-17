import { useEffect, useMemo, useRef } from 'react';

import {
  CalendarPlusIcon,
  Settings2Icon,
  TriangleAlertIcon,
} from 'lucide-react';

import { Alert, Button, Dialog, Skeleton } from '@/shared/components/ui';
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
      <div className='space-y-2'>
        <Skeleton className='h-6 w-36' />
        <Skeleton className='h-4 w-full max-w-80' />
        <Skeleton className='mt-3 h-36 w-full rounded-lg' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-40' />
        <Skeleton className='h-4 w-64 max-w-full' />
        <Skeleton className='mt-3 h-24 w-full rounded-lg' />
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='@container flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)] sm:max-w-[960px]'>
        <Dialog.Header className='shrink-0 gap-1 px-5 pt-5 pr-14 text-left sm:px-6 sm:pt-6 sm:pr-14'>
          <Dialog.Title className='text-xl leading-7'>
            담당 관리자 현황
          </Dialog.Title>
          <Dialog.Description className='leading-5 break-keep'>
            기간별 확인 상태와 관리자별 처리 이력을 확인합니다.
          </Dialog.Description>
        </Dialog.Header>

        <div className='min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-5 sm:px-6 sm:pb-6'>
          {periodsQuery.isPending ? (
            <div className='flex flex-col gap-6'>
              <Skeleton className='h-9 w-full' />
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
            <div className='flex flex-col gap-6'>
              <div className='flex min-w-0 flex-col gap-2'>
                <h3 className='text-base font-semibold'>조회 기간</h3>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-start gap-3'>
                    <div
                      role='group'
                      aria-label='조회 기간 선택'
                      className='flex min-w-0 flex-1 flex-wrap gap-2'
                    >
                      {periods.map((period) => (
                        <Button
                          key={period.id}
                          type='button'
                          variant='outline'
                          size='sm'
                          className='aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-primary aria-pressed:hover:bg-primary/10 h-auto min-h-11 max-w-full flex-none px-3 py-2 text-left whitespace-normal shadow-none transition-colors sm:min-h-9'
                          aria-pressed={period.id === selectedPeriodId}
                          onClick={() => {
                            isDefaultSelectionRef.current = false;
                            onSelectedPeriodChange(period.id);
                          }}
                        >
                          <span className='min-w-0 [overflow-wrap:anywhere] break-keep'>
                            {period.title}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='min-h-11 shrink-0 sm:min-h-9'
                      onClick={onOpenPeriodEditor}
                    >
                      <Settings2Icon />
                      기간 편집
                    </Button>
                  </div>
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
              </div>

              {statusQuery.isPending || statusQuery.isFetching ? (
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
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
