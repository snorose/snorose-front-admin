import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { PaginationBar } from './PaginationBar';

describe('PaginationBar totalPage 우선 동작', () => {
  test('마지막 묶음에서는 totalPage를 넘는 번호를 표시하지 않는다', () => {
    render(
      <PaginationBar currentPage={11} onPageChange={vi.fn()} totalPage={13} />
    );

    expect(screen.getByRole('link', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '13' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '14' })).not.toBeInTheDocument();
  });

  test('totalPage가 현재 묶음의 끝이면 다음 이동을 막는다', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationBar
        currentPage={11}
        onPageChange={onPageChange}
        totalPage={20}
      />
    );

    const nextLink = screen.getByRole('link', { name: 'Go to next page' });
    expect(nextLink).toHaveClass('pointer-events-none');

    fireEvent.click(nextLink);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('totalPage에 다음 묶음이 있으면 이동할 수 있다', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationBar
        currentPage={11}
        onPageChange={onPageChange}
        totalPage={21}
      />
    );

    const nextLink = screen.getByRole('link', { name: 'Go to next page' });
    expect(nextLink).not.toHaveClass('pointer-events-none');

    fireEvent.click(nextLink);
    expect(onPageChange).toHaveBeenCalledWith(21);
  });
});
