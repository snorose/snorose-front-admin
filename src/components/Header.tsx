import { snoroseLogo } from '@/assets';

export default function Header() {
  return (
    <header className='h-20 border-b-1 border-gray-200 flex justify-between items-center p-4 px-6'>
      <div className='flex items-center'>
        <img src={snoroseLogo} alt='logo' className='h-8' />
      </div>
      <div>로그아웃</div>
    </header>
  );
}
