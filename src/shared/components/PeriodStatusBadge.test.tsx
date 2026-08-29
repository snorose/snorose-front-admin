import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PeriodStatusBadge } from './PeriodStatusBadge';

describe('PeriodStatusBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('계산된 기간 상태를 공통 tone으로 표시한다', () => {
    render(
      <>
        <PeriodStatusBadge
          startAt='2026-01-16 00:00:00'
          endAt='2026-01-17 00:00:00'
        />
        <PeriodStatusBadge
          startAt='2026-01-15 00:00:00'
          endAt='2026-01-16 00:00:00'
        />
        <PeriodStatusBadge
          startAt='2026-01-13 00:00:00'
          endAt='2026-01-14 00:00:00'
        />
      </>
    );

    expect(screen.getByText('예정')).toHaveClass(
      'bg-amber-50',
      'text-amber-700'
    );
    expect(screen.getByText('진행중')).toHaveClass(
      'bg-emerald-50',
      'text-emerald-700'
    );
    expect(screen.getByText('종료')).toHaveClass(
      'bg-slate-50',
      'text-slate-700'
    );
  });
});
