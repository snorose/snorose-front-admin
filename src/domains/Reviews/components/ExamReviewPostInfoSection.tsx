import { Accordion, Field } from '@/shared/components/ui';

interface ExamReviewPostInfoSectionProps {
  postId: number | null;
  uploadTime: string;
  author: string;
  encryptedUserId: string;
}

export function ExamReviewPostInfoSection({
  postId,
  uploadTime,
  author,
  encryptedUserId,
}: ExamReviewPostInfoSectionProps) {
  return (
    <Accordion type='single' collapsible className='rounded-md border'>
      <Accordion.Item value='post'>
        <Accordion.Trigger className='bg-gray-100 px-4 py-3 text-base font-semibold hover:no-underline data-[state=open]:rounded-b-none'>
          게시글 및 작성자 정보
        </Accordion.Trigger>
        <Accordion.Content className='p-4 pt-2'>
          <div className='grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4'>
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
              <Field.Label>작성자</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {author}
              </div>
            </Field>

            <Field className='gap-0'>
              <Field.Label>작성자 ID</Field.Label>
              <div className='flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                {encryptedUserId}
              </div>
            </Field>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
