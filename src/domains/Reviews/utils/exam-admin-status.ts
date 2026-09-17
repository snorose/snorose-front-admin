import type {
  ExamReviewAdminStatusManager,
  ExamReviewAdminStatusPeriod,
} from '@/domains/Reviews/types';

const toTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortAdminStatusPeriods = (
  periods: ExamReviewAdminStatusPeriod[]
) =>
  [...periods].sort((a, b) => toTimestamp(b.startAt) - toTimestamp(a.startAt));

export const getDefaultAdminStatusPeriod = (
  periods: ExamReviewAdminStatusPeriod[],
  now = new Date()
) => {
  const nowTimestamp = now.getTime();

  const activePeriods = periods
    .filter(
      (period) =>
        toTimestamp(period.startAt) <= nowTimestamp &&
        nowTimestamp <= toTimestamp(period.endAt)
    )
    .sort((a, b) => toTimestamp(b.startAt) - toTimestamp(a.startAt));

  if (activePeriods[0]) return activePeriods[0];

  const endedPeriods = periods
    .filter((period) => toTimestamp(period.endAt) < nowTimestamp)
    .sort((a, b) => toTimestamp(b.endAt) - toTimestamp(a.endAt));

  if (endedPeriods[0]) return endedPeriods[0];

  return periods
    .filter((period) => toTimestamp(period.startAt) > nowTimestamp)
    .sort((a, b) => toTimestamp(a.startAt) - toTimestamp(b.startAt))[0];
};

export const getExamReviewCompletionRate = (
  confirmedCount: number,
  totalCount: number
) => {
  if (!Number.isFinite(totalCount) || totalCount <= 0) return 0;

  const safeConfirmedCount = Number.isFinite(confirmedCount)
    ? Math.max(0, confirmedCount)
    : 0;
  const rate = Math.round((safeConfirmedCount / totalCount) * 100);

  return Math.min(100, Math.max(0, rate));
};

export const getAverageProcessedCount = (
  managers: ExamReviewAdminStatusManager[]
) => {
  if (managers.length === 0) return null;

  const processedCount = managers.reduce(
    (total, manager) =>
      total +
      (Number.isFinite(manager.processedCount)
        ? Math.max(0, manager.processedCount)
        : 0),
    0
  );

  return Math.ceil(processedCount / managers.length);
};
