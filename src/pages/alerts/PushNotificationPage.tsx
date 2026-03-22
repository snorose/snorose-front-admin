import { useState } from 'react';

import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import {
  Button,
  Input,
  Label,
  RadioGroup,
  Textarea,
} from '@/shared/components/ui';
import type { PushNotification } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import { PushNotificationConfirmModal } from '@/domains/Alerts/components';

import { postPushNotificationAPI } from '@/apis';

const PUSH_BASE_URL = 'https://www.snorose.com';

/** 내부 URL 모드에서 도메인까지 붙여 입력한 경우 (경로만 보내야 함) */
function isSnoroseSiteAbsoluteUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const { hostname } = new URL(trimmed);
    return hostname === 'www.snorose.com' || hostname === 'snorose.com';
  } catch {
    return false;
  }
}

/** 내부 URL(경로)이면 스노로즈 도메인을 붙이고, 외부 URL(http(s)://)이면 그대로 둠 */
function toAbsolutePushUrl(url: string): string {
  const trimmed = (url || '/').trim() || '/';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${PUSH_BASE_URL}${path}`;
}

const INITIAL_FORM_DATA: PushNotification = {
  name: '',
  title: '',
  body: '',
  url: '/',
  isMarketing: true,
  isTest: true,
};

/** 알림 링크: 스노로즈 내부(경로만) vs 외부(전체 URL) */
type UrlInputType = 'internal' | 'external';

export default function PushNotificationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PushNotification>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInputType, setUrlInputType] = useState<UrlInputType>('internal');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      title: e.target.value,
    });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      body: e.target.value,
    });
  };

  const handleResetButtonClick = () => {
    setFormData(INITIAL_FORM_DATA);
    setUrlInputType('internal');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, url: e.target.value });
  };

  const handleApplyButtonClick = () => {
    if (
      !formData.name.trim() ||
      !formData.title.trim() ||
      !formData.body.trim()
    ) {
      toast.info('모든 필수 항목을 입력해주세요.');
      return;
    }

    const urlToCheck = (formData.url || '/').trim() || '/';

    if (urlInputType === 'internal') {
      if (isSnoroseSiteAbsoluteUrl(urlToCheck)) {
        toast.info(
          '기본 주소("https://www.snorose.com")를 제외한 경로만 입력해 주세요.'
        );
        return;
      }
      const isHttpUrl =
        urlToCheck.startsWith('http://') || urlToCheck.startsWith('https://');
      if (!isHttpUrl && urlToCheck !== '/' && !urlToCheck.startsWith('/')) {
        toast.info(
          '스노로즈 내부 주소는 슬래시("/")로 시작해 주세요. (예: /board/notice/post/1863135)'
        );
        return;
      }
    } else {
      if (
        !urlToCheck.startsWith('http://') &&
        !urlToCheck.startsWith('https://')
      ) {
        toast.info(
          '외부 URL은 http:// 또는 https://로 시작하는 전체 주소를 입력해 주세요.'
        );
        return;
      }
    }

    setIsOpen(true);
  };

  const handleConfirmModalButtonClick = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await postPushNotificationAPI({
        ...formData,
        url: toAbsolutePushUrl(formData.url ?? ''),
      });
      toast.success('푸시 알림 전송이 완료되었어요.');
      handleResetButtonClick();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '푸시 알림 전송에 실패했어요.'));
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='푸시 알림 전송'
        description='푸시 알림을 허용한 회원을 대상으로 전송할 수 있어요.'
      />
      <section className='flex gap-4'>
        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>필수 정보</h3>
          <div className='flex w-full flex-col gap-4 rounded-md border p-4 pb-5'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='name' required>
                알림명
              </Label>
              <Input
                type='text'
                id='name'
                placeholder='예: 251013 리뉴얼 1주년 기념 포인트 지급 안내'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <div className='flex px-1'>
                <p className='text-xs text-gray-500'>내부 확인 및 구분용</p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='title' required>
                알림 제목
              </Label>
              <Input
                type='text'
                id='title'
                maxLength={21}
                placeholder='예: 스노로즈 리뉴얼 1주년 기념 포인트'
                value={formData.title}
                onChange={handleTitleChange}
              />
              <div className='flex justify-end px-1'>
                <p className='text-xs text-gray-500'>
                  {formData.title.length} / 21자
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='body' required>
                알림 내용
              </Label>
              <Textarea
                id='body'
                maxLength={100}
                placeholder='예: 모든 정회원 여러분께 10포인트 선물이 도착했습니다! 지급 내역은 [내정보 &gt; 포인트 내역 보기] 에서 확인하실 수 있습니다. (2025.10.12 19시 기준 정회원 대상)'
                value={formData.body}
                onChange={handleBodyChange}
                className='h-28'
              />
              <div className='flex justify-end px-1'>
                <p className='text-xs text-gray-500'>
                  {formData.body.length} / 100자
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='url' required>
                알림 클릭 시 연결되는 주소
              </Label>
              <RadioGroup
                value={urlInputType}
                onValueChange={(v) => setUrlInputType(v as UrlInputType)}
                className='mb-1 flex gap-4'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroup.Item value='internal' id='url-internal' />
                  <Label
                    htmlFor='url-internal'
                    className='cursor-pointer font-normal'
                  >
                    스노로즈 내부 URL
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroup.Item value='external' id='url-external' />
                  <Label
                    htmlFor='url-external'
                    className='cursor-pointer font-normal'
                  >
                    외부 URL
                  </Label>
                </div>
              </RadioGroup>
              <Input
                type='text'
                id='url'
                placeholder={
                  urlInputType === 'internal'
                    ? '예: /board/notice/post/123'
                    : '예: https://www.instagram.com/snorose1906'
                }
                onChange={handleUrlChange}
              />
              <p className='px-1 text-xs text-gray-500'>
                {urlInputType === 'internal' ? (
                  <>
                    기본 주소("https://www.snorose.com")를 제외한 경로만 입력해
                    주세요.
                  </>
                ) : (
                  '전체 URL을 입력해 주세요.'
                )}
              </p>
            </div>
          </div>
        </article>

        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>발송 옵션</h3>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between rounded-md border bg-blue-50 p-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='isMarketing' required>
                  메시지 유형
                </Label>
                <RadioGroup
                  value={formData.isMarketing ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isMarketing: value === 'true',
                    })
                  }
                  className='flex flex-col gap-1'
                >
                  <div className='flex items-center gap-3'>
                    <RadioGroup.Item value='true' id='marketing-true' />
                    <Label
                      htmlFor='marketing-true'
                      className='cursor-pointer font-normal'
                    >
                      광고성 (이벤트 홍보 등)
                    </Label>
                  </div>
                  <div className='flex items-center gap-3'>
                    <RadioGroup.Item value='false' id='marketing-false' />
                    <Label
                      htmlFor='marketing-false'
                      className='cursor-pointer font-normal'
                    >
                      정보성 (전체 공지, 댓글, 관리자 삭제/비공개 통보 등)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className='flex items-center justify-between rounded-md border bg-blue-50 p-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='isTest' required>
                  발송 대상
                </Label>
                <RadioGroup
                  value={formData.isTest ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isTest: value === 'true' })
                  }
                  className='flex flex-col gap-1'
                >
                  <div className='flex items-center gap-3'>
                    <RadioGroup.Item value='true' id='test-true' />
                    <Label
                      htmlFor='test-true'
                      className='cursor-pointer font-normal'
                    >
                      관리자에게만 테스트 발송
                    </Label>
                  </div>
                  <div className='flex items-center gap-3'>
                    <RadioGroup.Item value='false' id='test-false' />
                    <Label
                      htmlFor='test-false'
                      className='cursor-pointer font-normal'
                    >
                      푸시 알림 허용 회원 전체에게 발송
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </article>
      </section>

      <PushNotificationConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmModalButtonClick}
        data={{
          ...formData,
          url: toAbsolutePushUrl(formData.url ?? ''),
        }}
      />

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
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
          onClick={handleApplyButtonClick}
        >
          알림 전송
        </Button>
      </div>
    </div>
  );
}
