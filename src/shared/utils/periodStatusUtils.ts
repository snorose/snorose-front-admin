export type PeriodStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'ENDED';

function parseDateTime(value: string): Date {
  return new Date(value.replace(' ', 'T'));
}

export function getPeriodStatus(
  startAt: string,
  endAt: string,
  now = new Date()
): PeriodStatus {
  const startDate = parseDateTime(startAt);
  const endDate = parseDateTime(endAt);

  if (now < startDate) {
    return 'SCHEDULED';
  }

  if (now > endDate) {
    return 'ENDED';
  }

  return 'IN_PROGRESS';
}
