import { describe, expect, test } from 'vitest';

import { getPeriodStatus } from './periodStatusUtils';

describe('getPeriodStatus', () => {
  const startAt = '2026-01-15 10:00:00';
  const endAt = '2026-01-15 20:00:00';

  test.each([
    {
      now: new Date('2026-01-15T09:59:59'),
      expected: 'SCHEDULED',
    },
    {
      now: new Date('2026-01-15T10:00:00'),
      expected: 'IN_PROGRESS',
    },
    {
      now: new Date('2026-01-15T20:00:00'),
      expected: 'IN_PROGRESS',
    },
    {
      now: new Date('2026-01-15T20:00:01'),
      expected: 'ENDED',
    },
  ] as const)('$expected 상태를 반환한다', ({ now, expected }) => {
    expect(getPeriodStatus(startAt, endAt, now)).toBe(expected);
  });
});
