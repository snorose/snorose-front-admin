import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input } from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks';

import { snoroseLogo } from '@/assets';

export default function LogInPage() {
  const { login, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    const trimmedLoginId = loginId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedLoginId || !trimmedPassword) {
      toast.info('아이디와 비밀번호를 입력해 주세요.');

      return;
    }

    const result = await login({
      loginId: trimmedLoginId,
      password: trimmedPassword,
    });

    if (!result.success && result.error) {
      toast.error(result.error);

      return;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <div className='flex flex-col items-center justify-center gap-8 rounded-2xl bg-white px-16 py-20 shadow-[0_-2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.10)]'>
        <div className='flex flex-col items-center gap-2'>
          <img className='h-12 w-auto' src={snoroseLogo} alt='스노로즈 로고' />
          <p className='text-sm text-gray-600'>
            어드민 페이지에 오신 것을 환영합니다
          </p>
        </div>
        <form className='flex w-88 flex-col gap-2' onSubmit={handleLogin}>
          <Input
            id='id'
            placeholder='스노로즈 아이디'
            name='id'
            type='text'
            className='h-11 text-base'
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={isLoading}
          />

          <div className='relative'>
            <Input
              id='password'
              placeholder='스노로즈 비밀번호'
              name='password'
              type={showPassword ? 'text' : 'password'}
              className='h-11 text-base'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:cursor-pointer'
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? (
                <Eye className='size-5' />
              ) : (
                <EyeOff className='size-5' />
              )}
            </button>
          </div>

          <Button
            type='submit'
            size='lg'
            variant='outline'
            className='hover: h-11 w-full cursor-pointer text-base'
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          <p className='text-center text-xs text-gray-500'>
            안정적인 이용을 위해 Chrome 또는 Edge 브라우저 사용을 권장합니다.
          </p>
        </form>
      </div>
    </main>
  );
}
