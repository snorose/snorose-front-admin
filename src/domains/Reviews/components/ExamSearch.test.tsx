import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import ExamSearch from './ExamSearch';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});
beforeEach(() => vi.clearAllMocks());

describe('시험후기 날짜 검색', () => {
  test('초기 날짜를 표시하고 검색 버튼을 누를 때 기존 문자열과 필터를 전달한다', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ExamSearch
        onSearchChange={onSearchChange}
        initialStartDate='2026-10-09'
        initialEndDate='2026-10-17'
        initialKeywordAuthor=' 작성자 '
        initialKeywordPost=' 후기 '
        initialSort='REPORT'
        initialIsConfirmed={false}
        initialIsDiscussed={true}
        initialIsReported
      />
    );
    expect(
      screen.getByRole('button', { name: '검색 시작일' })
    ).toHaveTextContent('2026-10-09');
    expect(
      screen.getByRole('button', { name: '검색 종료일' })
    ).toHaveTextContent('2026-10-17');
    expect(onSearchChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearchChange).toHaveBeenCalledExactlyOnceWith({
      startDate: '2026-10-09',
      endDate: '2026-10-17',
      keywordAuthor: '작성자',
      keywordPost: '후기',
      sort: 'REPORT',
      isConfirmed: false,
      isDiscussed: true,
      isReported: true,
    });
  });

  test('시작일의 최대 경계를 포함하고 날짜 선택만으로 검색하지 않는다', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ExamSearch
        onSearchChange={onSearchChange}
        initialStartDate='2026-10-09'
        initialEndDate='2026-10-17'
      />
    );
    await user.click(screen.getByRole('button', { name: '검색 시작일' }));
    expect(
      screen.getByRole('button', { name: /2026년 10월 18일/ })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /2026년 10월 17일/ })
    ).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /2026년 10월 17일/ }));
    expect(onSearchChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearchChange).toHaveBeenCalledWith({
      startDate: '2026-10-17',
      endDate: '2026-10-17',
    });
  });

  test('종료일의 최소 경계를 포함하고 같은 날짜도 검색할 수 있다', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ExamSearch
        onSearchChange={onSearchChange}
        initialStartDate='2026-10-09'
        initialEndDate='2026-10-17'
      />
    );
    await user.click(screen.getByRole('button', { name: '검색 종료일' }));
    expect(
      screen.getByRole('button', { name: /2026년 10월 8일/ })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /2026년 10월 9일/ }));
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearchChange).toHaveBeenCalledWith({
      startDate: '2026-10-09',
      endDate: '2026-10-09',
    });
  });

  test('날짜를 해제하면 검색값에서 생략하고 전체 초기화는 빈 필터를 전달한다', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ExamSearch
        onSearchChange={onSearchChange}
        initialStartDate='2026-10-09'
        initialEndDate='2026-10-17'
        initialKeywordPost='후기'
      />
    );
    await user.click(screen.getByRole('button', { name: '검색 시작일' }));
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    expect(
      screen.getByRole('button', { name: '검색 시작일' })
    ).toHaveTextContent('시작일 선택');
    expect(onSearchChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearchChange).toHaveBeenLastCalledWith({
      endDate: '2026-10-17',
      keywordPost: '후기',
    });
    await user.click(screen.getByRole('button', { name: '검색 옵션 초기화' }));
    expect(onSearchChange).toHaveBeenLastCalledWith({});
    expect(
      screen.getByRole('button', { name: '검색 종료일' })
    ).toHaveTextContent('종료일 선택');
    expect(
      screen.getByRole('textbox', { name: '시험후기명 또는 postId 검색' })
    ).toHaveValue('');
  });

  test('역전된 초기 기간도 검색 시 기존 검증으로 거부한다', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ExamSearch
        onSearchChange={onSearchChange}
        initialStartDate='2026-10-17'
        initialEndDate='2026-10-09'
      />
    );
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(toast.error).toHaveBeenCalledWith(
      '시작일은 종료일보다 늦을 수 없습니다.'
    );
    expect(onSearchChange).not.toHaveBeenCalled();
  });
});
