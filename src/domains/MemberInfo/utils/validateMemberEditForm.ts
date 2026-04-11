import type { MemberInfo } from '@/shared/types';

export type MemberEditFormValues = Pick<
  MemberInfo,
  'userName' | 'nickname' | 'email' | 'studentNumber' | 'major' | 'birthday'
> & {
  userRoleId: number;
};

export type MemberEditFormErrors = Partial<
  Record<keyof MemberEditFormValues, string>
>;

export function validateMemberEditForm(values: MemberEditFormValues) {
  const errors: MemberEditFormErrors = {};

  const userName = values.userName.trim();
  const nickname = values.nickname.trim();
  const email = values.email.trim();
  const studentNumber = values.studentNumber.trim();
  const major = values.major.trim();
  const birthday = values.birthday.trim();

  const userNameRegex = /^[A-Za-z가-힣\s]{2,30}$/;
  const nicknameRegex = /^.{2,20}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@(sookmyung\.ac\.kr|sm\.ac\.kr)$/i;
  const studentNumberRegex = /^[0-9]{7,10}$/;
  const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!userNameRegex.test(userName)) {
    errors.userName = '이름은 한글/영문 2~30자로 입력해주세요.';
  }

  if (!nicknameRegex.test(nickname)) {
    errors.nickname = '닉네임은 2~20자로 입력해주세요.';
  }

  if (!emailRegex.test(email)) {
    errors.email =
      '이메일은 @sookmyung.ac.kr 또는 @sm.ac.kr 형식이어야 합니다.';
  }

  if (!studentNumberRegex.test(studentNumber)) {
    errors.studentNumber = '학번은 숫자 7~10자리여야 합니다.';
  }

  if (!major) {
    errors.major = '전공을 입력해주세요.';
  }

  if (birthday && !birthdayRegex.test(birthday)) {
    errors.birthday = '생년월일은 YYYY-MM-DD 형식으로 입력해주세요.';
  }

  return errors;
}
