import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test } from 'vitest';

import ServerMaintenancePage from './ServerMaintenancePage';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

async function chooseDate(
  user: ReturnType<typeof userEvent.setup>,
  label: string
) {
  await user.click(screen.getByRole('button', { name: label }));
  const month = screen
    .getByRole('grid')
    .getAttribute('aria-label')
    ?.match(/(\d+)년 (\d+)월/);
  if (!month) throw new Error('달력의 현재 월을 확인할 수 없습니다.');
  const offset = 2026 * 12 + 9 - (Number(month[1]) * 12 + Number(month[2]) - 1);
  for (let index = 0; index < Math.abs(offset); index++) {
    await user.click(
      screen.getByRole('button', {
        name: offset > 0 ? '다음 달로 이동' : '이전 달로 이동',
      })
    );
  }
  await user.click(screen.getByRole('button', { name: /2026년 10월 1일/ }));
}

async function chooseHour(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  hour: string
) {
  await user.click(screen.getByRole('combobox', { name: `${label} 시` }));
  await user.click(screen.getByRole('option', { name: `${hour}시` }));
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
    await user.type(screen.getByLabelText(/일정 제목/), '신규 점검');
    await chooseDate(user, '시작 일시');
    await chooseHour(user, '시작 일시', '02');
    await chooseDate(user, '종료 일시');
    await chooseHour(user, '종료 일시', '01');
    await user.click(screen.getByRole('button', { name: '생성' }));
    expect(
      screen.getByText('종료 일시는 시작 일시보다 늦어야 합니다.')
    ).toHaveTextContent('종료 일시는 시작 일시보다 늦어야 합니다.');
    await chooseHour(user, '종료 일시', '03');
    await user.click(screen.getByRole('button', { name: '생성' }));
    expect(screen.getByRole('cell', { name: '신규 점검' })).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: '신규 점검 서버 점검 일정 메뉴 열기',
      })
    );
    await user.click(screen.getByRole('menuitem', { name: '수정' }));
    expect(
      screen.getByRole('heading', { name: '서버 점검 일정 수정' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작 일시' })).toHaveTextContent(
      '2026-10-01'
    );
    expect(
      screen.getByRole('combobox', { name: '시작 일시 시' })
    ).toHaveTextContent('02시');
    expect(
      screen.getByRole('combobox', { name: '종료 일시 시' })
    ).toHaveTextContent('03시');
    fireEvent.change(screen.getByLabelText(/일정 제목/), {
      target: { value: '수정 점검' },
    });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByRole('cell', { name: '수정 점검' })).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: '수정 점검 서버 점검 일정 메뉴 열기',
      })
    );
    await user.click(screen.getByRole('menuitem', { name: '삭제' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));
    expect(
      screen.queryByRole('cell', { name: '수정 점검' })
    ).not.toBeInTheDocument();
  });
});
