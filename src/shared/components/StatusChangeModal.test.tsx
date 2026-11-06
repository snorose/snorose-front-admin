import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import StatusChangeModal from './StatusChangeModal';

afterEach(cleanup);

it('게시글 복구 옵션은 기본 미선택이며 사용자가 선택한 값을 전달한다', async () => {
  const onConfirmAction = vi.fn();
  const user = userEvent.setup();
  render(
    <StatusChangeModal
      target='POST'
      modalType='RESTORE'
      onClose={vi.fn()}
      onConfirmAction={onConfirmAction}
    />
  );
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).not.toBeChecked();
  expect(checkbox).toBeEnabled();
  expect(screen.queryByText('현재는 하위 댓글도 함께 복구됩니다.')).toBeNull();
  await user.type(screen.getByRole('textbox'), '오삭제 복구');
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onConfirmAction).toHaveBeenLastCalledWith('오삭제 복구', false);
  await user.click(checkbox);
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onConfirmAction).toHaveBeenLastCalledWith('오삭제 복구', true);
});

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

it.each([
  '포인트/출첵 관련 게시글 및 댓글',
  '무성의/초성 관련 게시글 및 댓글',
  '불법촬영물 게시 및 유통',
  '상업적 광고 및 판매글',
])(
  '삭제 사유 버튼 "%s"를 누르면 입력만 채우고 확인 시 전달한다',
  async (preset) => {
    const user = userEvent.setup();
    const onConfirmAction = vi.fn();
    render(
      <StatusChangeModal
        target='POST'
        modalType='DELETE'
        onClose={vi.fn()}
        onConfirmAction={onConfirmAction}
      />
    );
    await user.click(screen.getByRole('button', { name: preset }));
    expect(screen.getByRole('textbox')).toHaveValue(preset);
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(onConfirmAction).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirmAction).toHaveBeenCalledWith(preset, false);
  }
);

it('댓글 삭제에서도 자동 입력한 문구를 수정하고 사유를 직접 입력할 수 있다', async () => {
  const user = userEvent.setup();
  const onConfirmAction = vi.fn();
  render(
    <StatusChangeModal
      target='COMMENT'
      modalType='DELETE'
      onClose={vi.fn()}
      onConfirmAction={onConfirmAction}
    />
  );
  await user.click(
    screen.getByRole('button', { name: '불법촬영물 게시 및 유통' })
  );
  const input = screen.getByRole('textbox');
  await user.type(input, ' 확인 후 삭제');
  expect(input).toHaveFocus();
  expect(input).toHaveValue('불법촬영물 게시 및 유통 확인 후 삭제');
  await user.clear(input);
  await user.type(input, '중복 게시물');
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onConfirmAction).toHaveBeenCalledWith('중복 게시물', false);
});

it('처리 중에는 자동 입력 버튼과 직접 입력을 비활성화한다', () => {
  render(
    <StatusChangeModal
      target='POST'
      modalType='DELETE'
      isPending
      onClose={vi.fn()}
      onConfirmAction={vi.fn()}
    />
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  for (const button of screen.getAllByRole('button'))
    expect(button).toBeDisabled();
});

it.each(['HIDE', 'SHOW', 'RESTORE'] as const)(
  '%s 모달에는 삭제 사유 자동 입력 버튼이 없다',
  (modalType) => {
    render(
      <StatusChangeModal
        target='POST'
        modalType={modalType}
        onClose={vi.fn()}
        onConfirmAction={vi.fn()}
      />
    );
    expect(screen.queryByText('자주 쓰는 삭제 사유')).not.toBeInTheDocument();
  }
);
