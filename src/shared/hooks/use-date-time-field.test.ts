import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { parseDateValue } from '@/shared/utils';

import { useDateTimeField } from './use-date-time-field';

describe('useDateTimeField', () => {
  test('로컬 초기 날짜·시간을 유지하며 초기화 중 콜백을 호출하지 않는다', () => {
    const onDateTimeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateTimeField({
        initialDateTime: '2026-10-09T23:59:00',
        onDateTimeChange,
      })
    );

    expect(result.current.date?.getDate()).toBe(9);
    expect(result.current.time).toBe('23:59');
    expect(result.current.dateTime).toBe('2026-10-09T23:59');
    expect(onDateTimeChange).not.toHaveBeenCalled();
  });

  test('날짜·시간 선택과 해제 시 콜백을 전달하고 해제 후 시간을 유지한다', () => {
    const onDateTimeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateTimeField({ initialTime: '08:30', onDateTimeChange })
    );

    act(() => result.current.onTimeChange('09:15'));
    expect(result.current.dateTime).toBe('');
    expect(onDateTimeChange).toHaveBeenLastCalledWith('');
    act(() => result.current.onDateSelect(parseDateValue('2026-10-10')));
    expect(result.current.dateTime).toBe('2026-10-10T09:15');
    expect(onDateTimeChange).toHaveBeenLastCalledWith('2026-10-10T09:15');
    act(() => result.current.onDateSelect(undefined));
    expect(result.current.dateTime).toBe('');
    expect(result.current.time).toBe('09:15');
    expect(onDateTimeChange).toHaveBeenLastCalledWith('');
    act(() => result.current.reset());
    expect(result.current.date).toBeUndefined();
    expect(result.current.time).toBe('00:00');
    expect(onDateTimeChange).toHaveBeenLastCalledWith('');
  });

  test('setDateTime과 개별 setter는 상태를 갱신하지만 콜백을 호출하지 않는다', () => {
    const onDateTimeChange = vi.fn();
    const { result } = renderHook(() => useDateTimeField({ onDateTimeChange }));

    act(() => result.current.setDateTime('2024-02-29T12:34'));
    expect(result.current.dateTime).toBe('2024-02-29T12:34');
    act(() => result.current.setDate(parseDateValue('2026-03-08')));
    act(() => result.current.setTime('03:30'));
    expect(result.current.dateTime).toBe('2026-03-08T03:30');
    expect(onDateTimeChange).not.toHaveBeenCalled();
    act(() => result.current.setDateTime(''));
    expect(result.current.dateTime).toBe('');
    expect(result.current.time).toBe('00:00');
  });

  test.each(['잘못된 값', '2026-02-30T00:00', '2026-10-09T99:00'])(
    '잘못된 초기값과 재설정값(%s)을 안전하게 비운다',
    (value) => {
      const { result } = renderHook(() =>
        useDateTimeField({ initialDateTime: value })
      );
      expect(result.current.date).toBeUndefined();
      expect(result.current.dateTime).toBe('');
      act(() => result.current.setDateTime(value));
      expect(result.current.dateTime).toBe('');
      expect(result.current.time).toBe('00:00');
    }
  );

  test('유효하지 않은 Date를 초기값·선택·setter로 받아도 오류가 나지 않는다', () => {
    const onDateTimeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateTimeField({
        initialDate: new Date('잘못된 날짜'),
        onDateTimeChange,
      })
    );

    expect(result.current.date).toBeUndefined();
    act(() => result.current.onDateSelect(new Date('잘못된 날짜')));
    expect(result.current.dateTime).toBe('');
    expect(onDateTimeChange).toHaveBeenLastCalledWith('');
    act(() => result.current.setDate(new Date('잘못된 날짜')));
    expect(result.current.date).toBeUndefined();
    expect(result.current.dateTime).toBe('');
  });
});
