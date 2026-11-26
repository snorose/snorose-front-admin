import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { Sidebar } from './sidebar';

vi.mock('@/shared/hooks', () => ({ useIsMobile: () => false }));

function Status() {
  const { open } = Sidebar.useSidebar();
  return <output data-testid='sidebar-state'>{String(open)}</output>;
}

describe('사이드바 단축키', () => {
  test('편집 영역과 이미 처리된 단축키를 무시하고 일반 영역에서만 토글한다', () => {
    render(
      <Sidebar.Provider>
        <Status />
        <textarea aria-label='본문' />
        <input aria-label='제목' />
        <div role='textbox' contentEditable suppressContentEditableWarning>
          <span>에디터 본문</span>
        </div>
        <button type='button'>일반 영역</button>
      </Sidebar.Provider>
    );
    for (const key of ['metaKey', 'ctrlKey']) {
      for (const target of [
        screen.getByLabelText('본문'),
        screen.getByLabelText('제목'),
        screen.getByText('에디터 본문'),
      ]) {
        fireEvent.keyDown(target, { key: 'b', [key]: true });
        expect(screen.getByTestId('sidebar-state')).toHaveTextContent('true');
      }
    }
    const prevented = new KeyboardEvent('keydown', {
      key: 'b',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    prevented.preventDefault();
    window.dispatchEvent(prevented);
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('true');
    fireEvent.keyDown(screen.getByRole('button', { name: '일반 영역' }), {
      key: 'b',
      metaKey: true,
    });
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('false');
  });
});
