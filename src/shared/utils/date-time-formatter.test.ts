import { describe, expect, test } from 'vitest';

import {
  formatDateOnly,
  formatDateTimeForAPI,
  formatDateTimeToMinutes,
  formatDateTimeToSeconds,
  formatDateTimeWithAmPm,
  formatDateTimeWithT,
  toDateTimeInputValue,
  toSpaceSeparatedDateTimeSeconds,
  toTSeparatedDateTimeSeconds,
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

describe('toSpaceSeparatedDateTimeSeconds', () => {
  test('datetime-local 값을 공백 구분 초 단위 문자열로 변환한다', () => {
    expect(toSpaceSeparatedDateTimeSeconds('2024-01-01T12:00')).toBe(
      '2024-01-01 12:00:00'
    );
  });
});

describe('toTSeparatedDateTimeSeconds', () => {
  test('datetime-local 값을 T 구분 초 단위 문자열로 변환한다', () => {
    expect(toTSeparatedDateTimeSeconds('2024-01-01T12:00')).toBe(
      '2024-01-01T12:00:00'
    );
  });
});

describe('deprecated API 전송용 formatter', () => {
  test('formatDateTimeForAPI는 공백 구분 초 단위 문자열로 변환한다', () => {
    expect(formatDateTimeForAPI('2024-01-01T12:00')).toBe(
      '2024-01-01 12:00:00'
    );
  });

  test('formatDateTimeWithT는 T 구분 초 단위 문자열로 변환한다', () => {
    expect(formatDateTimeWithT('2024-01-01T12:00')).toBe('2024-01-01T12:00:00');
  });
});

describe('formatDateTimeToMinutes', () => {
  test.each([
    ['2024-01-01 12:00:00', '2024-01-01 12:00'],
    ['2024-01-01T12:00:00', '2024-01-01 12:00'],
    [null, '-'],
    [undefined, '-'],
    ['', '-'],
  ])('%s를 분 단위까지 표시한다', (value, expected) => {
    expect(formatDateTimeToMinutes(value)).toBe(expected);
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

describe('formatDateTimeWithAmPm', () => {
  test.each([
    ['2024-01-01 00:00:00', '2024-01-01 오전 12:00'],
    ['2024-01-01 09:05:00', '2024-01-01 오전 9:05'],
    ['2024-01-01 12:00:00', '2024-01-01 오후 12:00'],
    ['2024-01-01 13:05:00', '2024-01-01 오후 1:05'],
    ['invalid-date', '-'],
    [null, '-'],
    [undefined, '-'],
    ['', '-'],
  ])('%s를 오전/오후 형식으로 표시한다', (value, expected) => {
    expect(formatDateTimeWithAmPm(value)).toBe(expected);
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
