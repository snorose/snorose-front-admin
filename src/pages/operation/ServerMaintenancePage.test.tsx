import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import ServerMaintenancePage from './ServerMaintenancePage';

function fillSchedule() {
  fireEvent.change(screen.getByLabelText(/일정 제목/), {
    target: { value: '신규 점검' },
  });
  fireEvent.change(screen.getByLabelText(/시작 일시/), {
    target: { value: '2026-10-01T02:00' },
  });
  fireEvent.change(screen.getByLabelText(/종료 일시/), {
    target: { value: '2026-10-01T01:00' },
  });
}

describe('서버 점검 일정 관리', () => {
  test('상단에 임시 데이터 안내와 등록 폼, 하단에 조회 목록을 표시한다', () => {
    render(<ServerMaintenancePage />);
    expect(
      screen.getByText('현재 임시 데이터를 표시하고 있습니다.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '서버 점검 일정 등록' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '서버 점검 일정 조회' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('예정')).toHaveLength(2);
    expect(screen.getAllByText('진행중')).toHaveLength(2);
    expect(screen.getAllByText('종료')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(7);
  });

  test('종료 시간이 빠르면 거부하고, 유효한 일정은 등록한 뒤 수정·삭제할 수 있다', async () => {
    const user = userEvent.setup();
    render(<ServerMaintenancePage />);
    fillSchedule();
    fireEvent.click(screen.getByRole('button', { name: '생성' }));
    expect(
      screen.getByText('종료 일시는 시작 일시보다 늦어야 합니다.')
    ).toHaveTextContent('종료 일시는 시작 일시보다 늦어야 합니다.');
    fireEvent.change(screen.getByLabelText(/종료 일시/), {
      target: { value: '2026-10-01T03:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: '생성' }));
    expect(screen.getByRole('cell', { name: '신규 점검' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '신규 점검 더보기' }));
    await user.click(screen.getByRole('menuitem', { name: '수정' }));
    expect(
      screen.getByRole('heading', { name: '서버 점검 일정 수정' })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/일정 제목/), {
      target: { value: '수정 점검' },
    });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByRole('cell', { name: '수정 점검' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '수정 점검 더보기' }));
    await user.click(screen.getByRole('menuitem', { name: '삭제' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));
    expect(
      screen.queryByRole('cell', { name: '수정 점검' })
    ).not.toBeInTheDocument();
  });
});
