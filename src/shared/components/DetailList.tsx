import type { ReactNode } from 'react';

export type DetailListItem = {
  label: string;
  value: ReactNode;
};

/** 확인 화면의 항목명·값을 표시한다. 값의 포맷과 강조는 호출부에서 정한다. */
export function DetailList({ items }: { items: DetailListItem[] }) {
  return (
    <dl className='min-w-0 space-y-3 text-sm'>
      {items.map(({ label, value }) => (
        <div
          key={label}
          className='grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2'
        >
          <dt className='font-semibold text-gray-700'>{label}:</dt>
          <dd className='min-w-0 wrap-anywhere whitespace-pre-wrap'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
