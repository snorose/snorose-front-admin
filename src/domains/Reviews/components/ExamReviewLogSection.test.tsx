import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ExamReviewLogSection } from './ExamReviewLogSection';

describe('ExamReviewLogSection', () => {
  test('파일명 수정 이력을 한글 작업명과 이전·이후 이름으로 표시한다', () => {
    render(
      <ExamReviewLogSection
        logs={[
          {
            encryptedAdminId: 'admin',
            adminName: '관리자',
            createdAt: '2026-09-21T22:15:22',
            changes: {
              action: 'RENAMED_FILE',
              oldFileName: '기존파일.pdf',
              newFileName: '새파일.pdf',
            },
          },
        ]}
      />
    );

    expect(screen.getByText('파일명 수정')).toBeInTheDocument();
    expect(screen.getByText('수정 전 파일명')).toBeInTheDocument();
    expect(screen.getByText('기존파일.pdf')).toBeInTheDocument();
    expect(screen.getByText('수정 후 파일명')).toBeInTheDocument();
    expect(screen.getByText('새파일.pdf')).toBeInTheDocument();
  });
});
