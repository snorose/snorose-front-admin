import { useState } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  test('Trigger 없이 연 모달을 닫으면 열기 버튼으로 포커스가 복귀한다', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>열기</button>
          <Modal open={open} onOpenChange={setOpen} title='안내'>
            <button>본문 버튼</button>
          </Modal>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '열기' })).toHaveFocus()
    );
  });

  test('제목과 설명을 접근 가능한 이름으로 연결하고 자유로운 내용을 표시한다', () => {
    render(
      <Modal
        open
        onOpenChange={vi.fn()}
        title='회원 정보'
        subtitle='회원 상세 안내'
      >
        회원 정보 본문
      </Modal>
    );

    expect(
      screen.getByRole('dialog', { name: '회원 정보' })
    ).toHaveAccessibleDescription('회원 상세 안내');
    expect(screen.getByText('회원 정보 본문')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '상세 페이지로 이동' })
    ).toBeInTheDocument();
  });

  test('설명이 없으면 존재하지 않는 설명을 참조하지 않는다', () => {
    render(<Modal open onOpenChange={vi.fn()} title='안내' />);

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  test('닫기 버튼과 ESC로 닫기를 요청한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Modal open onOpenChange={onOpenChange} title='안내' />);

    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    onOpenChange.mockClear();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  test('닫기 제한 중에는 X를 숨기고 ESC와 외부 클릭을 막으며 해제 후 닫을 수 있다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Modal open onOpenChange={onOpenChange} title='저장' closeDisabled />
    );

    expect(
      screen.queryByRole('button', { name: '창 닫기' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(document.querySelector('[data-slot="dialog-overlay"]')!);
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(<Modal open onOpenChange={onOpenChange} title='저장' />);
    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
