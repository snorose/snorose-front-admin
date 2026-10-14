import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useStableTotalCount } from './useStableTotalCount';

describe('목록 건수 유지', () => {
  test('페이지 조회 중에는 기존 건수를 유지하고 응답의 변경된 건수와 0건을 반영한다', () => {
    const { result, rerender } = renderHook(
      ({ count, keyword }: { count: number | undefined; keyword: string }) =>
        useStableTotalCount(count, { keyword }),
      { initialProps: { count: 12 as number | undefined, keyword: '' } }
    );
    rerender({ count: undefined, keyword: '' });
    expect(result.current).toBe(12);
    rerender({ count: 11, keyword: '' });
    expect(result.current).toBe(11);
    rerender({ count: undefined, keyword: '검색' });
    expect(result.current).toBeUndefined();
    rerender({ count: 0, keyword: '검색' });
    expect(result.current).toBe(0);
    rerender({ count: undefined, keyword: '검색' });
    expect(result.current).toBe(0);
  });
});
