import { STATUS_COLOR, MANAGER_LIST } from '@/constants/exam-table-options';

// 상태 드롭다운 컴포넌트 (아이콘 + 텍스트)
export const StatusDropdown = ({
  isOpen,
  onStatusSelect,
  onClose,
}: {
  isOpen: boolean;
  onStatusSelect: (statusCode: string, statusName: string) => void;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <ul
      className='absolute top-0 left-full z-50 ml-1 w-48 bg-blue-100 border border-gray-300 rounded-md shadow-lg'
      onClick={(e) => e.stopPropagation()}
    >
      {STATUS_COLOR.map((statusOption) => (
        <li
          key={statusOption.id}
          className='flex items-center px-3 py-2 hover:bg-blue-200 cursor-pointer'
          onClick={() => {
            onStatusSelect(statusOption.code, statusOption.name);
            onClose();
          }}
        >
          <div className={`w-3 h-3 rounded-full ${statusOption.color} mr-2`} />
          <span className='text-sm'>{statusOption.name}</span>
        </li>
      ))}
    </ul>
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
}: {
  isOpen: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  options?: string[];
  position?: 'left' | 'right' | 'bottom';
  width?: string;
  selectedValues?: string[];
}) => {
  if (!isOpen) return null;

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

  return (
    <ul
      className={`absolute ${getPositionClasses()} z-50 ${width} max-h-[200px] overflow-y-scroll bg-blue-100 border border-gray-300 rounded-md shadow-lg`}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option);
        return (
          <li
            key={index}
            className={`flex items-center px-3 py-2 hover:bg-blue-200 cursor-pointer ${
              isSelected ? 'bg-blue-100' : ''
            }`}
            onClick={() => {
              onSelect(option); // 헤더 필터인 경우 - 다중선택 위해 선택했을 때 드롭다운 닫지 않음
              if (selectedValues && selectedValues.length >= 0) {
                return;
              }
              onClose();
            }}
          >
            <span
              className={`text-sm flex-1 ${isSelected ? 'font-bold' : 'font-medium'}`}
            >
              {option}
            </span>
            {isSelected && (
              <span className='text-blue-600 ml-2 text-sm'>✓</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
