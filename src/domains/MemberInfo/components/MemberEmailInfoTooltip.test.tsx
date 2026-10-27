import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { MemberEmailInfoTooltip } from './MemberEmailInfoTooltip';

describe('MemberEmailInfoTooltip', () => {
  test.each(['hover', 'focus', 'click'] as const)(
    '%s로 안내를 열고 Escape로 닫는다',
    async (interaction) => {
      const user = userEvent.setup({ skipHover: true });
      render(<MemberEmailInfoTooltip />);
      const trigger = screen.getByRole('button', { name: '이메일 변경 안내' });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      if (interaction === 'hover') {
        await user.hover(trigger);
      } else if (interaction === 'focus') {
        await user.tab();
        expect(trigger).toHaveFocus();
      } else {
        // 터치처럼 hover 없이 클릭해도 안내가 열리는지 확인한다.
        await user.click(trigger);
      }

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent(
        '이메일은 숙명인 메일로만 변경할 수 있습니다.'
      );
      expect(tooltip).toHaveTextContent(
        '리뉴얼 이전에 가입한 계정은 숙명인 메일이 아닐 수 있습니다.'
      );
      expect(trigger).toHaveAccessibleDescription(tooltip.textContent ?? '');

      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      );
    }
  );
});
