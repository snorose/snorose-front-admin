import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/shared/components/ui';

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className='py-4'>{children}</div>}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            {closeText}
          </Button>
          <Button type='button' onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
