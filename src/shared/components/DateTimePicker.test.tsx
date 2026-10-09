import { useState } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { useDateTimeField } from '@/shared/hooks';
import { parseDateValue } from '@/shared/utils';

import { createExcelPointBulkRewardRequest } from '@/domains/Points/utils';

import { DateTimePicker } from './DateTimePicker';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

function ControlledPicker({ initialDate = '2026-10-09', required = false }) {
  const [date, setDate] = useState(parseDateValue(initialDate));
  const [time, setTime] = useState('08:30');
  return (
    <DateTimePicker
      label='시작 일시'
      date={date}
      time={time}
      onDateSelect={setDate}
      onTimeChange={setTime}
      datePlaceholder='시작 날짜 선택'
      required={required}
    />
  );
}

describe('DateTimePicker', () => {
  test('레이블을 날짜 버튼에 연결하고 각 시간 입력에 고유 이름과 id를 제공한다', () => {
    render(
      <>
        <ControlledPicker required />
        <DateTimePicker
          label='종료 일시'
          date={undefined}
          time=''
          onDateSelect={vi.fn()}
          onTimeChange={vi.fn()}
        />
      </>
    );
    const date = screen.getByRole('button', { name: '시작 일시' });
    expect(
      screen.getByText('시작 일시', { selector: 'label' })
    ).toHaveAttribute('for', date.id);
    expect(date).toHaveTextContent('2026-10-09');
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('08시');
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('30분');
    expect(
      screen.getByRole('combobox', { name: '종료 일시 시' })
    ).toHaveTextContent('00시');
    const ids = [...document.querySelectorAll('button[id]')].map(
      (element) => element.id
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('한국어 공용 달력에서 월·연도를 이동해 로컬 Date 콜백을 전달한다', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();
    const onTimeChange = vi.fn();
    render(
      <DateTimePicker
        label='시작 일시'
        date={parseDateValue('2026-10-09')}
        time='08:30'
        onDateSelect={onDateSelect}
        onTimeChange={onTimeChange}
      />
    );
    const trigger = screen.getByRole('button', { name: '시작 일시' });
    await user.click(screen.getByText('2026-10-09'));
    expect(
      screen.getByRole('dialog', { name: '시작 일시' })
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole('combobox', { name: '연도 선택' }),
      '2030'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: '월 선택' }),
      '0'
    );
    await user.click(screen.getByRole('button', { name: /2030년 1월 15일/ }));
    expect(onDateSelect).toHaveBeenCalledTimes(1);
    const selected = onDateSelect.mock.calls[0][0] as Date;
    expect([
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      selected.getHours(),
    ]).toEqual([2030, 0, 15, 0]);
    expect(onTimeChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test.each(['날짜 선택 해제', '선택일 재클릭'])(
    '%s로 필수 날짜를 비워도 시간을 유지한다',
    async (method) => {
      const user = userEvent.setup();
      render(<ControlledPicker required />);
      await user.click(screen.getByRole('button', { name: '시작 일시' }));
      await user.click(
        screen.getByRole('button', {
          name:
            method === '날짜 선택 해제' ? method : /2026년 10월 9일.*선택됨/,
        })
      );
      expect(
        screen.getByRole('button', { name: '시작 일시' })
      ).toHaveTextContent('시작 날짜 선택');
      expect(
        screen.getByRole('combobox', { name: '시작 일시 시' })
      ).toHaveTextContent('08시');
      expect(
        screen.getByRole('combobox', { name: '시작 일시 분' })
      ).toHaveTextContent('30분');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  );

  test('시·분 선택은 다른 시간 부분을 보존한다', async () => {
    const user = userEvent.setup();
    render(<ControlledPicker />);
    await user.click(screen.getByRole('combobox', { name: '시작 일시 시' }));
    await user.click(screen.getByRole('option', { name: '23시' }));
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('30분');
    await user.click(screen.getByRole('combobox', { name: '시작 일시 분' }));
    await user.click(screen.getByRole('option', { name: '59분' }));
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('23시');
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('59분');
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2026-10-09'
    );
  });

  test('시간만 선택하면 빈 날짜를 임의로 채우지 않고 해제 콜백은 undefined다', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();
    const onTimeChange = vi.fn();
    const { rerender } = render(
      <DateTimePicker
        label='예약 일시'
        date={undefined}
        time='00:00'
        onDateSelect={onDateSelect}
        onTimeChange={onTimeChange}
      />
    );
    await user.click(screen.getByRole('combobox', { name: '예약 일시 시' }));
    await user.click(screen.getByRole('option', { name: '09시' }));
    expect(onTimeChange).toHaveBeenLastCalledWith('09:00');
    expect(onDateSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '예약 일시' })).toHaveTextContent(
      '날짜 선택'
    );
    rerender(
      <DateTimePicker
        label='예약 일시'
        date={parseDateValue('2026-10-09')}
        time='09:00'
        onDateSelect={onDateSelect}
        onTimeChange={onTimeChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '예약 일시' }));
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    expect(onDateSelect).toHaveBeenLastCalledWith(undefined);
    expect(onTimeChange).toHaveBeenCalledTimes(1);
  });

  test('외부 초기값 변경·초기화와 잘못된 Date를 안전하게 반영한다', async () => {
    const user = userEvent.setup();
    const props = {
      label: '시작 일시',
      onDateSelect: vi.fn(),
      onTimeChange: vi.fn(),
    };
    const { rerender } = render(
      <DateTimePicker
        {...props}
        date={parseDateValue('2026-10-09')}
        time='08:30'
      />
    );
    rerender(
      <DateTimePicker
        {...props}
        date={parseDateValue('2024-02-29')}
        time='23:59'
      />
    );
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2024-02-29'
    );
    await user.click(screen.getByRole('button', { name: '시작 일시' }));
    expect(
      screen.getByRole('grid', { name: '2024년 2월' })
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    rerender(
      <DateTimePicker {...props} date={new Date('잘못된 값')} time='00:00' />
    );
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '날짜 선택'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('00시');
    expect(props.onDateSelect).not.toHaveBeenCalled();
  });

  test('날짜·시·분 모두 비활성화하고 설명·오류를 연결한다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p id='error'>일시를 확인해 주세요.</p>
        <DateTimePicker
          label='시작 일시'
          date={undefined}
          time='00:00'
          onDateSelect={vi.fn()}
          onTimeChange={vi.fn()}
          disabled
          aria-invalid
          aria-describedby='error'
        />
      </>
    );
    for (const input of [
      screen.getByRole('button', { name: '시작 일시' }),
      ...screen.getAllByRole('combobox'),
    ]) {
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription('일시를 확인해 주세요.');
      await user.click(input);
    }
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('폼 내부에서 달력·시간 선택·해제·키보드 조작이 제출을 실행하지 않는다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ControlledPicker />
      </form>
    );
    const date = screen.getByRole('button', { name: '시작 일시' });
    date.focus();
    await user.keyboard('{Enter}{ArrowRight}{Enter}');
    expect(date).toHaveTextContent('2026-10-10');
    await user.click(screen.getByRole('combobox', { name: '시작 일시 시' }));
    await user.click(screen.getByRole('option', { name: '09시' }));
    await user.click(screen.getByRole('combobox', { name: '시작 일시 분' }));
    await user.click(screen.getByRole('option', { name: '45분' }));
    await user.click(date);
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('예약 지급의 훅·요청 빌더까지 선택한 날짜와 시간을 유지한다', async () => {
    function Reservation() {
      const field = useDateTimeField({ initialDateTime: '2026-10-09T08:30' });
      return (
        <>
          <DateTimePicker
            label='예약 일시'
            date={field.date}
            time={field.time}
            onDateSelect={field.onDateSelect}
            onTimeChange={field.onTimeChange}
          />
          <output>
            {JSON.stringify(
              createExcelPointBulkRewardRequest({
                bulkMemo: '예약 지급',
                isReservation: true,
                reservationDateTime: field.dateTime,
              })
            )}
          </output>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Reservation />);
    await user.click(screen.getByRole('button', { name: '예약 일시' }));
    await user.click(screen.getByRole('button', { name: /2026년 10월 15일/ }));
    await user.click(screen.getByRole('combobox', { name: '예약 일시 시' }));
    await user.click(screen.getByRole('option', { name: '23시' }));
    expect(JSON.parse(screen.getByRole('status').textContent ?? '{}')).toEqual({
      paymentMethod: 'RESERVED',
      bulkMemo: '예약 지급',
      reservedAt: '2026-10-15 23:30:00',
    });
  });
});
