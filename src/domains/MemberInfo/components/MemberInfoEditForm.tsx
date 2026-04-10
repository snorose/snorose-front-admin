import { useState } from 'react';

import { toast } from 'sonner';

import { Button, Input, Label } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import {
  MEMBER_INFO,
  USER_ROLES,
} from '@/domains/MemberInfo/constants/memberInfo';

const EDITABLE_KEYS: (keyof MemberInfo)[] = [
  'userName',
  'studentNumber',
  'major',
  'userRoleId',
  'email',
  'birthday',
];

export default function MemberInfoEditForm({
  member,
  onSubmit,
  onCancel,
}: {
  member: MemberInfo;
  onSubmit: (updated: MemberInfo) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MemberInfo>(member);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MemberInfo, string>>
  >({});

  const handleChange = (key: keyof MemberInfo, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<keyof MemberInfo, string>> = {};
    const userName = String(form.userName ?? '').trim();
    const email = String(form.email ?? '').trim();
    const studentNumber = String(form.studentNumber ?? '').trim();

    const userNameRegex = /^[A-Za-z가-힣\s]{2,30}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@(sookmyung\.ac\.kr|sm\.ac\.kr)$/i;
    const studentNumberRegex = /^[0-9]{7,10}$/;

    if (!userNameRegex.test(userName)) {
      nextErrors.userName = '이름은 영문, 한글 포함 2 ~ 30자여야 합니다.';
    }

    if (!emailRegex.test(email)) {
      nextErrors.email =
        '이메일 형식(xxx@sookmyung.ac.kr or xxx@sm.ac.kr)이 올바르지 않습니다.';
    }

    if (!studentNumberRegex.test(studentNumber)) {
      nextErrors.studentNumber = '학번은 7 ~ 10자의 숫자여야 합니다.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      toast.error('입력값을 확인해주세요.');
      return;
    }

    setFieldErrors({});
    const payload =
      form.userRoleId === 1 ? { ...form, authenticatedAt: null } : form;

    onSubmit(payload);
  };

  return (
    <article>
      <h3 className='mb-2 text-lg font-bold'>회원정보 수정</h3>

      <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
        {MEMBER_INFO.map(({ label, key }) => {
          const rawValue = form[key];
          const isEdit = EDITABLE_KEYS.includes(key);
          const hasError = Boolean(fieldErrors[key]);
          const errorMessage = fieldErrors[key];

          const inputClass = `w-60 ${
            isEdit
              ? hasError
                ? 'bg-red-100'
                : 'bg-blue-50'
              : 'bg-gray-100 text-gray-500'
          }`;

          // 회원 등급 select
          if (key === 'userRoleId') {
            return (
              <div key={key} className='flex items-start gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

                <div className='flex flex-col gap-1'>
                  <select
                    disabled={!isEdit}
                    className={`${inputClass} rounded border px-2 py-1`}
                    value={rawValue as number}
                    onChange={(e) => handleChange(key, Number(e.target.value))}
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errorMessage && (
                    <p className='text-xs text-red-600'>{errorMessage}</p>
                  )}
                </div>
              </div>
            );
          }

          // 생년월일 날짜선택
          if (key === 'birthday') {
            return (
              <div key={key} className='flex items-start gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

                <div className='flex flex-col gap-1'>
                  <Input
                    type='date'
                    className={inputClass}
                    readOnly={!isEdit}
                    value={rawValue ? String(rawValue).substring(0, 10) : ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                  {errorMessage && (
                    <p className='text-xs text-red-600'>{errorMessage}</p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className='flex items-start gap-4'>
              <Label className='w-32 text-gray-700'>{label}</Label>

              <div className='flex flex-col gap-1'>
                <Input
                  readOnly={!isEdit}
                  value={rawValue ?? ''}
                  onChange={(e) => isEdit && handleChange(key, e.target.value)}
                  className={inputClass}
                />
                {errorMessage && (
                  <p className='text-xs text-red-600'>{errorMessage}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-4 flex gap-3'>
        <Button onClick={handleSubmit}>저장</Button>
        <Button variant='outline' onClick={onCancel}>
          취소
        </Button>
      </div>
    </article>
  );
}
