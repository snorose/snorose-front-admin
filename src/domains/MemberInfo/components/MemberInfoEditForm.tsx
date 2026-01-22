import { useState } from 'react';
import { Label, Input, Button } from '@/components/ui';
import type { MemberInfo } from '@/types';
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
  'authenticatedAt',
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

  const handleChange = (key: keyof MemberInfo, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <article>
      <h3 className='mb-2 text-lg font-bold'>회원정보 수정</h3>

      <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
        {MEMBER_INFO.map(({ label, key }) => {
          const rawValue = form[key];
          const isEdit = EDITABLE_KEYS.includes(key);

          const inputClass = `w-60 ${
            isEdit ? 'bg-blue-50' : 'bg-gray-100 text-gray-500'
          }`;

          // 회원 등급 select
          if (key === 'userRoleId') {
            return (
              <div key={key} className='flex gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

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
              </div>
            );
          }

          // 생년월일 날짜선택
          if (key === 'birthday') {
            return (
              <div key={key} className='flex gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

                <Input
                  type='date'
                  className={inputClass}
                  readOnly={!isEdit}
                  value={rawValue ? String(rawValue).substring(0, 10) : ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          }

          return (
            <div key={key} className='flex gap-4'>
              <Label className='w-32 text-gray-700'>{label}</Label>

              <Input
                readOnly={!isEdit}
                value={rawValue ?? ''}
                onChange={(e) => isEdit && handleChange(key, e.target.value)}
                className={inputClass}
              />
            </div>
          );
        })}
      </div>

      <div className='mt-4 flex gap-3'>
        <Button onClick={() => onSubmit(form)}>저장</Button>
        <Button variant='outline' onClick={onCancel}>
          취소
        </Button>
      </div>
    </article>
  );
}
