import { format, isValid, parse } from 'date-fns';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})(?:T([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?)?$/;

/** 날짜 선택값을 시간대 변환 없이 로컬 날짜로 파싱한다. */
export function parseDateValue(value: string | undefined): Date | undefined {
  if (!value || !DATE_PATTERN.test(value)) return undefined;

  const date = parse(value, 'yyyy-MM-dd', new Date());
  return formatDateValue(date) === value ? date : undefined;
}

/** 유효한 로컬 날짜만 yyyy-MM-dd로 반환한다. */
export function formatDateValue(date: Date | undefined): string | undefined {
  if (!date || !isValid(date)) return undefined;

  const value = format(date, 'yyyy-MM-dd');
  return DATE_PATTERN.test(value) && date.getFullYear() > 0 ? value : undefined;
}

/** 로컬 날짜·시간 입력을 날짜와 분 단위 시간으로 분리한다. */
export function parseLocalDateTime(value: string | undefined): {
  date: Date | undefined;
  time: string;
} {
  const match = value?.match(DATE_TIME_PATTERN);
  const date = parseDateValue(match?.[1]);

  if (!date) return { date: undefined, time: '00:00' };

  return {
    date,
    time: match?.[2] ? `${match[2]}:${match[3]}` : '00:00',
  };
}
