import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PointAdjustmentPage() {
  return (
    <div className='flex flex-col gap-4 w-full'>
      <h1 className='text-2xl font-bold'>포인트 증감(지급/차감)</h1>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 조회</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='이름, 아이디, 학번 중 하나를 입력해주세요'
            className='w-96'
          />
          <Button type='submit' className='text-black h-10 w-20'>
            <span>검색</span>
          </Button>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>선택된 회원 (총 2명)</h3>
        <div className='flex gap-2 border rounded-md p-2 w-full'>hi</div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트</h3>
        <div className='flex gap-2 border rounded-md p-2 w-full'>hi</div>
      </article>
    </div>
  );
}
