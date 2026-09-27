import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { CommentFilterPanel } from './CommentFilterPanel';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

describe('CommentFilterPanel', () => {
  test('검색 범위 변경에 따라 댓글 검색 placeholder가 바뀐다', async () => {
    const user = userEvent.setup();

    render(<CommentFilterPanel onFilterChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('검색어 입력...')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: '댓글 검색 범위' }));
    await user.click(screen.getByRole('option', { name: '댓글 ID' }));

    expect(screen.getByPlaceholderText('댓글 ID (숫자만)')).toBeInTheDocument();
  });

  test('정렬·의심 키워드 선택값을 기존 검색 파라미터로 전달한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<CommentFilterPanel onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '신고 수' }));
    await user.click(screen.getByRole('combobox', { name: '의심 키워드' }));
    await user.click(screen.getByRole('option', { name: '있음' }));
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onFilterChange).toHaveBeenCalledWith({
      searchScope: 'CONTENT',
      sortTypes: ['REPORT_COUNT'],
      sortDirection: 'DESC',
      isKeywordExist: true,
    });
  });

  test('전체 선택은 의심 키워드 필터를 해제한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <CommentFilterPanel
        initialFilters={{ isKeywordExist: true }}
        onFilterChange={onFilterChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: '의심 키워드' }));
    await user.click(screen.getByRole('option', { name: '전체' }));
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onFilterChange).toHaveBeenCalledWith({
      searchScope: 'CONTENT',
      isKeywordExist: undefined,
    });
  });

  test('정렬 Select를 키보드로 열고 옵션을 선택한 뒤 닫을 수 있다', async () => {
    const user = userEvent.setup();

    render(<CommentFilterPanel onFilterChange={vi.fn()} />);

    const sortSelect = screen.getByRole('combobox', { name: '정렬' });
    await user.click(sortSelect);
    await user.keyboard('{ARROWDOWN}{ARROWDOWN}{ENTER}');

    expect(sortSelect).toHaveTextContent('신고 수');
    expect(
      screen.queryByRole('option', { name: '신고 수' })
    ).not.toBeInTheDocument();
  });
});
