import type { ComponentProps, ReactNode } from 'react';

import { Button, Dialog } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import { DescriptionList, type DescriptionListProps } from './DescriptionList';

export interface DescriptionListModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  items: DescriptionListProps['items'];
  cancelLabel?: string;
  compactCancel?: boolean;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ComponentProps<typeof Button>['variant'];
    disabled?: boolean;
    pendingLabel?: string;
  };
  isPending?: boolean;
  className?: string;
}

export function DescriptionListModal({
  open,
  onClose,
  title,
  description,
  items,
  cancelLabel = '취소',
  compactCancel = false,
  action,
  isPending = false,
  className,
}: DescriptionListModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onClose();
      }}
    >
      <Dialog.Content
        className={className}
        showCloseButton={!isPending}
        {...(description == null ? { 'aria-describedby': undefined } : {})}
      >
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          {description != null && (
            <Dialog.Description>{description}</Dialog.Description>
          )}
        </Dialog.Header>
        <DescriptionList items={items} />
        <Dialog.Footer
          className={cn(
            'grid gap-3 sm:grid sm:justify-normal',
            action
              ? compactCancel
                ? 'grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-1'
          )}
        >
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='h-auto min-h-9 w-full whitespace-normal'
          >
            {cancelLabel}
          </Button>
          {action && (
            <Button
              type='button'
              variant={action.variant}
              onClick={action.onClick}
              disabled={isPending || action.disabled}
              className='h-auto min-h-9 w-full whitespace-normal'
            >
              {isPending ? (action.pendingLabel ?? '처리 중...') : action.label}
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
