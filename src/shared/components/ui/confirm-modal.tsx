import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

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
  pendingText?: string;
  closeText?: string;
  className?: string;
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
  pendingText = '처리 중…',
  closeText = '취소',
  className,
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
        closeButtonDisabled={isPending}
        aria-busy={isPending}
        {...(!description && { 'aria-describedby': undefined })}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <Dialog.Header className='shrink-0 pr-8'>
          <Dialog.Title>{title}</Dialog.Title>
          {description && (
            <Dialog.Description>{description}</Dialog.Description>
          )}
        </Dialog.Header>

        {children && (
          <div className='min-h-0 overflow-y-auto overscroll-contain text-sm'>
            {children}
          </div>
        )}

        <Dialog.Footer className='shrink-0'>
          <Button
            type='button'
            variant='outline'
            size='default'
            onClick={onClose}
            disabled={isPending}
          >
            {closeText}
          </Button>
          <Button
            type='button'
            variant={confirmVariant}
            size='default'
            onClick={onConfirm}
            disabled={confirmDisabled || isPending}
          >
            {isPending && (
              <Loader2
                aria-hidden='true'
                className='animate-spin motion-reduce:animate-none'
              />
            )}
            <span role='status'>{isPending ? pendingText : confirmText}</span>
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
