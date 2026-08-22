import { describe, expect, test } from 'vitest';

import { isWithdrawnInquiryAuthor } from './inquiryAuthorUtils';

describe('isWithdrawnInquiryAuthor', () => {
  test.each([
    [{ userLoginId: 'test', isWriterWithdrawn: true }, true],
    [{ userLoginId: '탈퇴', isWriterWithdrawn: false }, true],
    [{ userLoginId: '탈퇴한 사용자', isWriterWithdrawn: false }, true],
    [{ userLoginId: 'test', isWriterWithdrawn: false }, false],
  ])('작성자 정보 %o의 탈퇴 여부를 %s로 판정한다', (author, expected) => {
    expect(isWithdrawnInquiryAuthor(author)).toBe(expected);
  });
});
