import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import { error404 } from '@/assets';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(PATHS.MEMBER_INFO);
  };

  return (
    <div className='flex min-h-full w-full flex-col items-center justify-center gap-8 text-center'>
      <div className='flex flex-col items-center gap-3'>
        <img
          className='h-auto w-full max-w-[280px]'
          src={error404}
          alt='404 페이지를 찾을 수 없음'
        />
        <h1 className='text-2xl font-semibold text-gray-900'>
          페이지를 찾을 수 없습니다
        </h1>
        <p className='text-md max-w-md leading-6 text-gray-600'>
          주소를 잘못 입력했거나 사용할 수 없는 경로예요.
        </p>
      </div>

      <Button
        type='button'
        size='lg'
        className='min-w-36 !text-white hover:!text-white'
        onClick={handleBackClick}
      >
        이전 페이지로 이동
      </Button>
    </div>
  );
}
