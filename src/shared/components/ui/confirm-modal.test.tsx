import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  test('처리 중 실행·취소·닫기를 막고 처리 종료 후 다시 사용할 수 있다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const props = {
      isOpen: true,
      title: '일정 삭제',
      confirmText: '삭제',
      pendingText: '삭제 중',
      onClose,
      onConfirm,
    };
    const { rerender } = render(<ConfirmModal {...props} isPending />);

    const confirm = screen.getByRole('button', { name: '삭제 중' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: '창 닫기' })
    ).not.toBeInTheDocument();
    await user.click(confirm);
    await user.click(screen.getByRole('button', { name: '취소' }));
    await user.keyboard('{Escape}');
    await user.click(document.querySelector('[data-slot="dialog-overlay"]')!);
    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();

    rerender(<ConfirmModal {...props} />);
    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('강조 제목·설명과 본문을 표시하고 설명이 없는 경우 참조를 제거한다', () => {
    const props = { isOpen: true, onClose: vi.fn(), onConfirm: vi.fn() };
    const { rerender } = render(
      <ConfirmModal
        {...props}
        title={
          <>
            회원 <strong>강등</strong>
          </>
        }
        description={
          <>
            기간 <strong>3개월</strong>
          </>
        }
      >
        적용 내용을 확인하세요.
      </ConfirmModal>
    );
    expect(
      screen.getByRole('dialog', { name: '회원 강등' })
    ).toHaveAccessibleDescription('기간 3개월');
    expect(screen.getByText('적용 내용을 확인하세요.')).toBeInTheDocument();

    rerender(<ConfirmModal {...props} title='안내' />);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
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
