import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { BOARD_OPTIONS } from '@/shared/utils';

import { PostFilterPanel } from './PostFilterPanel';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

describe('PostFilterPanel', () => {
  test('게시판을 숫자 단일 값으로 전달하고 전체 선택으로 조건을 해제한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <PostFilterPanel
        initialFilters={{ boardId: BOARD_OPTIONS[0].value }}
        onFilterChange={onFilterChange}
      />
    );
    const board = screen.getByRole('combobox', { name: '게시판' });
    expect(board).toHaveTextContent(BOARD_OPTIONS[0].label);
    await user.click(board);
    await user.click(
      screen.getByRole('option', { name: BOARD_OPTIONS[1].label })
    );
    expect(onFilterChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      boardId: BOARD_OPTIONS[1].value,
    });
    await user.click(board);
    await user.click(screen.getByRole('option', { name: '전체' }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({ boardId: undefined });
  });

  test('관리 상태를 복수 선택하고 마지막 해제 시 조건을 생략한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<PostFilterPanel onFilterChange={onFilterChange} />);
    const status = screen.getByRole('button', { name: '관리 상태' });
    await user.click(status);
    await user.click(screen.getByRole('menuitemcheckbox', { name: '노출' }));
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: '어드민 비공개' })
    );
    expect(onFilterChange).not.toHaveBeenCalled();
    expect(status).toHaveTextContent('관리 상태 2개');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      adminCommonStatuses: ['VISIBLE', 'ADMIN_HIDDEN'],
    });
    await user.click(status);
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: '어드민 비공개' })
    );
    await user.click(screen.getByRole('menuitemcheckbox', { name: '노출' }));
    await user.keyboard('{Escape}');
    expect(status).toHaveTextContent('전체');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      adminCommonStatuses: undefined,
    });
  });

  test.each(['게시글 검색', '게시자 검색 (아이디/닉네임/학번)'])(
    '%s의 Enter는 현재 조건을 검색하고 한글 조합 Enter는 무시한다',
    async (name) => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const initialFilters = {
        encryptedUserId: 'user-id',
        isVisible: false,
        isKeywordExist: false,
        isNotice: true,
      };
      render(
        <PostFilterPanel
          initialFilters={initialFilters}
          onFilterChange={onFilterChange}
        />
      );
      const input = screen.getByRole('textbox', { name });
      await user.type(input, '검색어');
      fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
      expect(onFilterChange).not.toHaveBeenCalled();
      await user.keyboard('{Enter}');
      expect(onFilterChange).toHaveBeenCalledExactlyOnceWith({
        ...initialFilters,
        [name === '게시글 검색' ? 'keywordPost' : 'keywordAuthor']: '검색어',
      });
      await user.click(
        screen.getByRole('button', { name: '검색 조건 초기화' })
      );
      expect(onFilterChange).toHaveBeenLastCalledWith({});
      expect(input).toHaveValue('');
      expect(
        screen.getByRole('checkbox', { name: '공지만 보기' })
      ).not.toBeChecked();
    }
  );

  test('날짜 선택·해제 결과를 검색에 전달하고 전체 초기화한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <PostFilterPanel
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

    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
    expect(startDate).toHaveTextContent('시작일');
    expect(endDate).toHaveTextContent('종료일');
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  test('검색 범위 변경에 따라 게시글 검색 placeholder가 유지된다', async () => {
    const user = userEvent.setup();

    render(<PostFilterPanel onFilterChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('게시글 검색어')).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', { name: '게시글 검색 범위' })
    );
    await user.click(screen.getByRole('option', { name: '제목' }));

    expect(screen.getByPlaceholderText('게시글 검색어')).toBeInTheDocument();
  });

  test('정렬·의심 키워드 선택값을 기존 검색 파라미터로 전달한다', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<PostFilterPanel onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole('combobox', { name: '정렬' }));
    await user.click(screen.getByRole('option', { name: '조회 수' }));
    await user.click(screen.getByRole('combobox', { name: '의심 키워드' }));
    await user.click(screen.getByRole('option', { name: '의심 키워드 없음' }));
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
