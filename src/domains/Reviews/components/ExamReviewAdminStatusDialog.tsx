import { useEffect, useMemo } from 'react';

import {
  CalendarPlusIcon,
  FlaskConicalIcon,
  Settings2Icon,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  Skeleton,
  Tabs,
} from '@/shared/components/ui';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  useExamReviewAdminStatus,
  useExamReviewAdminStatusPeriods,
} from '@/domains/Reviews/hooks';
import {
  getDefaultAdminStatusPeriod,
  sortAdminStatusPeriods,
} from '@/domains/Reviews/utils';

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
    <div className='grid gap-4 lg:grid-cols-2'>
      {[0, 1].map((item) => (
        <Card key={item} className='h-[392px] p-6'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='mt-2 h-4 w-56 max-w-full' />
          <div className='mt-8 flex items-center gap-6'>
            <Skeleton className='size-36 shrink-0 rounded-full' />
            <div className='flex flex-1 flex-col gap-3'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        </Card>
      ))}
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
  const { periodsQuery } = useExamReviewAdminStatusPeriods(open);
  const periods = useMemo(
    () => sortAdminStatusPeriods(periodsQuery.data ?? []),
    [periodsQuery.data]
  );
  const selectedPeriod = periods.find(
    (period) => period.id === selectedPeriodId
  );
  const statusQuery = useExamReviewAdminStatus(selectedPeriodId, open);

  useEffect(() => {
    if (periodsQuery.isPending) return;

    const selectedPeriodStillExists = periods.some(
      (period) => period.id === selectedPeriodId
    );

    if (selectedPeriodStillExists) return;

    onSelectedPeriodChange(getDefaultAdminStatusPeriod(periods)?.id ?? null);
  }, [
    onSelectedPeriodChange,
    periods,
    periodsQuery.isPending,
    selectedPeriodId,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='h-[min(640px,85vh)] overflow-y-auto sm:max-w-5xl'>
        <Dialog.Header className='pr-8'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <Dialog.Title>담당 관리자 현황</Dialog.Title>
                <Badge variant='secondary'>
                  <FlaskConicalIcon />
                  Mock 데이터
                </Badge>
              </div>
              <Dialog.Description>
                선택한 기간에 등록된 시험후기의 확인 현황입니다.
              </Dialog.Description>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onOpenPeriodEditor}
            >
              <Settings2Icon />
              기간 편집
            </Button>
          </div>
        </Dialog.Header>

        {periodsQuery.isPending ? (
          <div className='flex flex-col gap-4'>
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
          <Card className='flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center'>
            <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
              <CalendarPlusIcon className='text-muted-foreground size-6' />
            </div>
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
          </Card>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Tabs
                value={String(selectedPeriodId)}
                onValueChange={(value) => onSelectedPeriodChange(Number(value))}
              >
                <div className='overflow-x-auto px-1 pb-2'>
                  <Tabs.List variant='default' className='w-max min-w-full'>
                    {periods.map((period) => (
                      <Tabs.Trigger key={period.id} value={String(period.id)}>
                        {period.title}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                </div>
              </Tabs>
              {selectedPeriod && (
                <p className='bg-muted/60 text-muted-foreground flex flex-wrap items-center gap-x-2 rounded-md px-3 py-2 text-sm tabular-nums'>
                  <span className='text-foreground/70 font-medium'>
                    조회 기간
                  </span>
                  <span>
                    {formatDateTimeToMinutes(selectedPeriod.startAt)} ~{' '}
                    {formatDateTimeToMinutes(selectedPeriod.endAt)}
                  </span>
                </p>
              )}
            </div>

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
              <div className='grid items-stretch gap-4 lg:grid-cols-2'>
                <ExamReviewProgressChart summary={statusQuery.data.summary} />
                <ExamReviewAdminStatusList
                  managers={statusQuery.data.managers}
                  summary={statusQuery.data.summary}
                />
              </div>
            ) : null}
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
}
