import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { type TableState, TableStateRow } from './TableStateRow';

function renderTableStateRow({
  state,
  colSpan = 8,
  message,
}: {
  state: TableState;
  colSpan?: number;
  message?: ReactNode;
}) {
  return render(
    <table>
      <tbody>
        <TableStateRow state={state} colSpan={colSpan} message={message} />
      </tbody>
    </table>
  );
}

describe('TableStateRow', () => {
  test.each([
    ['loading', '데이터를 불러오는 중입니다.'],
    ['empty', '표시할 데이터가 없습니다.'],
    ['error', '데이터를 불러오지 못했습니다.'],
  ] as const)(
    '$state 상태의 기본 문구와 아이콘을 표시한다',
    (state, message) => {
      const { container } = renderTableStateRow({ state });

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(container.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    }
  );

  test('열 개수와 사용자 지정 문구를 적용한다', () => {
    renderTableStateRow({
      state: 'empty',
      colSpan: 12,
      message: '조건에 맞는 댓글이 없습니다.',
    });

    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '12');
    expect(
      screen.getByText('조건에 맞는 댓글이 없습니다.')
    ).toBeInTheDocument();
  });

  test('로딩 상태를 진행 중인 상태로 표시한다', () => {
    renderTableStateRow({ state: 'loading' });

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  test('오류 상태를 긴급 알림으로 표시한다', () => {
    renderTableStateRow({ state: 'error' });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
