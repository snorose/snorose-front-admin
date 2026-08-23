import { describe, expect, test } from 'vitest';

import {
  type MemberEditFormValues,
  validateMemberEditForm,
} from './validateMemberEditForm';

const VALID_VALUES: MemberEditFormValues = {
  loginId: 'test-id',
  userName: '테스트',
  nickname: '테스터',
  email: 'test@sookmyung.ac.kr',
  studentNumber: '1234567',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  userRoleId: 2,
};

describe('validateMemberEditForm', () => {
  test('유효한 회원 수정값은 오류가 없다', () => {
    expect(validateMemberEditForm(VALID_VALUES)).toEqual({});
  });

  test('아이디가 공백이면 오류를 반환한다', () => {
    expect(validateMemberEditForm({ loginId: '   ' }).loginId).toBe(
      '아이디를 입력해주세요.'
    );
  });

  test('변경하지 않아 payload에서 제외된 필드는 검증하지 않는다', () => {
    expect(validateMemberEditForm({ loginId: 'changed-id' })).toEqual({});
  });

  test('변경된 필드만 검증한다', () => {
    expect(validateMemberEditForm({ nickname: '한' })).toEqual({
      nickname: '닉네임은 2~20자로 입력해주세요.',
    });
  });

  test('생년월일을 비울 수 없다', () => {
    expect(validateMemberEditForm({ birthday: '' })).toEqual({
      birthday: '생년월일을 입력해주세요.',
    });
  });
});
