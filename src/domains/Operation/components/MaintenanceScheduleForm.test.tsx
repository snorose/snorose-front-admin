import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import type { ServerMaintenance } from '../types/maintenance';
import { MaintenanceScheduleForm } from './MaintenanceScheduleForm';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});
const INITIAL: ServerMaintenance = {
  id: 1,
  title: ' 기존 점검 ',
  startAt: '2026-10-09T08:30',
  endAt: '2026-10-09T23:59',
  createdAt: '',
  updatedAt: '',
};

describe('서버 점검 날짜·시간 입력', () => {
  test('날짜 없이 시간만 선택해도 필수값 검증으로 저장을 막고 설명을 연결한다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MaintenanceScheduleForm onSave={onSave} />);
    await user.type(screen.getByLabelText(/일정 제목/), '점검');
    await user.click(screen.getByRole('combobox', { name: '시작 일시 시' }));
    await user.click(screen.getByRole('option', { name: '09시' }));
    await user.click(screen.getByRole('button', { name: '생성' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '시작 날짜 선택'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '모든 필수 항목을 입력해 주세요.'
    );
    for (const input of [
      screen.getByRole('button', { name: '시작 일시' }),
      screen.getByRole('combobox', { name: '시작 일시 시' }),
      screen.getByRole('combobox', { name: '종료 일시 분' }),
    ]) {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription(
        '모든 필수 항목을 입력해 주세요.'
      );
    }
  });

  test.each(['2026-10-09T08:30', '2026-10-09T08:29'])(
    '종료가 시작과 같거나 빠른 값(%s)을 거부한다',
    async (endAt) => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(
        <MaintenanceScheduleForm
          initial={{ ...INITIAL, endAt }}
          onSave={onSave}
        />
      );
      await user.click(screen.getByRole('button', { name: '수정' }));
      expect(screen.getByRole('alert')).toHaveTextContent(
        '종료 일시는 시작 일시보다 늦어야 합니다.'
      );
      expect(onSave).not.toHaveBeenCalled();
    }
  );

  test('수정 초기값과 날짜·시간 선택 결과를 로컬 문자열로 저장하고 제목을 trim한다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MaintenanceScheduleForm initial={INITIAL} onSave={onSave} />);
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2026-10-09'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('30분');
    await user.click(screen.getByRole('button', { name: '종료 일시' }));
    await user.click(screen.getByRole('button', { name: /2026년 10월 10일/ }));
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      title: '기존 점검',
      startAt: '2026-10-09T08:30',
      endAt: '2026-10-10T23:59',
    });
  });

  test('수정 초기화는 날짜·시간·제목을 초기값으로 함께 되돌리고 취소 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MaintenanceScheduleForm
        initial={INITIAL}
        onSave={vi.fn()}
        onCancel={onCancel}
      />
    );
    await user.clear(screen.getByLabelText(/일정 제목/));
    await user.type(screen.getByLabelText(/일정 제목/), '변경');
    await user.click(screen.getByRole('button', { name: '시작 일시' }));
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    await user.click(screen.getByRole('combobox', { name: '시작 일시 시' }));
    await user.click(screen.getByRole('option', { name: '23시' }));
    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '입력 초기화' }));
    expect(screen.getByLabelText(/일정 제목/)).toHaveValue(INITIAL.title);
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2026-10-09'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('08시');
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('30분');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('생성 초기화는 빈 날짜·00:00·빈 제목으로 복귀한다', async () => {
    const user = userEvent.setup();
    render(<MaintenanceScheduleForm onSave={vi.fn()} />);
    await user.type(screen.getByLabelText(/일정 제목/), '점검');
    await user.click(screen.getByRole('button', { name: '시작 일시' }));
    const day = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.getAttribute('data-day') && !button.hasAttribute('disabled')
      );
    if (!day) throw new Error('선택 가능한 날짜가 없습니다.');
    await user.click(day);
    await user.click(screen.getByRole('combobox', { name: '시작 일시 시' }));
    await user.click(screen.getByRole('option', { name: '23시' }));
    await user.click(screen.getByRole('button', { name: '입력 초기화' }));
    expect(screen.getByLabelText(/일정 제목/)).toHaveValue('');
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '시작 날짜 선택'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('00시');
  });

  test('잘못된 초기 일시는 안전하게 비우고 저장을 거부한다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <MaintenanceScheduleForm
        initial={{ ...INITIAL, startAt: '2026-02-30T99:00' }}
        onSave={onSave}
      />
    );
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '시작 날짜 선택'
    );
    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '모든 필수 항목을 입력해 주세요.'
    );
  });

  test('일정 key가 바뀌면 새 수정 초기값을 반영하며 필수 제목도 검사한다', () => {
    const onSave = vi.fn();
    const { rerender } = render(
      <MaintenanceScheduleForm key={1} initial={INITIAL} onSave={onSave} />
    );
    rerender(
      <MaintenanceScheduleForm
        key={2}
        initial={{ ...INITIAL, id: 2, title: '', startAt: '2024-02-29T12:34' }}
        onSave={onSave}
      />
    );
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2024-02-29'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 분' })
    ).toHaveTextContent('34분');
    fireEvent.submit(
      screen.getByLabelText(/일정 제목/).closest('form') as HTMLFormElement
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '모든 필수 항목을 입력해 주세요.'
    );
  });
});
