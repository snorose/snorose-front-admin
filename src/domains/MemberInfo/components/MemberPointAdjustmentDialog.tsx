import { type ReactNode, useState } from 'react';

import { CheckCircle, Coins, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  Input,
  Select,
  Textarea,
} from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import type { MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import { postSinglePointAPI } from '@/apis';

// import MemberPointAdjustmentConfirmDialog from './MemberPointAdjustmentConfirmDialog';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

type MemberPointAdjustmentDialogProps = {
  member: MemberInfo;
  onAdjusted?: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const CUSTOM_CATEGORY_VALUE = 'ETC';

export default function MemberPointAdjustmentDialog({
  member,
  onAdjusted,
  onOpenChange,
  open,
}: MemberPointAdjustmentDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    PointCategoryValue | ''
  >('');
  const [customCategory, setCustomCategory] = useState('');
  const [difference, setDifference] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isCustomCategory = selectedCategory === CUSTOM_CATEGORY_VALUE;
  const selectedOption = selectedCategory
    ? POINT_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)
    : undefined;
  const isAutoFilled = selectedOption?.points !== null && !!selectedOption;
  const displayCategory = isCustomCategory
    ? customCategory.trim()
    : (selectedOption?.label ?? '');
  const previewDifference = Number(difference);
  const hasPointPreview =
    difference.trim() !== '' &&
    Number.isFinite(previewDifference) &&
    previewDifference !== 0;
  const isPreviewReward = previewDifference > 0;

  const resetForm = () => {
    setSelectedCategory('');
    setCustomCategory('');
    setDifference('');
    setMemo('');
    // setIsConfirmOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleCategoryChange = (value: PointCategoryValue) => {
    setSelectedCategory(value);
    setCustomCategory('');

    const nextOption = POINT_CATEGORY_OPTIONS.find(
      (option) => option.value === value
    );

    if (nextOption && nextOption.points !== null) {
      setDifference(nextOption.points.toString());
    } else {
      setDifference('');
    }
  };

  const validateForm = () => {
    if (isCustomCategory && !customCategory.trim()) {
      toast.error('카테고리를 입력해주세요.');
      return false;
    }

    if (!selectedCategory || !difference || !memo.trim()) {
      toast.info('모든 필수 항목을 입력해주세요.');
      return false;
    }

    const parsedDifference = Number(difference);
    if (!Number.isFinite(parsedDifference)) {
      toast.error('포인트를 입력해주세요.');
      return false;
    }

    if (!Number.isInteger(parsedDifference)) {
      toast.error('포인트는 정수만 입력할 수 있습니다.');
      return false;
    }

    if (parsedDifference === 0) {
      toast.error('0 포인트는 지급 될 수 없습니다.');
      return false;
    }

    return true;
  };

  const handleApply = () => {
    if (!validateForm()) {
      return;
    }

    void handleSubmit();
    // 확인 팝업을 다시 사용할 경우 아래 로직으로 복구합니다.
    // setIsConfirmOpen(true);
  };

  const handleSubmit = async () => {
    const parsedDifference = Number(difference);

    try {
      setIsSubmitting(true);
      await postSinglePointAPI({
        encryptedUserId: member.encryptedUserId,
        difference: parsedDifference,
        category: selectedCategory,
        source: 'ADMIN',
        memo: isCustomCategory
          ? `[기타 카테고리] ${customCategory.trim()}\n${memo.trim()}`
          : memo.trim(),
      });
      const isReward = parsedDifference > 0;
      toast(
        `${member.userName}님에게 ${Math.abs(parsedDifference).toLocaleString()}P를 ${
          isReward ? '지급' : '차감'
        }했습니다. 카테고리: ${displayCategory}`,
        {
          icon: (
            <CheckCircle
              className={`h-5 w-5 ${isReward ? 'text-green-600' : 'text-red-600'}`}
            />
          ),
          style: {
            background: isReward ? '#F0FDF4' : '#FEF2F2',
            borderColor: isReward ? '#86EFAC' : '#FCA5A5',
            color: isReward ? '#166534' : '#991B1B',
          },
        }
      );
      await onAdjusted?.();
      handleOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, '포인트 지급/차감에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Dialog.Content className='rounded-2xl sm:max-w-xl'>
          <Dialog.Header>
            <Dialog.Title className='flex items-center gap-2 text-2xl'>
              <Coins className='h-6 w-6' />
              포인트 지급/차감
            </Dialog.Title>
            <Dialog.Description className='text-base'>
              양수를 입력하면 지급, 음수를 입력하면 차감됩니다.
            </Dialog.Description>
          </Dialog.Header>

          <div className='space-y-5 py-2'>
            {/* <div className='rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700'>
              현재 보유 포인트: {member.pointBalance.toLocaleString()}P
            </div> */}

            <Field label='카테고리' required>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <Select.Trigger className='h-12 w-full rounded-xl bg-slate-50'>
                  <Select.Value placeholder='카테고리를 선택해주세요' />
                </Select.Trigger>
                <Select.Content>
                  {POINT_CATEGORY_OPTIONS.map(({ label, value }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Field>

            {isCustomCategory ? (
              <Field label='카테고리 직접 입력' required>
                <Input
                  type='text'
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  placeholder='카테고리를 입력해주세요'
                  className='h-12 rounded-xl bg-slate-50'
                />
              </Field>
            ) : null}

            <Field label='포인트 수량' required>
              <Input
                type='number'
                step={1}
                value={difference}
                onChange={(event) => setDifference(event.target.value)}
                placeholder='예: 100 (지급) 또는 -50 (차감)'
                readOnly={isAutoFilled}
                className={`h-12 rounded-xl bg-slate-50 ${
                  isAutoFilled ? 'cursor-not-allowed' : ''
                }`}
              />
              {hasPointPreview ? (
                <div
                  className={`mt-3 flex items-center gap-1 text-lg font-semibold ${
                    isPreviewReward ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPreviewReward ? (
                    <TrendingUp className='h-5 w-5' />
                  ) : (
                    <TrendingDown className='h-5 w-5' />
                  )}
                  <span>
                    {Math.abs(previewDifference).toLocaleString()}P{' '}
                    {isPreviewReward ? '지급' : '차감'}
                  </span>
                </div>
              ) : null}
            </Field>

            <Field label='메모' required>
              <Textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder='메모를 입력해주세요'
                className='min-h-28 resize-none rounded-xl bg-slate-50'
              />
            </Field>
          </div>

          <Dialog.Footer>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl'
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type='button'
              className='rounded-xl bg-slate-950 text-white hover:bg-slate-800'
              onClick={handleApply}
              disabled={isSubmitting}
            >
              <Coins className='h-4 w-4' />
              지급
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      {/* <MemberPointAdjustmentConfirmDialog
        category={displayCategory}
        difference={difference}
        isSubmitting={isSubmitting}
        member={member}
        memo={memo}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSubmit}
        open={isConfirmOpen}
      /> */}
    </>
  );
}

function Field({
  children,
  label,
  required = false,
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className='block space-y-2'>
      <span className='text-sm font-bold text-slate-900'>
        {label}
        {required ? <span className='ml-1 text-red-500'>*</span> : null}
      </span>
      {children}
    </label>
  );
}
