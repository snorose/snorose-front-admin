import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { PostFilterPanel } from './PostFilterPanel';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

describe('PostFilterPanel', () => {
  test('날짜 선택·해제 결과를 검색에 전달하고 전체 초기화한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <PostFilterPanel
        initialFilters={{ startDate: '2026-10-01', endDate: '2026-10-09' }}
        onFilterChange={onFilterChange}
      />
    );

    const startDate = screen.getByRole('button', { name: '시작일' });
    const endDate = screen.getByRole('button', { name: '종료일' });
    expect(screen.getByRole('button', { name: '초기화' })).toHaveAttribute(
      'data-variant',
      'outline'
    );
    expect(screen.getByRole('button', { name: '검색' })).toHaveAttribute(
      'data-variant',
      'default'
    );
    expect(startDate).toHaveTextContent('2026-10-01');
    expect(endDate).toHaveTextContent('2026-10-09');
    await user.click(startDate);
    await user.click(screen.getByRole('button', { name: /2026년 10월 2일/ }));
    await user.click(endDate);
    await user.click(screen.getByRole('button', { name: /2026년 10월 15일/ }));
    expect(onFilterChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      startDate: '2026-10-02',
      endDate: '2026-10-15',
    });

    await user.click(startDate);
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      startDate: undefined,
      endDate: '2026-10-15',
    });

    await user.click(screen.getByRole('button', { name: '초기화' }));
    expect(startDate).toHaveTextContent('시작일 선택');
    expect(endDate).toHaveTextContent('종료일 선택');
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  test('검색 범위 변경에 따라 게시글 검색 placeholder가 유지된다', async () => {
    const user = userEvent.setup();

    render(<PostFilterPanel onFilterChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('검색어 입력...')).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', { name: '게시글 검색 범위' })
    );
    await user.click(screen.getByRole('option', { name: '제목' }));

    expect(screen.getByPlaceholderText('검색어 입력...')).toBeInTheDocument();
  });

  test('정렬·의심 키워드 선택값을 기존 검색 파라미터로 전달한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<PostFilterPanel onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '조회 수' }));
    await user.click(screen.getByRole('combobox', { name: '의심 키워드' }));
    await user.click(screen.getByRole('option', { name: '없음' }));
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onFilterChange).toHaveBeenCalledWith({
      sortTypes: 'VIEW_COUNT',
      sortDirection: 'DESC',
      isKeywordExist: false,
    });
  });

  test('전체 선택은 의심 키워드 필터를 해제한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <PostFilterPanel
        initialFilters={{ isKeywordExist: true }}
        onFilterChange={onFilterChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: '의심 키워드' }));
    await user.click(screen.getByRole('option', { name: '전체' }));
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onFilterChange).toHaveBeenCalledWith({
      isKeywordExist: undefined,
    });
  });
});
