import { useState } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Label } from '@/shared/components/ui';

import { DatePicker } from './DatePicker';

function ControlledDatePicker({ initialValue = '2026-10-09' }) {
  const [value, setValue] = useState<string | undefined>(initialValue);

  return (
    <>
      <Label htmlFor='date'>작성일</Label>
      <DatePicker id='date' value={value} onValueChange={setValue} />
    </>
  );
}

describe('DatePicker', () => {
  test('날짜 영역 클릭으로 달력을 열고 선택한 날짜를 표시한 뒤 닫는다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);

    const trigger = screen.getByRole('button', { name: '작성일' });
    await user.click(screen.getByText('2026-10-09'));
    expect(
      screen.getByRole('grid', { name: '2026년 10월' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /2026년 10월 9일.*선택됨/ })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /2026년 10월 15일/ }));

    expect(trigger).toHaveTextContent('2026-10-15');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('날짜를 해제하면 기본 placeholder를 표시한다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);

    const trigger = screen.getByRole('button', { name: '작성일' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));

    expect(trigger).toHaveTextContent('날짜 선택');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('월을 이동한 후 다시 열면 선택한 날짜의 월을 표시한다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);

    const trigger = screen.getByRole('button', { name: '작성일' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '다음 달로 이동' }));
    expect(
      screen.getByRole('grid', { name: '2026년 11월' })
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(trigger);

    expect(
      screen.getByRole('grid', { name: '2026년 10월' })
    ).toBeInTheDocument();
  });

  test('키보드로 열고 날짜를 이동·선택하며 Escape로 닫는다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);

    const trigger = screen.getByRole('button', { name: '작성일' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /2026년 10월 9일.*선택됨/ })
      ).toHaveFocus()
    );
    await user.keyboard('{ArrowRight}{Enter}');
    expect(trigger).toHaveTextContent('2026-10-10');
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.keyboard(' ');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test.each([undefined, '', '잘못된 값', '2026-02-30', '2026-1-1'])(
    '빈 값 또는 잘못된 초기값(%s)은 placeholder를 표시하고 안전하게 열린다',
    async (value) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <DatePicker
          id='date'
          value={value}
          onValueChange={onValueChange}
          placeholder='시작일 선택'
        />
      );

      await user.click(screen.getByRole('button', { name: '시작일 선택' }));

      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(onValueChange).not.toHaveBeenCalled();
    }
  );

  test('부모가 값을 초기화하면 표시값도 초기화된다', async () => {
    const { rerender } = render(
      <DatePicker id='date' value='2026-10-09' onValueChange={vi.fn()} />
    );
    expect(screen.getByRole('button')).toHaveTextContent('2026-10-09');

    rerender(
      <DatePicker id='date' value={undefined} onValueChange={vi.fn()} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('날짜 선택');
  });

  test('비활성화한 선택칸은 클릭해도 열리지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        id='date'
        value={undefined}
        onValueChange={vi.fn()}
        disabled
      />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
