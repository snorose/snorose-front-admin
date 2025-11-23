import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  UserCog,
  BookOpen,
  CircleParking,
  FileText,
  TriangleAlert,
  PanelLeft,
  Rose,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { snoroseLogo } from '@/assets';
import { cn } from '@/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { SIDEBAR_MENUS } from '@/constants';

const iconMap: Record<string, LucideIcon> = {
  House,
  UserCog,
  BookOpen,
  CircleParking,
  FileText,
  TriangleAlert,
  Settings,
};

export const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const location = useLocation();

  const ICON_SIZE = 16;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav
      className={cn(
        'flex h-screen flex-col border-r-1 border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-48' : 'w-auto'
      )}
    >
      <div
        className={cn(
          'flex items-center px-2.5 py-4',
          isSidebarOpen && 'justify-between'
        )}
      >
        <img
          src={snoroseLogo}
          alt='logo'
          className={cn(
            'box-content h-5 px-1',
            isSidebarOpen ? 'opacity-100' : 'hidden w-0'
          )}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <PanelLeft
              size={ICON_SIZE}
              onClick={toggleSidebar}
              className='box-content cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-200'
            />
          </TooltipTrigger>
          <TooltipContent
            side={isSidebarOpen ? 'top' : 'right'}
            className='text-xs'
          >
            {isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          </TooltipContent>
        </Tooltip>
      </div>

      <ul className='flex flex-1 flex-col overflow-y-auto text-left'>
        {SIDEBAR_MENUS.map((item) => {
          const IconComponent = iconMap[item.icon];
          const isActive =
            item.type === 'single'
              ? location.pathname === item.path
              : item.items.some(
                  (subItem) => location.pathname === subItem.path
                );

          return (
            <li
              key={item.path}
              className={cn(
                'text-sm hover:text-blue-500',
                isActive && 'font-bold text-blue-500'
              )}
            >
              <Link
                to={item.type === 'single' ? item.path : item.items[0].path}
                className={cn(
                  'flex items-center px-2.5',
                  isSidebarOpen && 'gap-1'
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    {IconComponent && (
                      <IconComponent
                        className='box-content cursor-pointer p-2'
                        size={ICON_SIZE}
                      />
                    )}
                  </TooltipTrigger>
                  {!isSidebarOpen && (
                    <TooltipContent
                      side={isSidebarOpen ? 'top' : 'right'}
                      className='text-xs'
                    >
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap',
                    isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className='flex items-center gap-2 border-t border-gray-200 px-4.5 py-4.5'>
        <div
          className={cn(
            'flex cursor-pointer items-center',
            isSidebarOpen && 'gap-2'
          )}
        >
          <Rose size={ICON_SIZE} className='text-red-400' />
          <span
            className={cn(
              'overflow-hidden text-sm whitespace-nowrap',
              isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0'
            )}
          >
            리자 이름
          </span>
        </div>
      </div>
    </nav>
  );
};
