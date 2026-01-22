import { STATUS_COLOR } from '@/constants';
import * as Popover from '@radix-ui/react-popover';
import React, { useEffect } from 'react';

// 상태 드롭다운 컴포넌트 (아이콘 + 텍스트)
export const StatusDropdown = ({
  isOpen,
  onStatusSelect,
  onClose,
  triggerRef,
  contentRef,
  position = 'bottom',
  children,
}: {
  isOpen: boolean;
  onStatusSelect: (statusCode: string, statusName: string) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  contentRef?: React.RefObject<HTMLDivElement>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}) => {
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!isOpen || !triggerRef || !contentRef) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        onClose();
      }
    };

    // 약간의 지연을 두어 현재 클릭 이벤트가 처리된 후에 리스너 추가
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef, contentRef]);

  // Radix Popover의 side prop에 맞게 변환
  const getPopoverSide = (): 'top' | 'bottom' | 'left' | 'right' => {
    return position;
  };

  // Radix Popover의 align prop에 맞게 변환
  // top/bottom: 왼쪽 정렬 (start), left/right: 상단 정렬 (start)
  const getPopoverAlign = (): 'start' | 'center' | 'end' => {
    return 'start';
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {triggerRef && children ? (
        <Popover.Anchor asChild>
          {React.cloneElement(
            children as React.ReactElement,
            {
              ref: (node: HTMLElement | null) => {
                if (
                  triggerRef &&
                  typeof triggerRef === 'object' &&
                  'current' in triggerRef
                ) {
                  (
                    triggerRef as React.MutableRefObject<HTMLElement | null>
                  ).current = node;
                }
              },
            } as React.Attributes & { ref?: (node: HTMLElement | null) => void }
          )}
        </Popover.Anchor>
      ) : null}
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          side={getPopoverSide()}
          sideOffset={4}
          align={getPopoverAlign()}
          collisionPadding={8}
          className='z-[9999] w-28 rounded-md border border-gray-300 bg-white shadow-lg ring-0 outline-none focus:ring-0 focus:outline-none data-[state=closed]:animate-none data-[state=open]:animate-none'
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            {STATUS_COLOR.map((statusOption) => (
              <li
                key={statusOption.id}
                className='flex cursor-pointer items-center rounded-md px-3 py-1.5 hover:bg-gray-100'
                onClick={() => {
                  onStatusSelect(statusOption.code, statusOption.name);
                  onClose();
                }}
              >
                <div
                  className={`h-2 w-2 rounded-full ${statusOption.color} mr-2`}
                />
                <span className='text-[10px]'>{statusOption.name}</span>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

// 텍스트 드롭다운 컴포넌트
export const TextDropdown = ({
  isOpen,
  onSelect,
  onClose,
  options = [],
  position = 'bottom',
  width = 'w-24',
  selectedValues = [],
  triggerRef,
  contentRef,
  children,
}: {
  isOpen: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  options?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  selectedValues?: string[];
  triggerRef?: React.RefObject<HTMLElement | null>;
  contentRef?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}) => {
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!isOpen || !triggerRef || !contentRef) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        onClose();
      }
    };

    // 약간의 지연을 두어 현재 클릭 이벤트가 처리된 후에 리스너 추가
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef, contentRef]);

  // Radix Popover의 side prop에 맞게 변환
  const getPopoverSide = (): 'top' | 'bottom' | 'left' | 'right' => {
    return position;
  };

  // Radix Popover의 align prop에 맞게 변환
  // top/bottom: 왼쪽 정렬 (start), left/right: 상단 정렬 (start)
  const getPopoverAlign = (): 'start' | 'center' | 'end' => {
    return 'start';
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {triggerRef && children ? (
        <Popover.Anchor asChild>
          {React.cloneElement(
            children as React.ReactElement,
            {
              ref: (node: HTMLElement | null) => {
                if (
                  triggerRef &&
                  typeof triggerRef === 'object' &&
                  'current' in triggerRef
                ) {
                  (
                    triggerRef as React.MutableRefObject<HTMLElement | null>
                  ).current = node;
                }
              },
            } as React.Attributes & { ref?: (node: HTMLElement | null) => void }
          )}
        </Popover.Anchor>
      ) : null}
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          side={getPopoverSide()}
          sideOffset={4}
          align={getPopoverAlign()}
          collisionPadding={8}
          // 하단이 잘리면 자동으로 위쪽으로 이동
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={`${width} z-[9999] max-h-[200px] overflow-y-scroll rounded-md border border-gray-300 bg-blue-100 shadow-lg ring-0 outline-none focus:ring-0 focus:outline-none data-[state=closed]:animate-none data-[state=open]:animate-none`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            {options.map((option, index) => {
              const isSelected = selectedValues.includes(option);
              return (
                <li
                  key={index}
                  className={`flex cursor-pointer items-center px-3 py-1.5 hover:bg-blue-200 ${
                    isSelected ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => {
                    onSelect(option);
                    if (selectedValues && selectedValues.length >= 0) {
                      return;
                    }
                    onClose();
                  }}
                >
                  <span
                    className={`flex-1 text-[10px] ${isSelected ? 'font-bold' : 'font-medium'}`}
                  >
                    {option}
                  </span>
                  {isSelected && (
                    <span className='ml-2 text-[10px] text-blue-600'>✓</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
