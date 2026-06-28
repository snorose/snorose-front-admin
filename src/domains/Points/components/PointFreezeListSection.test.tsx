import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PointFreezeListSection } from './PointFreezeListSection';

describe('PointFreezeListSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('미지급 일정 목록에서 기간 상태 배지를 올바르게 보여준다', () => {
    render(
      <PointFreezeListSection
        pointFreezes={[
          {
            id: 1,
            title: '진행중 일정',
            startAt: '2026-01-15 00:00:00',
            endAt: '2026-01-16 00:00:00',
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00',
          },
          {
            id: 2,
            title: '예정된 일정',
            startAt: '2026-01-16 00:00:00',
            endAt: '2026-01-17 00:00:00',
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00',
          },
          {
            id: 3,
            title: '종료된 일정',
            startAt: '2026-01-13 00:00:00',
            endAt: '2026-01-14 00:00:00',
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00',
          },
        ]}
        getPointFreezes={vi.fn()}
      />
    );

    expect(
      screen.getByRole('columnheader', { name: '상태' })
    ).toBeInTheDocument();

    const inProgressRow = screen.getByText('진행중 일정').closest('tr')!;
    expect(within(inProgressRow).getByText('진행중')).toBeInTheDocument();

    const scheduledRow = screen.getByText('예정된 일정').closest('tr')!;
    expect(within(scheduledRow).getByText('예정')).toBeInTheDocument();

    const endedRow = screen.getByText('종료된 일정').closest('tr')!;
    expect(within(endedRow).getByText('종료')).toBeInTheDocument();
  });
});
