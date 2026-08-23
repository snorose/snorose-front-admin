import type { MemberInfo } from '@/shared/types';

export type MemberEditFormValues = Pick<
  MemberInfo,
  | 'loginId'
  | 'userName'
  | 'nickname'
  | 'email'
  | 'studentNumber'
  | 'major'
  | 'birthday'
> & {
  userRoleId: number;
};

export type MemberEditFormErrors = Partial<
  Record<keyof MemberEditFormValues, string>
>;

export function validateMemberEditForm(values: Partial<MemberEditFormValues>) {
  const errors: MemberEditFormErrors = {};

  const userNameRegex = /^[A-Za-z가-힣\s]{2,30}$/;
  const nicknameRegex = /^.{2,20}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@(sookmyung\.ac\.kr|sm\.ac\.kr)$/i;
  const studentNumberRegex = /^[0-9]{7,10}$/;
  const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (values.loginId !== undefined && !values.loginId.trim()) {
    errors.loginId = '아이디를 입력해주세요.';
  }

  if (
    values.userName !== undefined &&
    !userNameRegex.test(values.userName.trim())
  ) {
    errors.userName = '이름은 한글/영문 2~30자로 입력해주세요.';
  }

  if (
    values.nickname !== undefined &&
    !nicknameRegex.test(values.nickname.trim())
  ) {
    errors.nickname = '닉네임은 2~20자로 입력해주세요.';
  }

  if (values.email !== undefined && !emailRegex.test(values.email.trim())) {
    errors.email =
      '이메일은 @sookmyung.ac.kr 또는 @sm.ac.kr 형식이어야 합니다.';
  }

  if (
    values.studentNumber !== undefined &&
    !studentNumberRegex.test(values.studentNumber.trim())
  ) {
    errors.studentNumber = '학번은 숫자 7~10자리여야 합니다.';
  }

  if (values.major !== undefined && !values.major.trim()) {
    errors.major = '전공을 입력해주세요.';
  }

  if (values.birthday !== undefined) {
    if (!values.birthday.trim()) {
      errors.birthday = '생년월일을 입력해주세요.';
    } else if (!birthdayRegex.test(values.birthday.trim())) {
      errors.birthday = '생년월일은 YYYY-MM-DD 형식으로 입력해주세요.';
    }
  }

  return errors;
}
