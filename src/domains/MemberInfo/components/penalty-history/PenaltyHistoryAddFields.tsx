import type { ReactNode } from 'react';

import { Input, Label, Select } from '@/shared/components/ui';

import type { DemotionType } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import { WARNING_REASON_OPTIONS } from '@/domains/MemberInfo/constants/memberInfo';

const INVALID_FIELD_CLASS =
  'aria-invalid:border aria-invalid:border-rose-300 aria-invalid:bg-rose-50 aria-invalid:ring-2 aria-invalid:ring-rose-200';

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
  return (
    <>
      <Field label='사유'>
        <ReasonSelect
          fieldName='warningReason'
          invalid={invalidFieldName === 'warningReason'}
          onValueChange={onReasonChange}
          options={WARNING_REASON_OPTIONS}
          placeholder='경고 사유 선택'
          value={reason}
        />
        {needsCustomReason ? (
          <Input
            name='customReason'
            aria-invalid={invalidFieldName === 'customReason'}
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder='사유를 입력하세요'
            className={`h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300 ${INVALID_FIELD_CLASS}`}
          />
        ) : null}
      </Field>

      <Field label='경고 횟수'>
        <Input
          name='warningCount'
          aria-invalid={invalidFieldName === 'warningCount'}
          type='number'
          min={1}
          step={1}
          value={warningCount}
          disabled={!needsCustomReason}
          onChange={(event) =>
            onWarningCountChange(Math.max(1, Number(event.target.value)))
          }
          className={`h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${INVALID_FIELD_CLASS}`}
        />
        {!needsCustomReason ? (
          <p className='text-sm font-medium text-slate-500'>
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
  return (
    <>
      <Field label='강등 종류'>
        <Select value={demotionType} onValueChange={onDemotionTypeChange}>
          <Select.Trigger
            data-field-name='demotionType'
            aria-invalid={invalidFieldName === 'demotionType'}
            className={`h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-base font-semibold shadow-none focus:ring-slate-300 ${INVALID_FIELD_CLASS}`}
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
        <Field label='강등 기간 (월)'>
          <Input
            name='relegationMonth'
            aria-invalid={invalidFieldName === 'relegationMonth'}
            type='number'
            min={1}
            step={1}
            value={relegationMonth}
            onChange={(event) =>
              onRelegationMonthChange(Math.max(1, Number(event.target.value)))
            }
            className={`h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300 ${INVALID_FIELD_CLASS}`}
          />
          <p className='text-sm font-semibold text-slate-500'>
            {relegationEndDateTime} 까지 강등
          </p>
        </Field>
      ) : null}

      <Field label='사유'>
        <ReasonSelect
          fieldName='demotionReason'
          invalid={invalidFieldName === 'demotionReason'}
          onValueChange={onDemotionReasonChange}
          options={demotionReasonOptions}
          placeholder='강등 사유 선택'
          value={demotionReason}
        />
        {needsCustomReason ? (
          <Input
            name='customReason'
            aria-invalid={invalidFieldName === 'customReason'}
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder='사유를 입력하세요'
            className={`h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300 ${INVALID_FIELD_CLASS}`}
          />
        ) : null}
      </Field>
    </>
  );
}

export function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className='space-y-2'>
      <Label className='text-base font-bold text-slate-950'>{label}</Label>
      {children}
    </div>
  );
}

function ReasonSelect({
  fieldName,
  invalid,
  onValueChange,
  options,
  placeholder,
  value,
}: {
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
        data-field-name={fieldName}
        aria-invalid={invalid}
        className={`h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-base font-semibold shadow-none focus:ring-slate-300 ${INVALID_FIELD_CLASS}`}
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
