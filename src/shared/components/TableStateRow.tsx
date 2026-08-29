import type { ReactNode } from 'react';

import { CircleAlert, Inbox, Loader2 } from 'lucide-react';

import { Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

export type TableState = 'loading' | 'empty' | 'error';

interface TableStateRowProps {
  state: TableState;
  colSpan: number;
  message?: ReactNode;
}

const DEFAULT_MESSAGES: Record<TableState, string> = {
  loading: '데이터를 불러오는 중입니다.',
  empty: '표시할 데이터가 없습니다.',
  error: '데이터를 불러오지 못했습니다.',
};

const STATE_CLASS_NAMES: Record<TableState, string> = {
  loading: 'text-slate-500',
  empty: 'text-slate-400',
  error: 'text-rose-600',
};

function TableStateIcon({ state }: Pick<TableStateRowProps, 'state'>) {
  const className = cn(
    'h-5 w-5 shrink-0',
    state === 'loading' && 'animate-spin text-blue-600'
  );

  if (state === 'loading') {
    return <Loader2 aria-hidden='true' className={className} />;
  }

  if (state === 'error') {
    return <CircleAlert aria-hidden='true' className={className} />;
  }

  return <Inbox aria-hidden='true' className={className} />;
}

/** 테이블의 로딩, 빈 결과, 오류 상태를 한 행으로 표시합니다. */
export function TableStateRow({
  state,
  colSpan,
  message = DEFAULT_MESSAGES[state],
}: TableStateRowProps) {
  return (
    <Table.Row className='hover:bg-transparent'>
      <Table.Cell colSpan={colSpan} className='h-48 text-center'>
        <div
          role={state === 'error' ? 'alert' : 'status'}
          aria-busy={state === 'loading' ? 'true' : undefined}
          className={cn(
            'flex items-center justify-center gap-2 text-sm',
            STATE_CLASS_NAMES[state]
          )}
        >
          <TableStateIcon state={state} />
          <span>{message}</span>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
