import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { StatusBadge, type StatusBadgeTone } from './StatusBadge';

const TONE_CASES: Array<{
  tone: StatusBadgeTone;
  classNames: string[];
}> = [
  {
    tone: 'neutral',
    classNames: ['border-slate-200', 'bg-slate-50', 'text-slate-700'],
  },
  {
    tone: 'info',
    classNames: ['border-blue-200', 'bg-blue-50', 'text-blue-800'],
  },
  {
    tone: 'success',
    classNames: ['border-emerald-100', 'bg-emerald-50', 'text-emerald-700'],
  },
  {
    tone: 'warning',
    classNames: ['border-amber-100', 'bg-amber-50', 'text-amber-700'],
  },
  {
    tone: 'danger',
    classNames: ['border-rose-100', 'bg-rose-50', 'text-rose-700'],
  },
  {
    tone: 'accent',
    classNames: ['border-violet-100', 'bg-violet-50', 'text-violet-700'],
  },
  {
    tone: 'outline',
    classNames: ['border-slate-200', 'bg-white', 'text-slate-800'],
  },
];

describe('StatusBadge', () => {
  test('모든 상태 배지에 공통 형태를 적용한다', () => {
    render(<StatusBadge tone='neutral'>미확인</StatusBadge>);

    expect(screen.getByText('미확인')).toHaveClass(
      'rounded-full',
      'max-w-full',
      'truncate',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium'
    );
  });

  test.each(TONE_CASES)(
    '$tone tone 색상을 적용한다',
    ({ tone, classNames }) => {
      render(<StatusBadge tone={tone}>{tone}</StatusBadge>);

      expect(screen.getByText(tone)).toHaveClass(...classNames);
    }
  );
});
