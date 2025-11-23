import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  UserCog,
  BookOpen,
  CircleParking,
  FileText,
  MessageCircle,
  PanelLeft,
  Rose,
} from 'lucide-react';
import { snoroseLogo } from '@/assets';
import { cn } from '@/utils';

export const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const location = useLocation();

  const ICON_SIZE = 16;
  const MENU_ITEMS = [
    { path: '/home', label: '홈 (준비중)', icon: House },
    { path: '/member', label: '회원 정보', icon: UserCog },
    { path: '/exam', label: '시험 후기', icon: BookOpen },
    { path: '/point', label: '포인트 증감', icon: CircleParking },
    {
      path: '/post',
      label: '게시글 관리 (준비중)',
      icon: FileText,
    },
    {
      path: '/comment',
      label: '댓글 관리 (준비중)',
      icon: MessageCircle,
    },
  ];

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
            'box-content h-5 p-2',
            isSidebarOpen ? 'opacity-100' : 'hidden w-0'
          )}
        />
        <PanelLeft
          size={ICON_SIZE}
          onClick={toggleSidebar}
          className='box-content cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-200'
        />
      </div>
      <ul className='flex flex-1 flex-col overflow-y-auto text-left'>
        {MENU_ITEMS.map((item) => (
          <li
            key={item.path}
            className={`py-2 text-sm hover:text-blue-500 ${location.pathname === item.path ? 'active font-bold text-blue-500' : ''}`}
          >
            <Link
              to={item.path}
              className={cn(
                'flex items-center px-4.5',
                isSidebarOpen && 'gap-2'
              )}
            >
              <item.icon size={ICON_SIZE} />
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
        ))}
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
