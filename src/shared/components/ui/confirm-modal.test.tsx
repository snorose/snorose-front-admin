import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  test('입력 검증으로 확인을 차단하고 해제하면 위험 작업을 실행한다', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const props = {
      isOpen: true,
      title: '일정 삭제',
      confirmText: '삭제',
      confirmVariant: 'destructive' as const,
      onConfirm,
      onClose,
    };
    const { rerender } = render(<ConfirmModal {...props} confirmDisabled />);
    const confirm = screen.getByRole('button', { name: '삭제' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('data-variant', 'destructive');
    expect(screen.getByRole('button', { name: '취소' })).toBeEnabled();
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    rerender(<ConfirmModal {...props} confirmDisabled={false} />);
    expect(confirm).toBeEnabled();
    expect(confirm).toHaveAttribute('data-variant', 'destructive');
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

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
