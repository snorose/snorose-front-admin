import { type ReactNode, useId } from 'react';

import { Input, Label, Select } from '@/shared/components/ui';

import type { DemotionType } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import { WARNING_REASON_OPTIONS } from '@/domains/MemberInfo/constants/memberInfo';

type ReasonOption = {
  value: string;
  label: string;
  month?: number;
};

export function WarningFields({
  customReason,
  invalidFieldName,
  needsCustomReason,
  onCustomReasonChange,
  onReasonChange,
  onWarningCountChange,
  reason,
  warningCount,
}: {
  customReason: string;
  invalidFieldName?: string;
  needsCustomReason: boolean;
  onCustomReasonChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onWarningCountChange: (value: number) => void;
  reason: string;
  warningCount: number;
}) {
  const inputId = useId();
  return (
    <>
      <Field label='사유' htmlFor={`${inputId}-reason`}>
        <ReasonSelect
          id={`${inputId}-reason`}
          fieldName='warningReason'
          invalid={invalidFieldName === 'warningReason'}
          onValueChange={onReasonChange}
          options={WARNING_REASON_OPTIONS}
          placeholder='경고 사유 선택'
          value={reason}
        />
        {needsCustomReason ? (
          <Field label='상세 사유' htmlFor={`${inputId}-customReason`}>
            <Input
              id={`${inputId}-customReason`}
              name='customReason'
              aria-invalid={invalidFieldName === 'customReason'}
              value={customReason}
              onChange={(event) => onCustomReasonChange(event.target.value)}
              placeholder='사유를 입력하세요'
            />
          </Field>
        ) : null}
      </Field>

      <Field label='경고 횟수' htmlFor={`${inputId}-warningCount`}>
        <Input
          id={`${inputId}-warningCount`}
          name='warningCount'
          aria-describedby={
            !needsCustomReason ? `${inputId}-count-help` : undefined
          }
          aria-invalid={invalidFieldName === 'warningCount'}
          type='number'
          min={1}
          step={1}
          value={warningCount}
          disabled={!needsCustomReason}
          onChange={(event) =>
            onWarningCountChange(Math.max(1, Number(event.target.value)))
          }
          className='disabled:bg-muted disabled:cursor-not-allowed'
        />
        {!needsCustomReason ? (
          <p
            id={`${inputId}-count-help`}
            className='text-muted-foreground text-sm font-medium'
          >
            선택한 사유의 기본 경고 횟수가 적용됩니다.
          </p>
        ) : null}
      </Field>
    </>
  );
}

export function DemotionFields({
  customReason,
  demotionReason,
  demotionReasonOptions,
  demotionType,
  invalidFieldName,
  needsCustomReason,
  onCustomReasonChange,
  onDemotionReasonChange,
  onDemotionTypeChange,
  onRelegationMonthChange,
  relegationEndDateTime,
  relegationMonth,
}: {
  customReason: string;
  demotionReason: string;
  demotionReasonOptions: ReasonOption[];
  demotionType: DemotionType;
  invalidFieldName?: string;
  needsCustomReason: boolean;
  onCustomReasonChange: (value: string) => void;
  onDemotionReasonChange: (value: string) => void;
  onDemotionTypeChange: (value: string) => void;
  onRelegationMonthChange: (value: number) => void;
  relegationEndDateTime: string;
  relegationMonth: number;
}) {
  const inputId = useId();
  return (
    <>
      <Field label='강등 종류' htmlFor={`${inputId}-demotionType`}>
        <Select value={demotionType} onValueChange={onDemotionTypeChange}>
          <Select.Trigger
            id={`${inputId}-demotionType`}
            data-field-name='demotionType'
            aria-invalid={invalidFieldName === 'demotionType'}
            className='w-full'
          >
            <Select.Value placeholder='강등 종류 선택' />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value='RELEGATION'>일반강등</Select.Item>
            <Select.Item value='BLACKLIST'>영구강등</Select.Item>
          </Select.Content>
        </Select>
      </Field>

      {demotionType === 'RELEGATION' ? (
        <Field label='강등 기간 (월)' htmlFor={`${inputId}-relegationMonth`}>
          <Input
            id={`${inputId}-relegationMonth`}
            name='relegationMonth'
            aria-describedby={`${inputId}-end-date`}
            aria-invalid={invalidFieldName === 'relegationMonth'}
            type='number'
            min={1}
            step={1}
            value={relegationMonth}
            onChange={(event) =>
              onRelegationMonthChange(Math.max(1, Number(event.target.value)))
            }
          />
          <p
            id={`${inputId}-end-date`}
            className='text-muted-foreground text-sm font-semibold'
          >
            {relegationEndDateTime} 까지 강등
          </p>
        </Field>
      ) : null}

      <Field label='사유' htmlFor={`${inputId}-reason`}>
        <ReasonSelect
          id={`${inputId}-reason`}
          fieldName='demotionReason'
          invalid={invalidFieldName === 'demotionReason'}
          onValueChange={onDemotionReasonChange}
          options={demotionReasonOptions}
          placeholder='강등 사유 선택'
          value={demotionReason}
        />
        {needsCustomReason ? (
          <Field label='상세 사유' htmlFor={`${inputId}-customReason`}>
            <Input
              id={`${inputId}-customReason`}
              name='customReason'
              aria-invalid={invalidFieldName === 'customReason'}
              value={customReason}
              onChange={(event) => onCustomReasonChange(event.target.value)}
              placeholder='사유를 입력하세요'
            />
          </Field>
        ) : null}
      </Field>
    </>
  );
}

export function Field({
  children,
  label,
  htmlFor,
}: {
  children: ReactNode;
  label: string;
  htmlFor?: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ReasonSelect({
  id,
  fieldName,
  invalid,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  id: string;
  fieldName: string;
  invalid: boolean;
  onValueChange: (value: string) => void;
  options: ReasonOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <Select.Trigger
        id={id}
        data-field-name={fieldName}
        aria-invalid={invalid}
        className='w-full'
      >
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
