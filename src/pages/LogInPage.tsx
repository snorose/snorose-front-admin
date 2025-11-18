import { useNavigate } from 'react-router-dom';
import { snoroseLogo } from '@/assets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LogInPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/member');
  };

  return (
    <main className='flex flex-col items-center justify-center w-full h-full gap-4'>
      <div className='w-full p-4 flex justify-center items-center flex-col gap-4'>
        <img className='w-64' src={snoroseLogo} alt='logo' />
        <p className='text-lg text-center'>
          스노로즈 어드민 페이지에 오신 것을 환영합니다.
        </p>
      </div>

      <form className='p-4 flex flex-col gap-4 w-80' onSubmit={handleLogin}>
        <div className='flex flex-col gap-1'>
          <label htmlFor='id' className='text-lg'>
            아이디
          </label>
          <Input
            id='id'
            placeholder='아이디를 입력하세요'
            name='id'
            type='text'
            className='h-10'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label htmlFor='password' className='text-lg'>
            비밀번호
          </label>
          <Input
            id='password'
            placeholder='비밀번호를 입력하세요'
            name='password'
            type='password'
            className='h-10'
          />
        </div>
        <Button type='submit' className='text-black h-10 text-lg'>
          <span>로그인</span>
        </Button>
      </form>
    </main>
  );
}
