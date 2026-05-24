import type { ReactNode } from 'react';

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
  needsCustomReason,
  onCustomReasonChange,
  onReasonChange,
  onWarningCountChange,
  reason,
  warningCount,
}: {
  customReason: string;
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
          onValueChange={onReasonChange}
          options={WARNING_REASON_OPTIONS}
          placeholder='경고 사유 선택'
          value={reason}
        />
        {needsCustomReason ? (
          <Input
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder='사유를 입력하세요'
            className='h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300'
          />
        ) : null}
      </Field>

      <Field label='경고 횟수'>
        <Input
          type='number'
          min={1}
          step={1}
          value={warningCount}
          onChange={(event) =>
            onWarningCountChange(Math.max(1, Number(event.target.value)))
          }
          className='h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300'
        />
      </Field>
    </>
  );
}

export function DemotionFields({
  customReason,
  demotionReason,
  demotionReasonOptions,
  demotionType,
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
          <Select.Trigger className='h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-base font-semibold shadow-none focus:ring-slate-300'>
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
            type='number'
            min={1}
            step={1}
            value={relegationMonth}
            onChange={(event) =>
              onRelegationMonthChange(Math.max(1, Number(event.target.value)))
            }
            className='h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300'
          />
          <p className='text-sm font-semibold text-slate-500'>
            {relegationEndDateTime} 까지 강등
          </p>
        </Field>
      ) : null}

      <Field label='사유'>
        <ReasonSelect
          onValueChange={onDemotionReasonChange}
          options={demotionReasonOptions}
          placeholder='강등 사유 선택'
          value={demotionReason}
        />
        {needsCustomReason ? (
          <Input
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            placeholder='사유를 입력하세요'
            className='h-12 rounded-xl border-0 bg-slate-100 px-4 text-base shadow-none focus-visible:ring-slate-300'
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
  onValueChange,
  options,
  placeholder,
  value,
}: {
  onValueChange: (value: string) => void;
  options: ReasonOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <Select.Trigger className='h-12 w-full rounded-xl border-0 bg-slate-100 px-4 text-base font-semibold shadow-none focus:ring-slate-300'>
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
