import { describe, expect, test } from 'vitest';

import { clampOneBasedPage, parseOneBasedPage } from './urlParamUtils';

describe('parseOneBasedPage', () => {
  test.each([
    [null, 1],
    ['', 1],
    ['0', 1],
    ['-1', 1],
    ['abc', 1],
    ['2abc', 1],
    ['1.5', 1],
    ['1', 1],
    ['2', 2],
  ])('%s를 %s페이지로 변환한다', (value, expected) => {
    expect(parseOneBasedPage(value)).toBe(expected);
  });
});

describe('clampOneBasedPage', () => {
  test('전체 페이지보다 큰 페이지는 마지막 페이지로 보정한다', () => {
    expect(clampOneBasedPage(999, 5)).toBe(5);
  });

  test('결과가 없으면 1페이지로 보정한다', () => {
    expect(clampOneBasedPage(2, 0)).toBe(1);
  });

  test('1보다 작은 페이지는 1페이지로 보정한다', () => {
    expect(clampOneBasedPage(0, 5)).toBe(1);
  });

  test('유효한 페이지는 그대로 유지한다', () => {
    expect(clampOneBasedPage(3, 5)).toBe(3);
  });
});
