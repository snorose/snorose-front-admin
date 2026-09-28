import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, InputGroup, Label } from '@/shared/components/ui';
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
      <div className='flex w-full max-w-lg flex-col items-center justify-center gap-8 rounded-2xl bg-white px-6 py-12 shadow-[0_-2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.10)] sm:px-16 sm:py-20'>
        <div className='flex flex-col items-center gap-2'>
          <img className='h-12 w-auto' src={snoroseLogo} alt='스노로즈 로고' />
          <p className='text-sm text-gray-600'>
            어드민 페이지에 오신 것을 환영합니다
          </p>
        </div>
        <form className='flex w-full flex-col gap-4' onSubmit={handleLogin}>
          <Label htmlFor='id' className='sr-only'>
            스노로즈 아이디
          </Label>
          <Input
            id='id'
            placeholder='스노로즈 아이디'
            name='id'
            autoComplete='username'
            type='text'
            className='h-11 text-sm'
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={isLoading}
          />

          <Label htmlFor='password' className='sr-only'>
            스노로즈 비밀번호
          </Label>
          <InputGroup className='h-11' data-disabled={isLoading}>
            <InputGroup.Input
              id='password'
              placeholder='스노로즈 비밀번호'
              name='password'
              autoComplete='current-password'
              type={showPassword ? 'text' : 'password'}
              className='h-11 text-sm'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <InputGroup.Addon align='inline-end'>
              <InputGroup.Button
                onClick={togglePasswordVisibility}
                size='icon-sm'
                className='text-gray-500'
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-controls='password'
                disabled={isLoading}
              >
                {showPassword ? (
                  <Eye className='size-5' />
                ) : (
                  <EyeOff className='size-5' />
                )}
              </InputGroup.Button>
            </InputGroup.Addon>
          </InputGroup>

          <Button
            type='submit'
            size='lg'
            variant='outline'
            className='h-11 w-full cursor-pointer text-base'
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
