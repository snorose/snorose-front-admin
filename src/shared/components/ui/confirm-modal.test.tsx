import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  test('처리 중에는 중복 실행과 모든 닫기 동작을 차단하고 완료 후 다시 허용한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const props = {
      isOpen: true,
      title: '일정 삭제',
      description: '이 일정을 삭제하시겠습니까?',
      confirmText: '삭제',
      pendingText: '삭제 중…',
      onConfirm,
      onClose,
    };
    const { rerender } = render(<ConfirmModal {...props} isPending />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
      props.description
    );
    for (const name of ['삭제 중…', '취소', '창 닫기']) {
      const button = screen.getByRole('button', { name });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    await user.keyboard('{Escape}');
    const overlay = document.querySelector('[data-slot="dialog-overlay"]')!;
    await user.click(overlay);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    rerender(<ConfirmModal {...props} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'false');
    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: '취소' }));
    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    await user.keyboard('{Escape}');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  test('입력 미완성으로 확인이 비활성화돼도 취소는 허용한다', async () => {
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        title='변경 확인'
        confirmDisabled
        onConfirm={vi.fn()}
        onClose={onClose}
      />
    );
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('외부에서 열고 닫는 상태 변경은 닫기 콜백을 호출하지 않는다', () => {
    const onClose = vi.fn();
    const props = { title: '변경 확인', onConfirm: vi.fn(), onClose };
    const { rerender } = render(<ConfirmModal {...props} isOpen={false} />);
    rerender(<ConfirmModal {...props} isOpen />);
    rerender(<ConfirmModal {...props} isOpen={false} />);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('삭제 확인은 파괴적 변형을 사용하고 비활성 상태에서는 실행되지 않는다', () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <ConfirmModal
        isOpen
        title='일정 삭제'
        confirmText='삭제'
        confirmVariant='destructive'
        confirmDisabled
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '삭제' });
    expect(confirmButton).toHaveAttribute('data-variant', 'destructive');
    expect(confirmButton).toBeDisabled();
    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();

    rerender(
      <ConfirmModal
        isOpen
        title='일정 삭제'
        confirmText='삭제'
        confirmVariant='destructive'
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
