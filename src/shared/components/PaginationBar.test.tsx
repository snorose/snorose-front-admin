import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { PaginationBar } from './PaginationBar';

describe('PaginationBar totalPage 우선 동작', () => {
  test('첫 번째 묶음에서는 이전 이동을 막는다', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationBar
        currentPage={1}
        onPageChange={onPageChange}
        totalPage={18}
      />
    );

    const previousLink = screen.getByRole('link', {
      name: 'Go to previous page',
    });
    expect(previousLink).toHaveClass('pointer-events-none');

    fireEvent.click(previousLink);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('11페이지에서는 11~20 묶음을 표시한다', () => {
    render(
      <PaginationBar currentPage={11} onPageChange={vi.fn()} totalPage={25} />
    );

    for (let page = 11; page <= 20; page += 1) {
      expect(
        screen.getByRole('link', { name: String(page) })
      ).toBeInTheDocument();
    }
    expect(screen.queryByRole('link', { name: '10' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '21' })).not.toBeInTheDocument();
  });

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

  test('페이지 번호와 이전·다음 묶음을 정확한 1 기반 페이지로 이동한다', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationBar
        currentPage={12}
        onPageChange={onPageChange}
        totalPage={25}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: '13' }));
    fireEvent.click(screen.getByRole('link', { name: 'Go to previous page' }));
    fireEvent.click(screen.getByRole('link', { name: 'Go to next page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 13);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 21);
  });

  test.each([0, 1])('totalPage=%s이면 1페이지만 표시한다', (totalPage) => {
    render(
      <PaginationBar
        currentPage={1}
        onPageChange={vi.fn()}
        totalPage={totalPage}
      />
    );

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '2' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to previous page' })
    ).toHaveClass('pointer-events-none');
    expect(screen.getByRole('link', { name: 'Go to next page' })).toHaveClass(
      'pointer-events-none'
    );
  });
});
