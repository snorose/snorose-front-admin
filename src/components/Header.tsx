import { snoroseLogo } from '@/assets';

export default function Header() {
  return (
    <header className='fixed top-0 left-0 right-0 h-14 w-screen border-b border-gray-200 bg-background z-10'>
      <div className='max-w-[1440px] mx-auto h-full flex justify-between items-center p-4 px-6'>
        <div className='flex items-center'>
          <img src={snoroseLogo} alt='logo' className='h-6' />
        </div>
        <div>로그아웃</div>
      </div>
    </header>
  );
}
