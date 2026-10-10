import type { UIEvent } from 'react';

import { ArrowUpRight, Copy, History, Loader2, WifiOff } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import PointHistoryCard from '@/domains/MemberInfo/components/point-history/PointHistoryCard';
import { useMemberPointHistory } from '@/domains/MemberInfo/hooks/useMemberPointHistory';

type MemberPointHistoryDialogProps = {
  member: MemberInfo;
  onCopy: (value: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function MemberPointHistoryDialog({
  member,
  onCopy,
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
      <Dialog.Content className='flex max-h-[calc(100dvh-4rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl'>
        <Dialog.Header className='gap-3 px-5 pt-7 pb-7 text-left sm:px-8 sm:pt-8'>
          <Dialog.Title className='flex items-center gap-3 pr-6 text-xl font-bold text-zinc-950 sm:text-2xl'>
            <History className='size-6 shrink-0' aria-hidden='true' />
            포인트 증감 히스토리
          </Dialog.Title>
          <Dialog.Description className='text-sm text-zinc-500 sm:text-base'>
            {member.userName}({member.studentNumber})의 전체 포인트 증감 내역을
            확인할 수 있습니다.
          </Dialog.Description>
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500'>
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
          className='min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-7 sm:px-8'
          onScroll={handleScroll}
          aria-label='포인트 증감 내역'
          aria-busy={isFetching || isPending}
        >
          {isPaused ? (
            <div
              role='status'
              className='mb-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-8 text-sm text-slate-500'
            >
              <WifiOff className='size-4 shrink-0' aria-hidden='true' />
              네트워크 연결을 기다리고 있습니다.
            </div>
          ) : null}
          {isPending && !isPaused ? (
            <div
              role='status'
              className='flex items-center justify-center gap-2 py-16 text-sm text-slate-500'
            >
              <Loader2 className='size-4 animate-spin' aria-hidden='true' />
              포인트 내역을 불러오는 중입니다.
            </div>
          ) : histories.length > 0 ? (
            <ol className='ml-2 space-y-7 border-l-2 border-[#ecebf0] pl-6 sm:ml-3 sm:pl-7'>
              {histories.map((history) => (
                <PointHistoryCard
                  key={history.id}
                  history={history}
                  onCopy={onCopy}
                />
              ))}
            </ol>
          ) : !isError && !isPending ? (
            <p className='rounded-2xl bg-slate-50 px-5 py-16 text-center text-sm text-slate-500'>
              포인트 증감 내역이 없습니다.
            </p>
          ) : null}

          {isError ? (
            <div
              role='alert'
              className='mt-5 space-y-3 rounded-xl bg-rose-50 p-5 text-center text-sm text-rose-700'
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
            <div className='mt-6 text-center'>
              <Button
                type='button'
                variant='outline'
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
            <p className='mt-4 text-center text-xs text-slate-500'>
              전체 {totalCount.toLocaleString()}건 중{' '}
              {histories.length.toLocaleString()}건
            </p>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
