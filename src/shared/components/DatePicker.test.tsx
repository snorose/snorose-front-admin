import { useState } from 'react';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { Label } from '@/shared/components/ui';

import { DatePicker } from './DatePicker';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

function ControlledDatePicker({
  initialValue = '2026-10-09',
  captionLayout = 'label',
}: {
  initialValue?: string;
  captionLayout?: 'label' | 'dropdown';
}) {
  const [value, setValue] = useState<string | undefined>(initialValue);

  return (
    <>
      <Label htmlFor='date'>작성일</Label>
      <DatePicker
        id='date'
        value={value}
        onValueChange={setValue}
        captionLayout={captionLayout}
      />
    </>
  );
}

describe('DatePicker', () => {
  test('기본 달력은 제목과 좌우 화살표를 표시하고 연도 경계를 이동한다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker initialValue='2026-12-09' />);
    await user.click(screen.getByRole('button', { name: '작성일' }));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('2026년 12월')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 달로 이동' }));
    expect(
      screen.getByRole('grid', { name: '2027년 1월' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '이전 달로 이동' }));
    expect(
      screen.getByRole('grid', { name: '2026년 12월' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 달로 이동' }));
    await user.click(screen.getByRole('button', { name: /2027년 1월 15일/ }));
    expect(screen.getByRole('button', { name: '작성일' })).toHaveTextContent(
      '2027-01-15'
    );
  });

  test('월·연도 드롭다운으로 과거와 미래 날짜를 탐색한다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker captionLayout='dropdown' />);
    await user.click(screen.getByRole('button', { name: '작성일' }));

    await user.click(screen.getByRole('combobox', { name: '연도 선택' }));
    await user.click(screen.getByRole('option', { name: '2000년' }));
    expect(screen.getByRole('combobox', { name: '연도 선택' })).toHaveFocus();
    await user.click(screen.getByRole('combobox', { name: '월 선택' }));
    await user.click(screen.getByRole('option', { name: '1월' }));
    expect(
      screen.getByRole('grid', { name: '2000년 1월' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: '연도 선택' }));
    await user.click(screen.getByRole('option', { name: '2030년' }));
    expect(
      screen.getByRole('grid', { name: '2030년 1월' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /2030년 1월 15일/ }));
    expect(screen.getByRole('button', { name: '작성일' })).toHaveTextContent(
      '2030-01-15'
    );
  });

  test('현재 연도 탐색 범위 밖의 초기값도 표시하고 탐색 범위를 확장한다', async () => {
    const user = userEvent.setup();
    render(
      <ControlledDatePicker
        initialValue='1850-01-01'
        captionLayout='dropdown'
      />
    );
    await user.click(screen.getByRole('button', { name: '작성일' }));
    const yearSelect = screen.getByRole('combobox', { name: '연도 선택' });
    expect(yearSelect).toHaveTextContent('1850년');
    await user.click(yearSelect);
    await user.click(screen.getByRole('option', { name: '1750년' }));
    expect(
      screen.getByRole('grid', { name: '1750년 1월' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: '연도 선택' }));
    await user.click(screen.getByRole('option', { name: '1650년' }));
    expect(
      screen.getByRole('grid', { name: '1650년 1월' })
    ).toBeInTheDocument();
  });

  test('최소·최대 날짜의 경계만 포함하고 경계 밖 선택은 막는다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        id='date'
        value='2026-10-09'
        minDate='2026-10-05'
        maxDate='2026-10-15'
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '2026-10-09' }));

    const before = screen.getByRole('button', { name: /2026년 10월 4일/ });
    expect(before).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /2026년 10월 16일/ })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /2026년 10월 5일/ })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /2026년 10월 15일/ })
    ).toBeEnabled();
    await user.click(before);
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /2026년 10월 5일/ }));
    expect(onValueChange).toHaveBeenCalledWith('2026-10-05');
  });

  test('같은 최소·최대 날짜도 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        id='date'
        value={undefined}
        minDate='2030-01-15'
        maxDate='2030-01-15'
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '날짜 선택' }));
    await user.click(screen.getByRole('button', { name: /2030년 1월 15일/ }));
    expect(onValueChange).toHaveBeenCalledWith('2030-01-15');
  });

  test('범위 밖 초기값은 자동 변경하지 않고 유효한 월로 연다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        id='date'
        value='2024-01-01'
        minDate='2026-10-05'
        maxDate='2026-12-31'
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '2024-01-01' }));
    expect(
      screen.getByRole('grid', { name: '2026년 10월' })
    ).toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('최소 날짜가 최대 날짜보다 늦으면 선택을 막고 기존 값은 유지한다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        id='date'
        value='2026-10-09'
        minDate='2026-10-15'
        maxDate='2026-10-05'
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole('button', { name: '2026-10-09' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /2026년 10월 9일/ })
    ).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('clearable=false이면 해제 버튼과 선택일 재클릭으로 날짜를 지우지 않는다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        id='date'
        value='2026-10-09'
        onValueChange={onValueChange}
        clearable={false}
      />
    );
    await user.click(screen.getByRole('button', { name: '2026-10-09' }));
    expect(
      screen.queryByRole('button', { name: '날짜 선택 해제' })
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /2026년 10월 9일.*선택됨/ })
    );
    expect(onValueChange).not.toHaveBeenCalledWith(undefined);
    expect(
      screen.getByRole('button', { name: '2026-10-09' })
    ).toHaveTextContent('2026-10-09');
  });

  test('기본 해제 정책에서는 선택일 재클릭으로도 날짜를 지울 수 있다', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);
    await user.click(screen.getByRole('button', { name: '작성일' }));
    await user.click(
      screen.getByRole('button', { name: /2026년 10월 9일.*선택됨/ })
    );
    expect(screen.getByRole('button', { name: '작성일' })).toHaveTextContent(
      '날짜 선택'
    );
  });

  test('레이블이 없는 필드도 접근성 이름·설명·오류를 연결한다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p id='date-error'>날짜를 확인해 주세요.</p>
        <DatePicker
          id='date'
          value={undefined}
          onValueChange={vi.fn()}
          aria-label='검색 시작일'
          aria-describedby='date-error'
          aria-invalid
        />
      </>
    );
    const trigger = screen.getByRole('button', { name: '검색 시작일' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription('날짜를 확인해 주세요.');
    await user.click(trigger);
    expect(
      screen.getByRole('dialog', { name: '검색 시작일' })
    ).toHaveAccessibleDescription('날짜를 확인해 주세요.');
  });

  test('외부 aria-labelledby를 버튼과 달력에 연결한다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <span id='date-label'>생년월일</span>
        <DatePicker
          id='date'
          value={undefined}
          onValueChange={vi.fn()}
          aria-labelledby='date-label'
          captionLayout='dropdown'
        />
      </>
    );
    await user.click(screen.getByRole('button', { name: '생년월일' }));
    expect(
      screen.getByRole('dialog', { name: '생년월일' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: '월 선택' }));
    expect(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: '1월',
      })
    ).toBeInTheDocument();
  });

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
