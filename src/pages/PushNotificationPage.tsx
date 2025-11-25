import { useState } from 'react';
import { Button, Input, Switch, Textarea } from '@/components/ui';

export default function PushNotificationPage() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [isMarketing, setIsMarketing] = useState(false);
  const [isTest, setIsTest] = useState(true);
  const [titleLength, setTitleLength] = useState(0);
  const [bodyLength, setBodyLength] = useState(0);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    setBodyLength(e.target.value.length);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTitleLength(e.target.value.length);
  };

  const handleResetButtonClick = () => {
    setName('');
    setTitle('');
    setTitleLength(0);
    setBody('');
    setBodyLength(0);
    setUrl('');
    setIsMarketing(false);
    setIsTest(true);
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <h1 className='text-2xl font-bold'>푸시 알림 전송</h1>
      <section className='flex gap-4'>
        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>필수 정보</h3>
          <div className='flex w-full flex-col gap-4 rounded-md border p-4'>
            <div className='flex flex-col gap-1'>
              <label htmlFor='name' className='font-semibold'>
                알림명 *
              </label>
              <Input
                type='text'
                id='name'
                placeholder='예: 251013 리뉴얼 1주년 기념 포인트 지급 안내'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className='flex px-1'>
                <p className='text-xs text-gray-500'>내부 확인 및 구분용</p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label htmlFor='title' className='font-semibold'>
                알림 제목 *
              </label>
              <Input
                type='text'
                id='title'
                maxLength={21}
                placeholder='예: 스노로즈 리뉴얼 1주년 기념 포인트'
                value={title}
                onChange={handleTitleChange}
              />
              <div className='flex justify-end px-1'>
                <p className='text-xs text-gray-500'>{titleLength} / 21자</p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label htmlFor='body' className='font-semibold'>
                알림 내용 *
              </label>
              <Textarea
                id='body'
                maxLength={100}
                placeholder='예: 모든 정회원 여러분께 10포인트 선물이 도착했습니다! 지급 내역은 [내정보 &gt; 포인트 내역 보기] 에서 확인하실 수 있습니다. (2025.10.12 19시 기준 정회원 대상)'
                value={body}
                onChange={handleBodyChange}
                className='h-24'
              />
              <div className='flex justify-end px-1'>
                <p className='text-xs text-gray-500'>{bodyLength} / 100자</p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label htmlFor='url' className='font-semibold'>
                알림 클릭 시 연결되는 주소 *
              </label>
              <Input
                type='text'
                id='url'
                value={url || '/'}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className='flex px-1'>
                <p className='text-xs text-gray-500'>
                  기본 주소의 뒷부분 입력 (예:{' '}
                  <a
                    href='https://www.snorose.com/board/notice/post/1863135'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:!underline'
                  >
                    /board/notice/post/1863135
                  </a>
                  )
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>발송 옵션</h3>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between rounded-md border bg-blue-50 p-4'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='isMarketing' className='font-semibold'>
                  광고성 알림 여부 *
                </label>
                <p className='text-sm text-gray-500'>
                  true: 광고성 / false: 정보성
                </p>
              </div>
              <Switch
                id='isMarketing'
                checked={isMarketing}
                onCheckedChange={setIsMarketing}
              />
            </div>
            <div className='flex items-center justify-between rounded-md border bg-blue-50 p-4'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='isTest' className='font-semibold'>
                  테스트 발송 여부 *
                </label>
                <p className='text-sm text-gray-500'>
                  true: 관리자에게만 / false: 전체 발송
                </p>
              </div>
              <Switch
                id='isTest'
                checked={isTest}
                onCheckedChange={setIsTest}
              />
            </div>
          </div>
        </article>
      </section>

      <div className='flex justify-end gap-2'>
        <Button
          type='submit'
          size='lg'
          variant='outline'
          onClick={handleResetButtonClick}
          className='text-md h-10 w-32 cursor-pointer font-bold text-red-400 hover:text-red-400 active:text-red-600'
        >
          초기화
        </Button>
        <Button
          type='submit'
          size='lg'
          variant='outline'
          className='text-md h-10 w-32 cursor-pointer font-bold'
        >
          알림 전송
        </Button>
      </div>
    </div>
  );
}
