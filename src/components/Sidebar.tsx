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
} from 'lucide-react';
import { snoroseLogo } from '@/assets';
import { cn } from '@/utils';

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        'flex flex-col gap-8 border-r-1 border-gray-200 py-4 transition-all duration-300',
        isSidebarOpen ? 'w-50' : 'w-auto'
      )}
    >
      <div
        className={`flex items-center justify-between px-4.5 transition-all duration-300`}
      >
        <img
          src={snoroseLogo}
          alt='logo'
          className={cn(
            'h-5 transition-all duration-300',
            isSidebarOpen ? 'w-auto opacity-100' : 'hidden opacity-0'
          )}
        />
        <PanelLeft
          size={ICON_SIZE}
          className='cursor-pointer'
          onClick={toggleSidebar}
        />
      </div>
      <ul className='flex flex-col gap-4 text-left'>
        {MENU_ITEMS.map((item) => (
          <li
            key={item.path}
            className={`text-sm hover:text-blue-500 ${location.pathname === item.path ? 'active font-bold text-blue-500' : ''}`}
          >
            <Link to={item.path} className={`flex items-center gap-2 px-4.5`}>
              <item.icon size={ICON_SIZE} />
              <span
                className={cn(
                  isSidebarOpen ? 'opacity-100' : 'hidden opacity-0'
                )}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
