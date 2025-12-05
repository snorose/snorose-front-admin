import { STATUS_COLOR, MANAGER_LIST } from '@/constants/exam-table-options';
import { useEffect, useRef } from 'react';

// 상태 드롭다운 컴포넌트 (아이콘 + 텍스트)
export const StatusDropdown = ({
  isOpen,
  onStatusSelect,
  onClose,
  children,
}: {
  isOpen: boolean;
  onStatusSelect: (statusCode: string, statusName: string) => void;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const tableContainer = dropdownRef.current.closest(
        '[data-slot="table-container"]'
      );
      const tableRect = tableContainer?.getBoundingClientRect();

      if (tableRect && rect.bottom > tableRect.bottom) {
        dropdownRef.current.style.top = 'auto';
        dropdownRef.current.style.bottom = '0';
        dropdownRef.current.style.marginBottom = '4px';
      } else if (rect.bottom > viewportHeight) {
        dropdownRef.current.style.top = 'auto';
        dropdownRef.current.style.bottom = '100%';
        dropdownRef.current.style.marginBottom = '4px';
      } else {
        dropdownRef.current.style.top = '0';
        dropdownRef.current.style.bottom = 'auto';
        dropdownRef.current.style.marginBottom = '0';
      }
    }
  }, [isOpen]);

  if (!isOpen) return <>{children}</>;

  return (
    <>
      {children}
      <ul
        ref={dropdownRef}
        className='absolute top-0 left-full z-50 ml-1 w-48 rounded-md border border-gray-400 bg-white shadow-[5px_5px_10px_6px_rgba(0,0,0,0.1)]'
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_COLOR.map((statusOption) => (
          <li
            key={statusOption.id}
            className='flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100'
            onClick={() => {
              onStatusSelect(statusOption.code, statusOption.name);
              onClose();
            }}
          >
            <div
              className={`h-3 w-3 rounded-full ${statusOption.color} mr-2`}
            />
            <span className='text-sm'>{statusOption.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

// 텍스트 드롭다운 컴포넌트
export const TextDropdown = ({
  isOpen,
  onSelect,
  onClose,
  options = MANAGER_LIST,
  position = 'right',
  width = 'w-24',
  selectedValues = [],
  children,
}: {
  isOpen: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  options?: string[];
  position?: 'left' | 'right' | 'bottom';
  width?: string;
  selectedValues?: string[];
  children?: React.ReactNode;
}) => {
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const tableContainer = dropdownRef.current.closest(
        '[data-slot="table-container"]'
      );
      const tableRect = tableContainer?.getBoundingClientRect();

      if (position === 'bottom') {
        if (tableRect && rect.bottom > tableRect.bottom) {
          dropdownRef.current.style.top = 'auto';
          dropdownRef.current.style.bottom = '100%';
          dropdownRef.current.style.marginBottom = '4px';
          dropdownRef.current.style.marginTop = '0';
        } else if (rect.bottom > viewportHeight) {
          dropdownRef.current.style.top = 'auto';
          dropdownRef.current.style.bottom = '100%';
          dropdownRef.current.style.marginBottom = '4px';
          dropdownRef.current.style.marginTop = '0';
        } else {
          dropdownRef.current.style.top = '';
          dropdownRef.current.style.bottom = '';
          dropdownRef.current.style.marginBottom = '';
          dropdownRef.current.style.marginTop = '';
        }
      } else {
        if (tableRect && rect.bottom > tableRect.bottom) {
          dropdownRef.current.style.top = 'auto';
          dropdownRef.current.style.bottom = '0';
          dropdownRef.current.style.marginBottom = '4px';
        } else if (rect.bottom > viewportHeight) {
          dropdownRef.current.style.top = 'auto';
          dropdownRef.current.style.bottom = '0';
          dropdownRef.current.style.marginBottom = '4px';
        } else {
          dropdownRef.current.style.top = '';
          dropdownRef.current.style.bottom = '';
          dropdownRef.current.style.marginBottom = '';
        }
      }
    }
  }, [isOpen, position]);

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'top-0 right-full mr-1';
      case 'right':
        return 'top-0 left-full ml-1';
      case 'bottom':
        return 'top-full left-0 mt-1';
      default:
        return 'top-0 right-full mr-1';
    }
  };

  if (!isOpen) return <>{children}</>;

  return (
    <>
      {children}
      <ul
        ref={dropdownRef}
        className={`absolute ${getPositionClasses()} z-50 ${width} max-h-[200px] overflow-y-scroll rounded-md border border-gray-300 bg-blue-100 shadow-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option);
          return (
            <li
              key={index}
              className={`flex cursor-pointer items-center px-3 py-2 hover:bg-blue-200 ${
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
                className={`flex-1 text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}
              >
                {option}
              </span>
              {isSelected && (
                <span className='ml-2 text-sm text-blue-600'>✓</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
