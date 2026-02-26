import { Dialog, Button } from '@/shared/components/ui';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  closeText?: string;
  children?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = '확인',
  closeText = '취소',
  children,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          {description && (
            <Dialog.Description>{description}</Dialog.Description>
          )}
        </Dialog.Header>

        {children && <div className='py-4'>{children}</div>}

        <Dialog.Footer>
          <Button type='button' variant='outline' onClick={onClose}>
            {closeText}
          </Button>
          <Button type='button' onClick={onConfirm}>
            {confirmText}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
