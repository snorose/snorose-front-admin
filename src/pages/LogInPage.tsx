import { useNavigate } from 'react-router-dom';
import { snoroseLogo } from '@/assets';
import { Button } from '@/components/ui/button';

export default function LogInPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/member');
  };

  return (
    <main className='flex flex-col items-center justify-center w-full h-full gap-10'>
      <div>
        <img src={snoroseLogo} alt='logo' />
      </div>

      <div className=' bg-gray-100 p-4'>
        <div>아이디</div>
        <div>비밀번호</div>
      </div>

      <div>
        <Button className='text-black h-20' onClick={handleLogin}>
          로그인
        </Button>
      </div>
    </main>
  );
}
