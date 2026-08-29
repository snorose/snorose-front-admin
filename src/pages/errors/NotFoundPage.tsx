import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import { error404 } from '@/assets';

export default function NotFoundPage() {
  return (
    <div className='flex min-h-full w-full flex-col items-center justify-center gap-8 px-6 py-12 text-center'>
      <img
        className='h-auto w-full max-w-[360px]'
        src={error404}
        alt='404 페이지를 찾을 수 없음'
      />

      <div className='flex flex-col items-center gap-3'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          페이지를 찾을 수 없습니다
        </h1>
        <p className='max-w-md text-sm leading-6 text-gray-600'>
          요청하신 페이지가 삭제되었거나 주소가 변경되었어요. 주소를 다시
          확인하거나 관리자 홈으로 이동해 주세요.
        </p>
      </div>

      <Button asChild size='lg' className='min-w-36'>
        <Link to={PATHS.MEMBER_INFO}>관리자 홈으로 이동</Link>
      </Button>
    </div>
  );
}
