import { PageHeader } from '@/shared/components';

export default function ExcelPointUploadPage() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='엑셀 업로드 지급'
        description='엑셀 파일을 업로드하여 포인트를 지급할 수 있어요.'
      />
    </div>
  );
}
