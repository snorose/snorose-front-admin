import { Link, useLocation } from 'react-router-dom';
import {
  House,
  UserCog,
  BookOpen,
  CircleParking,
  FileText,
  MessageCircle,
} from 'lucide-react';

const Sidebar: React.FC = () => {
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

  return (
    <nav className='flex w-50 flex-col border-r-1 border-gray-200 p-4 py-6'>
      <ul className='flex flex-col gap-4 text-left'>
        {MENU_ITEMS.map((item) => (
          <li
            key={item.path}
            className={`text-sm hover:text-blue-500 ${location.pathname === item.path ? 'active font-bold text-blue-500' : ''}`}
          >
            <Link to={item.path} className={`flex items-center gap-2`}>
              <item.icon size={ICON_SIZE} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
