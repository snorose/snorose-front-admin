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
  closeText = '취소',
  className,
  children,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content
        className={cn('flex max-h-[80dvh] flex-col overflow-hidden', className)}
      >
        <Dialog.Header className='shrink-0'>
          <Dialog.Title>{title}</Dialog.Title>
          {description && (
            <Dialog.Description>{description}</Dialog.Description>
          )}
        </Dialog.Header>

        {children && <div className='min-h-0 overflow-y-auto'>{children}</div>}

        <Dialog.Footer className='shrink-0'>
          <Button type='button' variant='outline' onClick={onClose}>
            {closeText}
          </Button>
          <Button
            type='button'
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
