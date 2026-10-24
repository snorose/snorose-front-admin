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
