import type { ReactNode } from 'react';

import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { Modal, type ModalProps } from '@/shared/components/Modal';

import { Button, buttonVariants } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
  confirmDisabled?: boolean;
  isPending?: boolean;
  pendingText?: string;
  size?: ModalProps['size'];
  closeText?: string;
  className?: string;
  children?: ReactNode;
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
  pendingText,
  size,
  closeText = '취소',
  className,
  children,
}: ConfirmModalProps) {
  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={title}
      subtitle={description}
      size={size}
      className={className}
      closeDisabled={isPending}
    >
      {children != null && <Modal.Body>{children}</Modal.Body>}

      <Modal.Footer>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={isPending}
        >
          {closeText}
        </Button>
        <Button
          type='button'
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={confirmDisabled || isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 aria-hidden='true' className='animate-spin' />}
          {isPending ? (pendingText ?? confirmText) : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
