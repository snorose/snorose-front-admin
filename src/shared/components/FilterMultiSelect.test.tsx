import { useState } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { FilterMultiSelect } from './FilterMultiSelect';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

const options = [
  { value: 21, label: '첫눈' },
  { value: 22, label: '큰눈' },
];

function ControlledFilter({
  onChange,
}: {
  onChange: (value: number[]) => void;
}) {
  const [value, setValue] = useState<number[]>([]);
  return (
    <FilterMultiSelect
      label='게시판'
      value={value}
      options={options}
      onValueChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('FilterMultiSelect', () => {
  test('숫자 항목을 여러 개 선택·해제하고 메뉴와 요약을 유지한다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledFilter onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: '게시판' });
    expect(trigger).toHaveAccessibleDescription('전체');
    await user.click(trigger);
    expect(screen.getByRole('menuitem', { name: '선택 해제' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('menuitemcheckbox', { name: '첫눈' }));
    expect(onChange).toHaveBeenLastCalledWith([21]);
    expect(trigger).toHaveTextContent('첫눈');
    expect(
      screen.getByRole('menuitemcheckbox', { name: '첫눈' })
    ).toBeChecked();
    await user.click(screen.getByRole('menuitemcheckbox', { name: '큰눈' }));
    expect(onChange).toHaveBeenLastCalledWith([21, 22]);
    expect(trigger).toHaveTextContent('게시판 2개');
    await user.click(screen.getByRole('menuitemcheckbox', { name: '첫눈' }));
    expect(onChange).toHaveBeenLastCalledWith([22]);
    expect(trigger).toHaveTextContent('큰눈');
    await user.click(screen.getByRole('menuitemcheckbox', { name: '큰눈' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(trigger).toHaveTextContent('전체');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('선택 해제는 빈 배열을 전달하고 원래 문자열 배열을 변경하지 않는다', async () => {
    const user = userEvent.setup();
    const initial = ['VISIBLE', 'ADMIN_HIDDEN'];
    const onValueChange = vi.fn();
    const { rerender } = render(
      <FilterMultiSelect
        label='관리 상태'
        value={initial}
        options={[
          { value: 'VISIBLE', label: '노출' },
          { value: 'ADMIN_HIDDEN', label: '어드민 비공개' },
        ]}
        onValueChange={onValueChange}
      />
    );
    const trigger = screen.getByRole('button', { name: '관리 상태' });
    expect(trigger).toHaveTextContent('관리 상태 2개');
    await user.click(trigger);
    await user.click(screen.getByRole('menuitemcheckbox', { name: '노출' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['ADMIN_HIDDEN']);
    expect(initial).toEqual(['VISIBLE', 'ADMIN_HIDDEN']);
    await user.click(screen.getByRole('menuitem', { name: '선택 해제' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    await user.keyboard('{Escape}');
    rerender(
      <FilterMultiSelect
        label='관리 상태'
        value={[]}
        options={[]}
        onValueChange={onValueChange}
      />
    );
    expect(trigger).toHaveTextContent('전체');
    expect(trigger).toBeDisabled();
  });

  test('키보드로 열고 방향키·Enter·Space로 토글한 뒤 Escape로 포커스를 복귀한다', async () => {
    const user = userEvent.setup();
    render(<ControlledFilter onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '게시판' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const first = screen.getByRole('menuitemcheckbox', { name: '첫눈' });
    await waitFor(() => expect(first).toHaveFocus());
    await user.keyboard('{Enter}{ArrowDown} ');
    expect(first).toBeChecked();
    expect(
      screen.getByRole('menuitemcheckbox', { name: '큰눈' })
    ).toBeChecked();
    expect(trigger).toHaveTextContent('게시판 2개');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('비활성 트리거는 열리지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <FilterMultiSelect
        label='게시판'
        value={[]}
        options={options}
        onValueChange={vi.fn()}
        disabled
      />
    );
    await user.click(screen.getByRole('button', { name: '게시판' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
