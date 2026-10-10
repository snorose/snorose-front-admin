import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
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
