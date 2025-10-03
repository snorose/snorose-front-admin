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
    <nav className='bg-blue-100 p-4 w-50 flex flex-col gap-4'>
      <div>
        <img src={snoroseLogo} alt='logo' />
      </div>

      <ul className='text-left flex flex-col gap-1'>
        {MENU_ITEMS.map((item) => (
          <li key={item.path} className='hover:bg-gray-100 rounded-md p-1 px-3'>
            <Link
              to={item.path}
              className={`flex items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`}
            >
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
