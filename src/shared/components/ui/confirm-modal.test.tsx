import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  test('확인과 취소를 각각 실행한다', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        title='확인 요청'
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('처리 중에는 버튼과 Escape로 실행하거나 닫을 수 없다', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        isPending
        title='처리 중'
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );
    const confirm = screen.getByRole('button', { name: '확인' });
    const cancel = screen.getByRole('button', { name: '취소' });
    expect(confirm).toBeDisabled();
    expect(cancel).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: '창 닫기' })
    ).not.toBeInTheDocument();
    fireEvent.click(confirm);
    fireEvent.click(cancel);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
