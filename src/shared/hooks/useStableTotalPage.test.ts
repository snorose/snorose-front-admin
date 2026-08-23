import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useStableTotalPage } from './useStableTotalPage';

describe('useStableTotalPage', () => {
  test('새 페이지를 불러오는 동안 마지막 totalPage를 유지한다', () => {
    const { result, rerender } = renderHook(
      ({ totalPage, currentPage }: Props) =>
        useStableTotalPage(totalPage, currentPage),
      {
        initialProps: {
          totalPage: 18,
          currentPage: 13,
        } as Props,
      }
    );

    expect(result.current).toBe(18);

    rerender({ totalPage: undefined, currentPage: 14 });
    expect(result.current).toBe(18);

    rerender({ totalPage: 20, currentPage: 14 });
    expect(result.current).toBe(20);
  });

  test('아직 응답받은 값이 없으면 현재 페이지를 사용한다', () => {
    const { result } = renderHook(() => useStableTotalPage(undefined, 1));

    expect(result.current).toBe(1);
  });
});

interface Props {
  totalPage: number | undefined;
  currentPage: number;
}
