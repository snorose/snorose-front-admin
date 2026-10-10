import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { BOARD_OPTIONS } from '@/shared/utils';

import { CommentFilterPanel } from './CommentFilterPanel';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

describe('CommentFilterPanel', () => {
  test('게시판·상태를 복수 선택하고 선택 해제 시 조건을 생략한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<CommentFilterPanel onFilterChange={onFilterChange} />);
    const board = screen.getByRole('button', { name: '게시판' });
    await user.click(board);
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: BOARD_OPTIONS[0].label })
    );
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: BOARD_OPTIONS[1].label })
    );
    expect(board).toHaveTextContent('게시판 2개');
    await user.keyboard('{Escape}');
    const status = screen.getByRole('button', { name: '관리 상태' });
    await user.click(status);
    await user.click(screen.getByRole('menuitemcheckbox', { name: '노출' }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: '징계' }));
    expect(onFilterChange).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      searchScope: 'CONTENT',
      boardIds: [BOARD_OPTIONS[0].value, BOARD_OPTIONS[1].value],
      adminCommonStatuses: ['VISIBLE', 'SANCTIONED'],
    });
    await user.click(board);
    await user.click(screen.getByRole('menuitem', { name: '선택 해제' }));
    await user.keyboard('{Escape}');
    await user.click(status);
    await user.click(screen.getByRole('menuitem', { name: '선택 해제' }));
    await user.keyboard('{Escape}');
    expect(board).toHaveTextContent('전체');
    expect(status).toHaveTextContent('전체');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      searchScope: 'CONTENT',
      boardIds: undefined,
      adminCommonStatuses: undefined,
    });
  });

  test('게시판의 마지막 선택을 해제하면 undefined를 전달한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <CommentFilterPanel
        initialFilters={{ boardIds: [BOARD_OPTIONS[0].value] }}
        onFilterChange={onFilterChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '게시판' }));
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: BOARD_OPTIONS[0].label })
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenCalledWith({
      searchScope: 'CONTENT',
      boardIds: undefined,
    });
  });

  test.each(['댓글 검색', '게시자 검색 (아이디/닉네임/학번)'])(
    '%s의 Enter는 다중 정렬·숨은 조건을 보존하고 한글 조합 Enter는 무시한다',
    async (name) => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const initialFilters = {
        sortTypes: ['REPORT_COUNT', 'LIKE_COUNT'] as const,
        sortDirection: 'DESC' as const,
        isReported: false,
        isKeywordExist: false,
      };
      render(
        <CommentFilterPanel
          initialFilters={{
            ...initialFilters,
            sortTypes: [...initialFilters.sortTypes],
          }}
          onFilterChange={onFilterChange}
        />
      );
      const input = screen.getByRole('textbox', { name });
      await user.type(input, '검색어');
      fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
      expect(onFilterChange).not.toHaveBeenCalled();
      await user.keyboard('{Enter}');
      expect(onFilterChange).toHaveBeenCalledExactlyOnceWith({
        searchScope: 'CONTENT',
        ...initialFilters,
        [name === '댓글 검색' ? 'searchQuery' : 'keywordAuthor']: '검색어',
      });
      await user.click(
        screen.getByRole('button', { name: '검색 조건 초기화' })
      );
      expect(onFilterChange).toHaveBeenLastCalledWith({
        searchScope: 'CONTENT',
      });
      expect(input).toHaveValue('');
    }
  );

  test('선택한 날짜와 기본 검색 범위를 전달하고 전체 초기화한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <CommentFilterPanel
        initialFilters={{ startDate: '2026-10-01', endDate: '2026-10-09' }}
        onFilterChange={onFilterChange}
      />
    );

    const startDate = screen.getByRole('button', { name: '작성 시작일' });
    const endDate = screen.getByRole('button', { name: '작성 종료일' });
    expect(screen.queryByText('작성일 기간')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '검색 조건 초기화' })
    ).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('button', { name: '검색' })).toHaveAttribute(
      'data-variant',
      'default'
    );
    await user.click(startDate);
    await user.click(screen.getByRole('button', { name: /2026년 10월 2일/ }));
    await user.click(endDate);
    await user.click(screen.getByRole('button', { name: /2026년 10월 15일/ }));
    expect(onFilterChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      searchScope: 'CONTENT',
      startDate: '2026-10-02',
      endDate: '2026-10-15',
    });

    await user.click(endDate);
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      searchScope: 'CONTENT',
      startDate: '2026-10-02',
      endDate: undefined,
    });

    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(startDate).toHaveTextContent('시작일');
    expect(endDate).toHaveTextContent('종료일');
    expect(onFilterChange).toHaveBeenLastCalledWith({ searchScope: 'CONTENT' });
  });

  test('검색 범위 변경에 따라 댓글 검색 placeholder가 바뀐다', async () => {
    const user = userEvent.setup();

    render(<CommentFilterPanel onFilterChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('댓글 검색어')).toBeInTheDocument();

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
    await user.click(screen.getByRole('option', { name: '의심 키워드 있음' }));
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
