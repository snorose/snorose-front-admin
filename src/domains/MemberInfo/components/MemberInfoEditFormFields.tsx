import { type ReactNode, useId } from 'react';

import { Copy } from 'lucide-react';

import { DatePicker, StatusBadge } from '@/shared/components';
import { Button, Field, Input, Select } from '@/shared/components/ui';

import { USER_ROLES } from '@/domains/MemberInfo/constants/memberInfo';
import {
  EMPTY_TEXT,
  getRoleBadgeMeta,
} from '@/domains/MemberInfo/utils/memberDirectory';
import type { MemberEditFormValues } from '@/domains/MemberInfo/utils/validateMemberEditForm';

export type EditableFieldItem = {
  type: 'editable';
  fieldName: keyof MemberEditFormValues;
  inputType?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export type ReadonlyFieldItem = {
  type: 'readonly';
  copyValue?: string;
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
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string;
  fieldName: keyof MemberEditFormValues;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  const uniqueId = useId();
  const inputId = `${uniqueId}-${fieldName}`;
  const errorId = `${inputId}-error`;

  return (
    <Field className='gap-0' data-invalid={Boolean(error)}>
      <Field.Label
        htmlFor={inputId}
        required
        className={error ? 'text-destructive' : undefined}
      >
        {label}
      </Field.Label>
      <Field.Content>
        {type === 'date' ? (
          <DatePicker
            id={inputId}
            name={fieldName}
            value={value || undefined}
            onValueChange={(nextValue) => onChange(nextValue ?? '')}
            placeholder={placeholder}
            captionLayout='dropdown'
            maxDate={
              fieldName === 'birthday'
                ? `${new Date().getFullYear()}-12-31`
                : undefined
            }
            aria-required='true'
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        ) : (
          <Input
            id={inputId}
            name={fieldName}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-required='true'
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        )}
        {error ? <Field.Error id={errorId}>{error}</Field.Error> : null}
      </Field.Content>
    </Field>
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
  const inputId = useId();
  const roleBadge = getRoleBadgeMeta(Number(value));
  return (
    <Field className='gap-0'>
      <Field.Label htmlFor={inputId} required>
        회원 등급
      </Field.Label>
      <Field.Content>
        <Select value={value} onValueChange={onChange}>
          <Select.Trigger id={inputId} className='w-full' aria-required='true'>
            <Select.Value placeholder={currentLabel}>
              <StatusBadge tone={roleBadge.tone}>{roleBadge.label}</StatusBadge>
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {USER_ROLES.map((role) => (
              <Select.Item
                key={role.id}
                value={String(role.id)}
                textValue={role.name}
              >
                <StatusBadge tone={role.tone}>{role.name}</StatusBadge>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Field.Content>
    </Field>
  );
}

export function ReadonlyField({
  action,
  copyValue,
  label,
  onCopy,
  value,
}: {
  action?: ReactNode;
  copyValue?: string;
  label: string;
  onCopy?: (value: string) => void | Promise<void>;
  value: string;
}) {
  const inputId = useId();

  return (
    <Field className='gap-0'>
      <Field.Label htmlFor={inputId} required>
        {label}
      </Field.Label>
      <Field.Content>
        <div className='flex items-center gap-2'>
          <Input id={inputId} value={value} readOnly className='bg-muted' />
          {copyValue && value !== EMPTY_TEXT && onCopy ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='shrink-0'
              onClick={() => void onCopy(copyValue)}
              aria-label={`${label} 복사`}
            >
              <Copy aria-hidden='true' />
            </Button>
          ) : null}
          {action}
        </div>
      </Field.Content>
    </Field>
  );
}
