import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib';

import { Button, buttonVariants } from './button';
import { Dialog } from './dialog';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
  confirmDisabled?: boolean;
  isPending?: boolean;
  closeText?: string;
  className?: string;
  footerClassName?: string;
  children?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = '확인',
  confirmVariant = 'default',
  confirmDisabled = false,
  isPending = false,
  closeText = '취소',
  className,
  footerClassName,
  children,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <Dialog.Content
        className={cn('flex max-h-[80dvh] flex-col overflow-hidden', className)}
        showCloseButton={!isPending}
      >
        <Dialog.Header className='shrink-0'>
          <Dialog.Title>{title}</Dialog.Title>
          {description && (
            <Dialog.Description>{description}</Dialog.Description>
          )}
        </Dialog.Header>

        {children && (
          <div className='-m-1 min-h-0 overflow-y-auto p-1'>{children}</div>
        )}

        <Dialog.Footer
          className={cn(
            'grid shrink-0 grid-cols-2 gap-3 sm:grid sm:grid-cols-2 sm:justify-normal',
            footerClassName
          )}
        >
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='h-auto min-h-9 w-full whitespace-normal'
          >
            {closeText}
          </Button>
          <Button
            type='button'
            variant={confirmVariant}
            onClick={() => {
              if (!isPending && !confirmDisabled) onConfirm();
            }}
            disabled={confirmDisabled || isPending}
            className='h-auto min-h-9 w-full whitespace-normal'
          >
            {confirmText}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
