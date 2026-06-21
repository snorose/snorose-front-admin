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

  test('미지급 일정 목록에서 기간 상태 배지를 보여준다', () => {
    render(
      <PointFreezeListSection
        pointFreezes={[
          {
            id: 1,
            title: '정산 점검',
            startAt: '2026-01-15 00:00:00',
            endAt: '2026-01-16 00:00:00',
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

    const row = screen.getByText('정산 점검').closest('tr');

    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('진행중')).toBeInTheDocument();
  });
});
