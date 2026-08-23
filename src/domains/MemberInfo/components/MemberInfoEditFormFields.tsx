import { Copy, type LucideIcon, UserRound } from 'lucide-react';

import { Input, Select } from '@/shared/components/ui';

import { USER_ROLES } from '@/domains/MemberInfo/constants/memberInfo';
import { EMPTY_TEXT } from '@/domains/MemberInfo/utils/memberDirectory';
import type { MemberEditFormValues } from '@/domains/MemberInfo/utils/validateMemberEditForm';

export type EditableFieldItem = {
  type: 'editable';
  fieldName: keyof MemberEditFormValues;
  icon: LucideIcon;
  inputType?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export type ReadonlyFieldItem = {
  type: 'readonly';
  copyValue?: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

export type RoleFieldItem = {
  type: 'role';
  label: string;
};

export type FieldItem = EditableFieldItem | ReadonlyFieldItem | RoleFieldItem;

export function EditableField({
  error,
  fieldName,
  icon: Icon,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string;
  fieldName: keyof MemberEditFormValues;
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  const inputId = `member-edit-${fieldName}`;
  const errorId = `${inputId}-error`;

  return (
    <div className='space-y-2'>
      <label
        htmlFor={inputId}
        className={`flex items-center gap-2 text-sm font-medium ${
          error ? 'text-rose-700' : 'text-slate-500'
        }`}
      >
        <Icon className='h-4 w-4' />
        {label}
      </label>
      <Input
        id={inputId}
        name={fieldName}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-12 rounded-xl px-4 text-base font-semibold text-slate-950 shadow-none focus-visible:ring-2 ${
          error
            ? 'border border-rose-300 bg-rose-50 ring-2 ring-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200'
            : 'border-0 bg-slate-100'
        }`}
      />
      {error ? (
        <p id={errorId} role='alert' className='text-sm text-rose-600'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EditableRoleField({
  currentLabel,
  onChange,
  value,
}: {
  currentLabel: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
        <UserRound className='h-4 w-4' />
        회원 등급
      </div>
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger className='h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-left text-base font-semibold text-slate-950 shadow-none focus-visible:ring-2'>
          <Select.Value placeholder={currentLabel} />
        </Select.Trigger>
        <Select.Content>
          {USER_ROLES.map((role) => (
            <Select.Item key={role.id} value={String(role.id)}>
              {role.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}

export function ReadonlyField({
  copyValue,
  icon: Icon,
  label,
  onCopy,
  value,
}: {
  copyValue?: string;
  icon: LucideIcon;
  label: string;
  onCopy?: (value: string) => void | Promise<void>;
  value: string;
}) {
  const isEmpty = value === EMPTY_TEXT;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
        <Icon className='h-4 w-4' />
        {label}
      </div>

      <div className='flex items-center gap-2'>
        <p className='text-lg font-semibold break-all text-slate-950'>
          {value}
        </p>
        {copyValue && !isEmpty && onCopy ? (
          <button
            type='button'
            onClick={() => void onCopy(copyValue)}
            className='rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
            aria-label={`${label} 복사`}
          >
            <Copy className='h-4 w-4' />
          </button>
        ) : null}
      </div>
    </div>
  );
}
