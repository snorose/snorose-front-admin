import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { PopupContentEditor } from './PopupContentEditor';

function Editor({ initial = '안내 보기', disabled = false }) {
  const [value, setValue] = useState(initial);
  return (
    <PopupContentEditor
      id='body'
      value={value}
      disabled={disabled}
      onChange={setValue}
    />
  );
}

describe('팝업 본문 마크다운 에디터', () => {
  test('선택한 텍스트에 굵게 단축키를 적용하고 다시 누르면 해제한다', async () => {
    render(<Editor />);
    const input = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: '본문',
    });
    input.setSelectionRange(0, input.value.length);
    fireEvent.keyDown(input, { key: 'b', metaKey: true });
    expect(input).toHaveValue('**안내 보기**');
    await waitFor(() => expect(input.selectionStart).toBe(2));
    fireEvent.keyDown(input, { key: 'b', metaKey: true });
    expect(input).toHaveValue('안내 보기');
  });

  test('여러 텍스트에 각각 링크를 삽입하고 주소를 직접 편집한다', async () => {
    const user = userEvent.setup();
    render(<Editor initial='첫 안내와 둘째 안내' />);
    const input = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: '본문',
    });
    input.setSelectionRange(0, 4);
    await user.click(screen.getByRole('button', { name: '링크 (⌘/Ctrl+K)' }));
    expect(input).toHaveValue('[첫 안내](주소)와 둘째 안내');
    await waitFor(() => expect(input.selectionStart).toBe(7));
    await user.keyboard('https://example.com/first');
    const start = input.value.indexOf('둘째 안내');
    input.setSelectionRange(start, start + 5);
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true });
    expect(input.value).toContain('[첫 안내](https://example.com/first)');
    expect(input.value).toContain('[둘째 안내](주소)');
  });

  test('기울임과 알파벳 목록 없이 숫자 목록을 적용한다', async () => {
    const user = userEvent.setup();
    render(<Editor initial={'첫째\n둘째'} />);
    const input = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: '본문',
    });
    expect(
      screen.queryByRole('button', { name: /기울임|알파벳/ })
    ).not.toBeInTheDocument();
    input.setSelectionRange(0, input.value.length);
    await user.click(screen.getByRole('button', { name: '번호 목록' }));
    expect(input).toHaveValue('1. 첫째\n2. 둘째');
  });

  test('잠금 상태에서는 본문과 서식 버튼을 사용할 수 없다', () => {
    render(<Editor disabled />);
    expect(screen.getByRole('textbox', { name: '본문' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /굵게/ })).toBeDisabled();
  });
});
