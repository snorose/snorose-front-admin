export default function Header() {
  return (
    <header className='bg-background fixed top-0 right-0 left-0 z-10 h-14 w-screen border-b border-gray-200'>
      <div className='mx-auto flex h-full max-w-[1440px] items-center justify-between p-4 px-6'>
        <div className='flex items-center'>
          <img src={snoroseLogo} alt='logo' className='h-6' />
        </div>
        <div>로그아웃</div>
      </div>
    </header>
  );
}
