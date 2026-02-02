import { Accordion, Field } from '@/shared/components/ui';

interface ExamReviewMetaInfoSectionProps {
  postId: number | null;
  uploadTime: string;
  author: string;
  userId: string;
}

export function ExamReviewMetaInfoSection({
  postId,
  uploadTime,
  author,
  userId,
}: ExamReviewMetaInfoSectionProps) {
  return (
    <Accordion type='single' collapsible className='rounded-md border'>
      <Accordion.Item value='meta'>
        <Accordion.Trigger className='px-4 py-3 text-base font-semibold hover:no-underline'>
          메타 정보
        </Accordion.Trigger>
        <Accordion.Content className='px-4'>
          <div className='grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-2'>
            <Field className='gap-0'>
              <Field.Label>시험 후기 ID</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {postId ?? ''}
              </div>
            </Field>

            <Field className='gap-0'>
              <Field.Label>업로드 시간</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {uploadTime}
              </div>
            </Field>

            <Field className='gap-0'>
              <Field.Label>게시자</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {author}
              </div>
            </Field>

            <Field className='gap-0'>
              <Field.Label>게시자 ID</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {userId}
              </div>
            </Field>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
