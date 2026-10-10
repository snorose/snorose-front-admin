export interface ResultCountProps {
  totalCount: number | undefined;
  status: 'loading' | 'ready' | 'error';
}

export function ResultCount({ totalCount, status }: ResultCountProps) {
  return (
    <span
      role='status'
      aria-atomic='true'
      className='text-muted-foreground text-sm whitespace-nowrap'
    >
      {status === 'error' ? (
        '개수 확인 불가'
      ) : status === 'loading' ? (
        '조회 중…'
      ) : (
        <>
          총{' '}
          <span className='text-foreground font-semibold tabular-nums'>
            {totalCount === undefined
              ? '-'
              : totalCount.toLocaleString('ko-KR')}
          </span>
          건
        </>
      )}
    </span>
  );
}
