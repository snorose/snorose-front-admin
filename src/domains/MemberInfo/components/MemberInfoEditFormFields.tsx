import { Copy, type LucideIcon, UserRound } from 'lucide-react';

import { Input, Select } from '@/shared/components/ui';

import { USER_ROLES } from '@/domains/MemberInfo/constants/memberInfo';
import { EMPTY_TEXT } from '@/domains/MemberInfo/utils/memberDirectory';

export type EditableFieldItem = {
  type: 'editable';
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
  kind?: 'box' | 'text';
  label: string;
  value: string;
};

export type RoleFieldItem = {
  type: 'role';
  label: string;
  value: string;
};

export type FieldItem = EditableFieldItem | ReadonlyFieldItem | RoleFieldItem;

export function EditableField({
  error,
  icon: Icon,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string;
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
        <Icon className='h-4 w-4' />
        {label}
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 rounded-xl border-0 px-4 text-base font-semibold text-slate-950 shadow-none focus-visible:ring-2 ${
          error ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-slate-100'
        }`}
      />
      {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
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
  kind = 'text',
  label,
  onCopy,
  value,
}: {
  copyValue?: string;
  icon: LucideIcon;
  kind?: 'box' | 'text';
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

      {kind === 'box' ? (
        <div className='rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-950'>
          {value}
        </div>
      ) : (
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
      )}
    </div>
  );
}
