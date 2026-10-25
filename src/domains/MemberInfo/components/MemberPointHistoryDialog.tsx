import type { UIEvent } from 'react';

import { ArrowUpRight, Copy, History, Loader2, WifiOff } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import PointHistoryCard from '@/domains/MemberInfo/components/point-history/PointHistoryCard';
import { useMemberPointHistory } from '@/domains/MemberInfo/hooks/useMemberPointHistory';

type MemberPointHistoryDialogProps = {
  member: MemberInfo;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function MemberPointHistoryDialog({
  member,
  onOpenChange,
  open,
}: MemberPointHistoryDialogProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetching,
    isFetchingNextPage,
    isPaused,
    isPending,
    refetch,
  } = useMemberPointHistory(member.encryptedUserId, open);
  // 조회 사이 새 로그가 추가되어 페이지 경계가 겹쳐도 같은 로그를 중복 표시하지 않는다.
  const histories = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.data) ?? []).map((history) => [
        history.id,
        history,
      ])
    ).values()
  );
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetching || isError || isPaused) return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 80) {
      void fetchNextPage({ cancelRefetch: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='flex max-h-[calc(100dvh-4rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <Dialog.Header className='gap-2 border-b px-6 py-5 text-left'>
          <Dialog.Title className='flex items-center gap-2 pr-6'>
            <History className='size-4 shrink-0' aria-hidden='true' />
            포인트 증감 히스토리
          </Dialog.Title>
          <Dialog.Description className='pr-6'>
            {member.userName}({member.studentNumber})의 전체 포인트 증감 내역을
            확인할 수 있습니다.
          </Dialog.Description>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <span className='inline-flex items-center gap-1'>
              <ArrowUpRight className='size-3.5' aria-hidden='true' />
              관련 화면을 새 탭으로 열기
            </span>
            <span className='inline-flex items-center gap-1'>
              <Copy className='size-3.5' aria-hidden='true' />
              ID 복사
            </span>
          </div>
        </Dialog.Header>

        <div
          className='min-h-0 flex-1 overflow-y-auto px-6 py-5'
          onScroll={handleScroll}
          aria-label='포인트 증감 내역'
          aria-busy={isFetching || isPending}
        >
          {isPaused ? (
            <div
              role='status'
              className='bg-muted text-muted-foreground mb-4 flex items-center justify-center gap-2 rounded-md px-4 py-6 text-sm'
            >
              <WifiOff className='size-4 shrink-0' aria-hidden='true' />
              네트워크 연결을 기다리고 있습니다.
            </div>
          ) : null}
          {isPending && !isPaused ? (
            <div
              role='status'
              className='text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm'
            >
              <Loader2 className='size-4 animate-spin' aria-hidden='true' />
              포인트 내역을 불러오는 중입니다.
            </div>
          ) : histories.length > 0 ? (
            <ol className='border-border ml-1.5 space-y-4 border-l pl-4'>
              {histories.map((history) => (
                <PointHistoryCard key={history.id} history={history} />
              ))}
            </ol>
          ) : !isError && !isPending ? (
            <p className='bg-muted text-muted-foreground rounded-md px-4 py-10 text-center text-sm'>
              포인트 증감 내역이 없습니다.
            </p>
          ) : null}

          {isError ? (
            <div
              role='alert'
              className='mt-4 space-y-3 rounded-md bg-rose-50 p-4 text-center text-sm text-rose-700'
            >
              <p>포인트 내역을 불러오지 못했습니다. 다시 시도해주세요.</p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isFetching || isPaused}
                onClick={() =>
                  void (isFetchNextPageError
                    ? fetchNextPage({ cancelRefetch: false })
                    : refetch())
                }
              >
                다시 시도
              </Button>
            </div>
          ) : hasNextPage ? (
            <div className='mt-4 text-center'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isFetching || isPaused}
                onClick={() => void fetchNextPage({ cancelRefetch: false })}
              >
                {isFetchingNextPage ? (
                  <Loader2 className='size-4 animate-spin' aria-hidden='true' />
                ) : null}
                {isFetchingNextPage ? '불러오는 중...' : '내역 더 보기'}
              </Button>
            </div>
          ) : null}
          {data && histories.length > 0 ? (
            <p className='text-muted-foreground mt-4 text-center text-xs'>
              전체 {totalCount.toLocaleString()}건 중{' '}
              {histories.length.toLocaleString()}건
            </p>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
