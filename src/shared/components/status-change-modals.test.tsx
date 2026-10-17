import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import PostDetailActionModal from '@/domains/Posts/components/PostDetail/PostDetailActionModal';

import StatusChangeModal from './StatusChangeModal';

const ACTIONS = [
  ['HIDE', '비공개'],
  ['SHOW', '공개'],
  ['DELETE', '삭제'],
  ['RESTORE', '복구'],
] as const;

describe('상태 변경 모달 공통화', () => {
  test.each(ACTIONS)(
    '%s에서도 사유 필수 검증과 원문 전달을 유지한다',
    async (modalType, actionText) => {
      const user = userEvent.setup();
      const onConfirmAction = vi.fn();
      const onRowClick = vi.fn();
      render(
        <div onClick={onRowClick}>
          <StatusChangeModal
            target='COMMENT'
            modalType={modalType}
            onClose={vi.fn()}
            onConfirmAction={onConfirmAction}
          />
        </div>
      );

      expect(
        screen.getByRole('dialog', { name: `댓글 ${actionText} 처리` })
      ).toBeInTheDocument();
      const confirm = screen.getByRole('button', { name: '확인' });
      expect(confirm).toHaveAttribute(
        'data-variant',
        modalType === 'DELETE' ? 'destructive' : 'default'
      );
      expect(confirm).toBeDisabled();
      await user.type(
        screen.getByRole('textbox', { name: '상태 변경 사유' }),
        '   '
      );
      expect(confirm).toBeDisabled();
      await user.type(screen.getByRole('textbox'), '운영 정책 위반');
      await user.click(confirm);
      expect(onConfirmAction).toHaveBeenCalledExactlyOnceWith(
        '   운영 정책 위반'
      );
      expect(onRowClick).not.toHaveBeenCalled();
    }
  );

  test('실패 후 처리 중 상태가 풀리면 입력한 사유로 다시 확인할 수 있다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirmAction = vi.fn();
    const props = {
      target: 'POST' as const,
      modalType: 'DELETE' as const,
      onClose,
      onConfirmAction,
    };
    const { rerender } = render(<StatusChangeModal {...props} />);
    await user.type(screen.getByRole('textbox'), '삭제 사유');
    await user.click(screen.getByRole('button', { name: '확인' }));
    rerender(<StatusChangeModal {...props} isPending />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: '처리 중…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '창 닫기' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    rerender(<StatusChangeModal {...props} />);
    expect(screen.getByRole('textbox')).toHaveValue('삭제 사유');
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirmAction).toHaveBeenCalledTimes(2);
  });

  test('Esc로 닫으면 열기 버튼으로 포커스를 돌리고 재열기 시 내부 사유를 초기화한다', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>삭제 열기</button>
          {open && (
            <StatusChangeModal
              target='POST'
              modalType='DELETE'
              onClose={() => setOpen(false)}
              onConfirmAction={vi.fn()}
            />
          )}
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: '삭제 열기' });
    await user.click(trigger);
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.type(screen.getByRole('textbox'), '임시 사유');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  test.each(ACTIONS)(
    '게시글 %s의 제어된 사유와 삭제 전용 옵션을 유지한다',
    async (modalType, actionText) => {
      const user = userEvent.setup();
      const onReasonChange = vi.fn();
      const onDeleteCommentsAlsoChange = vi.fn();
      const onConfirm = vi.fn();
      const props = {
        isOpen: true,
        modalType,
        reason: '   ',
        onReasonChange,
        deleteCommentsAlso: false,
        onDeleteCommentsAlsoChange,
        onConfirm,
        onClose: vi.fn(),
      };
      const { rerender } = render(<PostDetailActionModal {...props} />);
      expect(
        screen.getByRole('dialog', { name: `게시글 ${actionText} 처리` })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
      fireEvent.change(screen.getByRole('textbox', { name: '변경 사유' }), {
        target: { value: '변경 사유' },
      });
      expect(onReasonChange).toHaveBeenCalledWith('변경 사유');
      if (modalType === 'DELETE') {
        await user.click(
          screen.getByRole('checkbox', {
            name: '게시글에 달린 댓글도 함께 전부 삭제 처리',
          })
        );
        expect(onDeleteCommentsAlsoChange).toHaveBeenCalledWith(true);
      } else {
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      }
      rerender(
        <PostDetailActionModal
          {...props}
          reason='변경 사유'
          deleteCommentsAlso
          isPending
        />
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
      if (modalType === 'DELETE') {
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('checkbox')).toBeDisabled();
      }
      rerender(
        <PostDetailActionModal
          {...props}
          reason='변경 사유'
          deleteCommentsAlso
        />
      );
      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onConfirm).toHaveBeenCalledOnce();
      rerender(<PostDetailActionModal {...props} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  );
});
