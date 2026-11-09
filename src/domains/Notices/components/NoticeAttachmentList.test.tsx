import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import type { NoticeAttachment } from '../types';
import NoticeAttachmentList from './NoticeAttachmentList';

const attachments: NoticeAttachment[] = ['A', 'B'].map((name) => ({
  id: name,
  name: `${name}.png`,
  type: 'image/png',
  size: 1,
  url: `blob:${name}`,
}));
const makeTransfer = () => {
  const values = new Map<string, string>();
  return {
    setData: vi.fn((type: string, value: string) => values.set(type, value)),
    getData: vi.fn((type: string) => values.get(type) ?? ''),
    effectAllowed: '',
    dropEffect: '',
  };
};
afterEach(cleanup);

test('부모 fieldset 없이도 잠기면 드래그·버튼·방향키·삭제가 첨부를 변경하지 않는다', () => {
  const onChange = vi.fn();
  render(
    <NoticeAttachmentList
      attachments={attachments}
      onChange={onChange}
      disabled
    />
  );
  const cards = screen.getAllByRole('listitem');
  for (const card of cards) {
    expect(card).toHaveAttribute('draggable', 'false');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('tabindex', '-1');
  }
  for (const button of screen.getAllByRole('button'))
    expect(button).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'B.png 순서 끌어서 이동' })
  ).toHaveAttribute('draggable', 'false');
  const dataTransfer = makeTransfer();
  expect(fireEvent.dragStart(cards[1], { dataTransfer })).toBe(false);
  expect(dataTransfer.setData).not.toHaveBeenCalled();
  fireEvent.dragOver(cards[0], { dataTransfer });
  fireEvent.drop(cards[0], { dataTransfer });
  fireEvent.keyDown(cards[1], { key: 'ArrowLeft' });
  fireEvent.click(screen.getByRole('button', { name: 'B.png 앞으로 이동' }));
  fireEvent.click(screen.getByRole('button', { name: 'A.png 삭제' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
    'A.png',
    'B.png',
  ]);
});

test('잠금 전 시작한 드래그의 지연 drop은 잠금 중과 해제 직후에도 무시하고 새 드래그만 허용한다', () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <NoticeAttachmentList attachments={attachments} onChange={onChange} />
  );
  const cards = () => screen.getAllByRole('listitem');
  const oldTransfer = makeTransfer();
  fireEvent.dragStart(
    screen.getByRole('button', { name: 'B.png 순서 끌어서 이동' }),
    { dataTransfer: oldTransfer }
  );
  expect(oldTransfer.setData).toHaveBeenCalled();
  rerender(
    <NoticeAttachmentList
      attachments={attachments}
      onChange={onChange}
      disabled
    />
  );
  fireEvent.drop(cards()[0], { dataTransfer: oldTransfer });
  expect(onChange).not.toHaveBeenCalled();
  rerender(
    <NoticeAttachmentList attachments={attachments} onChange={onChange} />
  );
  fireEvent.drop(cards()[0], { dataTransfer: oldTransfer });
  expect(onChange).not.toHaveBeenCalled();
  const newTransfer = makeTransfer();
  fireEvent.dragStart(cards()[1], { dataTransfer: newTransfer });
  fireEvent.dragOver(cards()[0], { dataTransfer: newTransfer });
  fireEvent.drop(cards()[0], { dataTransfer: newTransfer });
  expect(onChange).toHaveBeenCalledExactlyOnceWith([
    attachments[1],
    attachments[0],
  ]);
});

test('삭제 확인창을 연 뒤 잠기면 확인창을 닫고 첨부를 삭제하지 않는다', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <NoticeAttachmentList attachments={attachments} onChange={onChange} />
  );
  await user.click(screen.getByRole('button', { name: 'A.png 삭제' }));
  expect(
    within(screen.getByRole('dialog')).getByRole('button', { name: '삭제' })
  ).toBeEnabled();
  rerender(
    <NoticeAttachmentList
      attachments={attachments}
      onChange={onChange}
      disabled
    />
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
