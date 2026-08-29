import { describe, expect, test } from 'vitest';

import {
  formatDateOnly,
  formatDateTimeToSeconds,
  toDateTimeInputValue,
} from './date-time-formatter';

describe('formatDateOnly', () => {
  test.each([
    ['2024-01-01 12:00:00', '2024-01-01'],
    ['2024-01-01T12:00:00', '2024-01-01'],
    [null, '-'],
    [undefined, '-'],
    ['', '-'],
  ])('%s를 날짜만 표시한다', (value, expected) => {
    expect(formatDateOnly(value)).toBe(expected);
  });
});

describe('formatDateTimeToSeconds', () => {
  test.each([
    ['2024-01-01 12:00:00', '2024-01-01 12:00:00'],
    ['2024-01-01T12:00:00', '2024-01-01 12:00:00'],
    ['2024-01-01T12:00:00.000', '2024-01-01 12:00:00'],
    [null, '-'],
    [undefined, '-'],
    ['', '-'],
  ])('%s를 초 단위까지 표시한다', (value, expected) => {
    expect(formatDateTimeToSeconds(value)).toBe(expected);
  });
});

describe('toDateTimeInputValue', () => {
  test.each([
    ['2024-01-01 12:00:00', '2024-01-01T12:00'],
    ['2024-01-01T12:00:00', '2024-01-01T12:00'],
    [null, ''],
    [undefined, ''],
    ['', ''],
  ])('%s를 datetime-local input 값으로 변환한다', (value, expected) => {
    expect(toDateTimeInputValue(value)).toBe(expected);
  });
});
