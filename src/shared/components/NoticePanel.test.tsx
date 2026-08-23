import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { NoticePanel } from './NoticePanel';

describe('NoticePanel', () => {
  test('기본 제목과 안내 문구 목록을 표시한다', () => {
    render(<NoticePanel items={['첫 번째 안내', '두 번째 안내']} />);

    expect(screen.getByText('안내 사항')).toBeInTheDocument();

    const listItems = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('첫 번째 안내');
    expect(listItems[1]).toHaveTextContent('두 번째 안내');
  });

  test('강조 요소가 포함된 안내 문구를 표시한다', () => {
    render(
      <NoticePanel
        items={[
          <>
            행 번호는 <strong>2번 행부터</strong>입니다.
          </>,
        ]}
      />
    );

    expect(screen.getByText('2번 행부터').tagName).toBe('STRONG');
  });

  test('제목을 변경할 수 있다', () => {
    render(<NoticePanel title='확인 사항' items={['안내 문구']} />);

    expect(screen.getByText('확인 사항')).toBeInTheDocument();
  });
});
