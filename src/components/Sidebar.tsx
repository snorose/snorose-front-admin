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
    <nav className='p-4 flex flex-col gap-4 border-r-1 border-gray-200'>
      <ul className='text-left flex flex-col gap-2'>
        {MENU_ITEMS.map((item) => (
          <li
            key={item.path}
            className={`hover:text-blue-500 ${location.pathname === item.path ? 'text-blue-500 font-bold active' : ''}`}
          >
            <Link to={item.path} className={`flex items-center gap-2 `}>
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
