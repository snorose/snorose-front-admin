import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import StatusChangeModal from './StatusChangeModal';

afterEach(cleanup);

it('게시글 삭제 확인 시 사유와 댓글 삭제 선택을 전달한다', async () => {
  const onConfirmAction = vi.fn();
  const user = userEvent.setup();
  render(
    <StatusChangeModal
      target='POST'
      modalType='DELETE'
      onClose={vi.fn()}
      onConfirmAction={onConfirmAction}
    />
  );
  await user.type(screen.getByRole('textbox'), '삭제 사유');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onConfirmAction).toHaveBeenCalledWith('삭제 사유', true);
});

it('댓글 삭제 모달에는 댓글 동시 삭제 옵션이 없다', () => {
  render(
    <StatusChangeModal
      target='COMMENT'
      modalType='DELETE'
      onClose={vi.fn()}
      onConfirmAction={vi.fn()}
    />
  );
  expect(screen.queryByRole('checkbox')).toBeNull();
});

it('처리 중 사유와 옵션 편집·재실행·닫기를 막는다', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onConfirmAction = vi.fn();
  render(
    <StatusChangeModal
      target='POST'
      modalType='DELETE'
      isPending
      onClose={onClose}
      onConfirmAction={onConfirmAction}
    />
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(screen.getByRole('checkbox')).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '처리 중' }));
  await user.keyboard('{Escape}');
  expect(onClose).not.toHaveBeenCalled();
  expect(onConfirmAction).not.toHaveBeenCalled();
});

it('모달 클릭은 부모로 전파하지 않고 X와 ESC는 닫기를 요청한다', async () => {
  const user = userEvent.setup();
  const onParentClick = vi.fn();
  const onClose = vi.fn();
  render(
    <div onClick={onParentClick}>
      <StatusChangeModal
        target='COMMENT'
        modalType='RESTORE'
        onClose={onClose}
        onConfirmAction={vi.fn()}
      />
    </div>
  );
  expect(
    screen.getByRole('dialog', { name: '댓글 복구 처리' })
  ).toHaveAccessibleDescription('상태를 변경하는 사유를 작성해 주세요.');
  await user.type(screen.getByRole('textbox'), '복구 사유');
  await user.click(screen.getByRole('button', { name: '창 닫기' }));
  await user.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledTimes(2);
  expect(onParentClick).not.toHaveBeenCalled();
});
