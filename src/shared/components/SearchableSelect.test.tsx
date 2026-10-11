import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { SearchableSelect } from './SearchableSelect';

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

const options = [
  { value: '41', label: '주거' },
  { value: '43', label: '숙플레이스' },
];

function MultipleSelect({ onChange }: { onChange: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>(['41']);
  return (
    <SearchableSelect
      multiple
      label='게시판'
      placeholder='전체'
      value={value}
      options={options}
      onValueChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('SearchableSelect', () => {
  test('빈 결과와 한글 조합 Enter로 선택하지 않고 일반 Enter로 선택한다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <SearchableSelect
          label='게시판'
          placeholder='전체'
          value='ALL'
          options={options}
          onValueChange={onValueChange}
        />
      </form>
    );
    const trigger = screen.getByRole('button', { name: '게시판' });
    await user.click(trigger);
    const input = screen.getByRole('textbox', { name: '게시판 목록 검색' });
    await user.type(input, '없는게시판');
    expect(screen.getByRole('status')).toHaveTextContent(
      '검색 결과가 없습니다.'
    );
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, ' 주거 ');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('41');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('textbox', { name: '게시판 목록 검색' })
    ).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('다중 선택을 검색 결과 밖에서도 보존하고 빈 결과에서도 전체 선택을 해제한다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultipleSelect onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: '게시판' });
    await user.click(trigger);
    const input = screen.getByRole('textbox', { name: '게시판 목록 검색' });
    await user.type(input, '숙플레이스');
    await user.click(screen.getByRole('checkbox', { name: '숙플레이스' }));
    expect(onChange).toHaveBeenLastCalledWith(['41', '43']);
    expect(trigger).toHaveTextContent('게시판 2개');
    await user.clear(input);
    expect(screen.getByRole('checkbox', { name: '주거' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '숙플레이스' })).toBeChecked();
    await user.type(input, '없는게시판');
    await user.click(screen.getByRole('button', { name: '선택 해제' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(trigger).toHaveTextContent('전체');
    await user.keyboard('{Escape}');
    await user.click(trigger);
    expect(
      screen.getByRole('textbox', { name: '게시판 목록 검색' })
    ).toHaveValue('');
  });

  test('검색창에서 방향키로 이동하고 Space·Enter로 다중 선택 후 Escape로 닫는다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultipleSelect onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: '게시판' });
    await user.click(trigger);
    const input = screen.getByRole('textbox', { name: '게시판 목록 검색' });
    await waitFor(() => expect(input).toHaveFocus());
    await user.keyboard('{ArrowUp} ');
    expect(screen.getByRole('checkbox', { name: '숙플레이스' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(['41', '43']);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['43']);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
