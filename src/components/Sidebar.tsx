import { Link, useLocation } from 'react-router-dom';
import { snoroseLogo } from '@/assets';
import { FaBookOpen, FaMoneyBillWave, FaUserGear } from 'react-icons/fa6';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const MENU_ITEMS = [
    { path: '/member', label: '회원 정보', icon: <FaUserGear /> },
    { path: '/exam', label: '시험 후기', icon: <FaBookOpen /> },
    { path: '/point', label: '포인트 증감', icon: <FaMoneyBillWave /> },
  ];

  return (
    <nav className='p-4 w-50 flex flex-col gap-4 border-r-2 border-gray-200'>
      <div>
        <img src={snoroseLogo} alt='logo' />
      </div>

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
