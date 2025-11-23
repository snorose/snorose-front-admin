import { useNavigate } from 'react-router-dom';
import { snoroseLogo } from '@/assets';
import { Button, Input } from '@/components/ui';

export default function LogInPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/member');
  };

  // TODO: 아이디, 비밀번호에 required 추가 (현재 주석 처리)
  return (
    <main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
      <div className='flex flex-col items-center justify-center gap-8 rounded-2xl bg-white px-16 py-20 shadow-sm'>
        <div className='flex flex-col items-center gap-2'>
          <img className='h-12 w-auto' src={snoroseLogo} alt='스노로즈 로고' />
          <p className='text-sm text-gray-600'>
            어드민 페이지에 오신 것을 환영합니다
          </p>
        </div>
        <form className='flex w-80 flex-col gap-2' onSubmit={handleLogin}>
          <Input
            id='id'
            placeholder='스노로즈 아이디'
            name='id'
            type='text'
            className='h-11 text-base'
            // required
          />

          <Input
            id='password'
            placeholder='스노로즈 비밀번호'
            name='password'
            type='password'
            className='h-11 text-base'
            // required
          />

          <Button
            type='submit'
            size='lg'
            variant='outline'
            className='hover: h-11 w-full cursor-pointer text-base'
          >
            로그인
          </Button>
        </form>
      </div>
    </main>
  );
}
