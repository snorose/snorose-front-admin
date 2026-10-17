import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CopyableValue } from './CopyableValue';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const writeText = vi.fn();
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard'
);

beforeEach(() => {
  vi.clearAllMocks();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

describe('CopyableValue', () => {
  test.each([
    ['아이디', '아이디가 복사되었습니다.'],
    ['학번', '학번이 복사되었습니다.'],
    ['게시글 ID', '게시글 ID가 복사되었습니다.'],
    ['회원 ID (암호화)', '회원 ID (암호화)가 복사되었습니다.'],
  ])(
    '복사 성공 시 %s 항목명에 맞는 조사를 안내한다',
    async (label, message) => {
      render(<CopyableValue value='original' label={label} />);
      fireEvent.click(screen.getByRole('button', { name: `${label} 복사` }));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledExactlyOnceWith(message)
      );
    }
  );

  test('입력형은 읽기 전용 input에 라벨을 연결하고 키보드로 원문을 복사한다', async () => {
    const user = userEvent.setup();
    const clipboardSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    render(
      <>
        <label htmlFor='member-id'>회원 ID</label>
        <CopyableValue
          id='member-id'
          variant='input'
          value='encrypted-original'
          displayValue='encrypted…'
          label='회원 ID'
        />
      </>
    );
    const input = screen.getByRole('textbox', { name: '회원 ID' });
    expect(input).toHaveValue('encrypted…');
    expect(input).toHaveAttribute('readonly');
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('수정');
    expect(input).toHaveValue('encrypted…');
    await user.tab();
    expect(screen.getByRole('button', { name: '회원 ID 복사' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(clipboardSpy).toHaveBeenCalledWith('encrypted-original');
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    clipboardSpy.mockRestore();
  });

  test('입력형의 빈 값은 대시로 표시하고 복사를 비활성화한다', () => {
    render(<CopyableValue variant='input' value={null} label='아이디' />);
    expect(screen.getByRole('textbox', { name: '아이디' })).toHaveValue('-');
    expect(screen.getByRole('button', { name: '아이디 복사' })).toBeDisabled();
  });

  test.each([' snowrose ', 12345, 0])(
    '값 %s를 원문대로 복사한다',
    async (value) => {
      render(<CopyableValue value={value} label='아이디' />);
      fireEvent.click(screen.getByRole('button', { name: '아이디 복사' }));
      expect(writeText).toHaveBeenCalledExactlyOnceWith(String(value));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledExactlyOnceWith(
          '아이디가 복사되었습니다.'
        )
      );
    }
  );

  test.each([null, undefined, '', '   '])(
    '빈 값 %s의 복사를 막는다',
    (value) => {
      render(<CopyableValue value={value} label='아이디' />);
      expect(screen.getByText('-')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(writeText).not.toHaveBeenCalled();
    }
  );

  test('표시값 대신 원문을 복사하고 원문을 title로 제공한다', async () => {
    render(
      <CopyableValue
        value='encrypted-original'
        displayValue='encrypted…'
        label='회원 ID'
      />
    );
    expect(screen.getByText('encrypted…')).toHaveAttribute(
      'title',
      'encrypted-original'
    );
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith('encrypted-original');
  });

  test.each(['unsupported', 'rejected'])(
    '클립보드 %s 상태에서 실패만 안내한다',
    async (failure) => {
      if (failure === 'unsupported') {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: undefined,
        });
      } else {
        writeText.mockRejectedValueOnce(new Error('Permission denied'));
      }
      render(<CopyableValue value='snowrose' label='아이디' />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledExactlyOnceWith(
          '아이디 복사에 실패했습니다.'
        )
      );
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toBeEnabled();
    }
  );

  test('복사 완료 전 중복 실행과 성공 안내를 막는다', async () => {
    let resolveCopy!: () => void;
    writeText.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveCopy = resolve;
      })
    );
    render(<CopyableValue value='snowrose' label='아이디' />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
    await act(async () => resolveCopy());
    expect(button).toBeEnabled();
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  test('값 클릭은 복사하지 않고 아이콘 클릭은 부모 클릭·폼 제출을 막는다', async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onClick={onClick} onSubmit={onSubmit}>
        <CopyableValue value='snowrose' label='아이디' />
      </form>
    );
    fireEvent.click(screen.getByText('snowrose'));
    expect(writeText).not.toHaveBeenCalled();
    onClick.mockClear();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('키보드로 아이콘에 포커스하고 복사를 실행한다', async () => {
    const user = userEvent.setup();
    const clipboardSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    render(<CopyableValue value='snowrose' label='아이디' />);
    await user.tab();
    expect(screen.getByRole('button', { name: '아이디 복사' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(clipboardSpy).toHaveBeenCalledWith('snowrose');
    clipboardSpy.mockRestore();
  });
});
