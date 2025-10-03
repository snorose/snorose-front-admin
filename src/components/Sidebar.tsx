import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/exam', label: '시험 검토' },
    { path: '/member', label: '회원 정보' },
    { path: '/point', label: '포인트 조정' },
  ];

  return (
    <nav className='bg-blue-100 p-4 w-50'>
      <ul className='text-left'>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`${location.pathname === item.path ? 'active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
