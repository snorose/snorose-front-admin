import { type FormEvent, useState } from 'react';

import {
  CalendarDays,
  Coins,
  GraduationCap,
  IdCard,
  Mail,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import {
  EditableField,
  EditableRoleField,
  type FieldItem,
  ReadonlyField,
} from '@/domains/MemberInfo/components/MemberInfoEditFormFields';
import { MEMBER_INFO_EDIT_FORM_ID } from '@/domains/MemberInfo/constants/memberInfo';
import {
  formatDate,
  formatDateTime,
  formatDisplayValue,
  formatPoint,
} from '@/domains/MemberInfo/utils/memberDirectory';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';
import {
  type MemberEditFormErrors,
  validateMemberEditForm,
} from '@/domains/MemberInfo/utils/validateMemberEditForm';

type MemberInfoEditFormProps = {
  member: MemberInfo;
  onSubmit: (updated: MemberInfo) => void;
  onCancel: () => void;
  onCopy: (value: string) => void | Promise<void>;
};

export default function MemberInfoEditForm({
  member,
  onSubmit,
  onCancel,
  onCopy,
}: MemberInfoEditFormProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(
    String(member.userRoleId)
  );
  const [userName, setUserName] = useState(member.userName ?? '');
  const [nickname, setNickname] = useState(member.nickname ?? '');
  const [email, setEmail] = useState(member.email ?? '');
  const [studentNumber, setStudentNumber] = useState(
    member.studentNumber ?? ''
  );
  const [major, setMajor] = useState(member.major ?? '');
  const [birthday, setBirthday] = useState(
    member.birthday ? String(member.birthday).substring(0, 10) : ''
  );
  const [fieldErrors, setFieldErrors] = useState<MemberEditFormErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      userName: userName.trim(),
      nickname: nickname.trim(),
      email: email.trim(),
      studentNumber: studentNumber.trim(),
      major: major.trim(),
      birthday: birthday.trim(),
      userRoleId: Number(selectedRoleId),
    };

    const nextErrors = validateMemberEditForm(nextValues);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      toast.error('입력값을 확인해주세요.');
      return;
    }

    setFieldErrors({});

    const nextMember: MemberInfo = {
      ...member,
      ...nextValues,
    };

    onSubmit(nextMember);
  };

  const handleProfileImageAction = () => {
    toast.info('프로필 이미지 수정 API 연동 예정입니다.');
  };

  const fieldItems: FieldItem[] = [
    {
      type: 'editable',
      icon: UserRound,
      label: '이름',
      value: userName,
      onChange: (value) => {
        setUserName(value);
        setFieldErrors((prev) => ({ ...prev, userName: undefined }));
      },
    },
    {
      type: 'readonly',
      icon: IdCard,
      label: '아이디',
      value: formatDisplayValue(member.loginId),
      kind: 'box',
    },
    {
      type: 'editable',
      icon: UserRound,
      label: '닉네임',
      value: nickname,
      onChange: (value) => {
        setNickname(value);
        setFieldErrors((prev) => ({ ...prev, nickname: undefined }));
      },
    },
    {
      type: 'editable',
      icon: GraduationCap,
      label: '학번',
      value: studentNumber,
      onChange: (value) => {
        setStudentNumber(value);
        setFieldErrors((prev) => ({ ...prev, studentNumber: undefined }));
      },
    },
    {
      type: 'editable',
      icon: CalendarDays,
      label: '생년월일',
      value: birthday,
      onChange: (value) => {
        setBirthday(value);
        setFieldErrors((prev) => ({ ...prev, birthday: undefined }));
      },
      inputType: 'date',
    },
    {
      type: 'editable',
      icon: GraduationCap,
      label: '전공',
      value: major,
      onChange: (value) => {
        setMajor(value);
        setFieldErrors((prev) => ({ ...prev, major: undefined }));
      },
    },
    {
      type: 'readonly',
      icon: CalendarDays,
      label: '가입일',
      value: formatDate(member.createdAt),
    },
    {
      type: 'readonly',
      icon: CalendarDays,
      label: '등업일',
      value: formatDate(member.authenticatedAt),
    },
    {
      type: 'readonly',
      icon: CalendarDays,
      label: '최근 로그인 날짜',
      value: formatDate(member.lastLoginAt),
    },
    {
      type: 'readonly',
      icon: CalendarDays,
      label: '정보 수정일',
      value: formatDateTime(member.updatedAt),
    },
    {
      type: 'readonly',
      icon: Coins,
      label: '보유 포인트',
      value: formatPoint(member.pointBalance),
    },
    {
      type: 'readonly',
      icon: IdCard,
      label: '회원 ID (암호화)',
      value: formatDisplayValue(member.encryptedUserId),
      copyValue: member.encryptedUserId,
    },
    {
      type: 'role',
      label: '회원 등급',
      value: selectedRoleId,
    },
    {
      type: 'editable',
      icon: Mail,
      label: '이메일',
      value: email,
      onChange: (value) => {
        setEmail(value);
        setFieldErrors((prev) => ({ ...prev, email: undefined }));
      },
      inputType: 'email',
    },
  ];

  return (
    <form
      id={MEMBER_INFO_EDIT_FORM_ID}
      onSubmit={handleSubmit}
      className='space-y-8'
    >
      <div className='flex flex-col items-center gap-4 border-b border-slate-100 pb-8'>
        <div className='relative'>
          <div className='flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-sm'>
            {member.profileImageUrl ? (
              <img
                src={member.profileImageUrl}
                alt={`${member.userName} 프로필`}
                className='h-full w-full object-cover'
              />
            ) : (
              <UserRound className='h-12 w-12' />
            )}
          </div>

          <div className='absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2'>
            <Button
              type='button'
              size='icon-sm'
              onClick={handleProfileImageAction}
              className='rounded-full bg-slate-950 text-white hover:bg-slate-800'
            >
              <Upload className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              size='icon-sm'
              onClick={handleProfileImageAction}
              className='rounded-full bg-rose-500 text-white hover:bg-rose-400'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='space-y-1 text-center text-sm font-medium text-slate-400'>
          <p>프로필 이미지를 클릭하여 변경하거나 삭제할 수 있습니다</p>
          <p>(최대 5MB, JPG/PNG)</p>
        </div>
      </div>

      <div className='grid gap-x-10 gap-y-6 md:grid-cols-2'>
        {fieldItems.map((field) => {
          if (field.type === 'editable') {
            return (
              <EditableField
                key={field.label}
                icon={field.icon}
                label={field.label}
                value={field.value}
                onChange={field.onChange}
                placeholder={field.placeholder}
                type={field.inputType}
                error={fieldErrors[getFieldErrorKey(field.label)]}
              />
            );
          }

          if (field.type === 'role') {
            return (
              <EditableRoleField
                key={field.label}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                currentLabel={convertUserRoleIdToEnum(Number(selectedRoleId))}
              />
            );
          }

          return (
            <ReadonlyField
              key={field.label}
              icon={field.icon}
              label={field.label}
              value={field.value}
              kind={field.kind}
              copyValue={field.copyValue}
              onCopy={onCopy}
            />
          );
        })}
      </div>

      <div className='hidden'>
        <button type='submit'>submit</button>
        <button type='button' onClick={onCancel}>
          cancel
        </button>
      </div>
    </form>
  );
}

function getFieldErrorKey(label: string): keyof MemberEditFormErrors {
  switch (label) {
    case '이름':
      return 'userName';
    case '닉네임':
      return 'nickname';
    case '학번':
      return 'studentNumber';
    case '생년월일':
      return 'birthday';
    case '전공':
      return 'major';
    case '이메일':
      return 'email';
    default:
      return 'userName';
  }
}
