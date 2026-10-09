import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import MemberDirectoryActionBar from './MemberDirectoryActionBar';

describe('MemberDirectoryActionBar', () => {
  test('실행 기능이 연결되지 않은 일괄 행동은 모두 비활성 상태로 표시한다', () => {
    render(<MemberDirectoryActionBar />);

    for (const name of ['포인트 지급', '제재 부여', '회원 탈퇴', '알림 전송']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });
});
