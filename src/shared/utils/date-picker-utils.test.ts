import { describe, expect, test } from 'vitest';

import {
  formatDateValue,
  parseDateValue,
  parseLocalDateTime,
} from './date-picker-utils';

describe('날짜 선택값 변환', () => {
  test.each(['2024-02-29', '2000-01-01', '2026-10-09', '2099-12-31'])(
    '%s를 같은 로컬 날짜로 파싱하고 변환한다',
    (value) => {
      const date = parseDateValue(value);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(Number(value.slice(0, 4)));
      expect(date?.getMonth()).toBe(Number(value.slice(5, 7)) - 1);
      expect(date?.getDate()).toBe(Number(value.slice(8, 10)));
      expect(date?.getHours()).toBe(0);
      expect(formatDateValue(date)).toBe(value);
    }
  );

  test.each([
    undefined,
    '',
    '2023-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-10',
    '2026-01-00',
    '2026-1-1',
    '2026-10-09T00:00',
    ' 2026-10-09',
    '0000-01-01',
  ])('잘못된 날짜(%s)를 선택값으로 사용하지 않는다', (value) =>
    expect(parseDateValue(value)).toBeUndefined()
  );

  test('빈 날짜와 유효하지 않은 Date는 형식 변환 중 오류를 내지 않는다', () => {
    expect(formatDateValue(undefined)).toBeUndefined();
    expect(formatDateValue(new Date('잘못된 날짜'))).toBeUndefined();
  });
});

describe('로컬 날짜·시간 파싱', () => {
  test.each([
    ['2026-10-09', '00:00'],
    ['2026-10-09T00:00', '00:00'],
    ['2026-10-09T23:59', '23:59'],
    ['2026-10-09T12:34:56', '12:34'],
    ['2026-10-09T12:34:56.123', '12:34'],
  ])('%s의 날짜와 분 단위 시간을 유지한다', (value, time) => {
    const result = parseLocalDateTime(value);
    expect(formatDateValue(result.date)).toBe('2026-10-09');
    expect(result.date?.getDate()).toBe(9);
    expect(result.time).toBe(time);
  });

  test.each([
    undefined,
    '',
    '잘못된 값',
    '2026-02-30T12:00',
    '2026-10-09T24:00',
    '2026-10-09T12:60',
    '2026-10-09T12:34:60',
    '2026-10-09T1:02',
    '2026-10-09T12:00Z',
    '2026-10-09T12:00+09:00',
  ])('잘못된 로컬 날짜·시간(%s)은 빈 날짜와 기본 시간으로 처리한다', (value) =>
    expect(parseLocalDateTime(value)).toEqual({
      date: undefined,
      time: '00:00',
    })
  );
});
