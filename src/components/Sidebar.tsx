import { Link, useLocation } from 'react-router-dom';
import { HiBookOpen, HiChatAlt, HiDocumentText } from 'react-icons/hi';
import { BiCoinStack } from 'react-icons/bi';
import { FaUserCog } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const MENU_ITEMS = [
    { path: '/member', label: '회원 정보', icon: <FaUserCog /> },
    { path: '/exam', label: '시험 후기', icon: <HiBookOpen /> },
    { path: '/point', label: '포인트 증감', icon: <BiCoinStack /> },
    { path: '/post', label: '게시글 관리 (준비중)', icon: <HiDocumentText /> },
    {
      path: '/comment',
      label: '댓글 관리 (준비중)',
      icon: <HiChatAlt />,
    },
  ];

  return (
    <nav className='flex w-50 flex-col border-r-1 border-gray-200 p-4 py-6'>
      <ul className='flex flex-col gap-4 text-left'>
        {MENU_ITEMS.map((item) => (
          <li
            key={item.path}
            className={`text-base hover:text-blue-500 ${location.pathname === item.path ? 'active font-bold text-blue-500' : ''}`}
          >
            <Link to={item.path} className={`flex items-center gap-2`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
