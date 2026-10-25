import { type ComponentProps, type ReactNode, useRef } from 'react';

import { Dialog } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib';

const modalSizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  children?: ReactNode;
  size?: keyof typeof modalSizes;
  className?: string;
  showCloseButton?: boolean;
  /** 저장 중 등 사용자가 모달을 닫으면 안 되는 동안 설정한다. */
  closeDisabled?: boolean;
  /** 포커스 복귀, 외부 클릭 등 Dialog 동작의 개별 조정에 사용한다. */
  contentProps?: Omit<
    ComponentProps<typeof Dialog.Content>,
    'children' | 'className' | 'showCloseButton' | 'title'
  >;
};

/**
 * 제목·설명·닫기 버튼과 모달 외곽 레이아웃을 통일한다.
 * 본문과 사용자 정의 행동은 children으로 구성한다.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  subtitle,
  headerExtra,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeDisabled = false,
  contentProps,
}: ModalProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const hasSubtitle = subtitle != null && subtitle !== false && subtitle !== '';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && closeDisabled) return;
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Content
        {...contentProps}
        {...(!hasSubtitle && { 'aria-describedby': undefined })}
        showCloseButton={showCloseButton && !closeDisabled}
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col gap-0 overflow-hidden p-0',
          modalSizes[size],
          className
        )}
        onOpenAutoFocus={(event) => {
          openerRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          contentProps?.onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          contentProps?.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented && openerRef.current?.isConnected) {
            event.preventDefault();
            openerRef.current.focus();
          }
        }}
        onEscapeKeyDown={(event) => {
          contentProps?.onEscapeKeyDown?.(event);
          if (closeDisabled) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          contentProps?.onInteractOutside?.(event);
          if (closeDisabled) event.preventDefault();
        }}
      >
        <Dialog.Header
          className={cn(
            'shrink-0 px-6 pt-6 pb-4 text-left',
            showCloseButton && !closeDisabled && 'pr-14'
          )}
        >
          <Dialog.Title className='text-lg leading-6 wrap-anywhere'>
            {title}
          </Dialog.Title>
          {hasSubtitle && (
            <Dialog.Description className='leading-5 wrap-anywhere'>
              {subtitle}
            </Dialog.Description>
          )}
          {headerExtra}
        </Dialog.Header>
        {children}
      </Dialog.Content>
    </Dialog>
  );
}
