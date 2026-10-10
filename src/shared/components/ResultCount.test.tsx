import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ResultCount } from './ResultCount';

describe('ResultCount', () => {
  test('건 단위와 천 단위 구분으로 총개수를 표시한다', () => {
    render(<ResultCount totalCount={1234} status='ready' />);

    expect(screen.getByRole('status')).toHaveTextContent('총 1,234건');
  });

  test('미조회 개수와 성공한 빈 결과를 구분한다', () => {
    const { rerender } = render(
      <ResultCount totalCount={undefined} status='ready' />
    );

    expect(screen.getByRole('status')).toHaveTextContent('총 -건');

    rerender(<ResultCount totalCount={0} status='ready' />);

    expect(screen.getByRole('status')).toHaveTextContent('총 0건');
  });

  test('상태 알림 영역을 유지하고 재조회와 오류에서 이전 숫자를 숨긴다', () => {
    const { rerender } = render(
      <ResultCount totalCount={1234} status='ready' />
    );
    const statusRegion = screen.getByRole('status');

    expect(statusRegion).toHaveAttribute('aria-atomic', 'true');

    rerender(<ResultCount totalCount={1234} status='loading' />);

    expect(screen.getByRole('status')).toBe(statusRegion);
    expect(statusRegion).toHaveTextContent('조회 중…');
    expect(statusRegion).not.toHaveTextContent('1,234');

    rerender(<ResultCount totalCount={1234} status='error' />);

    expect(screen.getByRole('status')).toBe(statusRegion);
    expect(statusRegion).toHaveTextContent('개수 확인 불가');
    expect(statusRegion).not.toHaveTextContent('1,234');

    rerender(<ResultCount totalCount={12} status='ready' />);

    expect(screen.getByRole('status')).toBe(statusRegion);
    expect(statusRegion).toHaveTextContent('총 12건');
  });
});
