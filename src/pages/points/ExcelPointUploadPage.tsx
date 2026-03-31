import { useRef, useState } from 'react';

import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import {
  Alert,
  Button,
  InputGroup,
  Label,
  RadioGroup,
  Table,
} from '@/shared/components/ui';

const TABLE_HEADERS = [
  '이름',
  '아이디',
  '학번',
  '카테고리',
  '포인트',
  '메모',
] as const;

export default function ExcelPointUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleTemplateDownload = () => {
    toast.info('엑셀 템플릿 다운로드 기능 개발 준비중');
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedFileName(file.name);
    toast.success('파일이 선택되었어요. 업로드를 진행합니다.');
    e.target.value = '';
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='엑셀 업로드 지급'
        description='엑셀 파일을 업로드하여 학번으로 회원을 매칭하고 포인트를 지급합니다.'
      />

      <Alert>
        <Megaphone />
        <Alert.Title>안내 사항</Alert.Title>
        <Alert.Description>
          <ul className='list-inside list-disc text-sm'>
            <li>엑셀 파일을 업로드하여 포인트를 지급할 수 있어요.</li>
            <li>포인트 지급 템플릿 파일을 다운로드하여 작성해 주세요.</li>
          </ul>
        </Alert.Description>
      </Alert>

      <section className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-foreground text-lg font-bold'>
            엑셀 파일 업로드
          </h2>
          <div className='flex items-center gap-2'>
            <InputGroup>
              <InputGroup.Button
                type='button'
                variant='secondary'
                className='mx-1'
                onClick={handleUploadButtonClick}
              >
                명단 업로드
              </InputGroup.Button>
              <p className='text-sm text-gray-500'>
                {uploadedFileName || '선택된 파일이 없습니다.'}
              </p>
              <input
                ref={fileInputRef}
                id='excel-point-file'
                type='file'
                accept='.xlsx,.xls,.csv'
                className='hidden'
                onChange={handleFileChange}
                tabIndex={-1}
                aria-hidden
              />
            </InputGroup>
            <Button
              type='button'
              variant='outline'
              onClick={handleTemplateDownload}
            >
              템플릿 다운로드
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-xl border bg-white'>
          <Table>
            <Table.Header className='bg-gray-50'>
              <Table.Row className='hover:bg-gray-50'>
                {TABLE_HEADERS.map((header) => (
                  <Table.Head
                    key={header}
                    className='h-12 px-4 text-center font-semibold text-gray-700'
                  >
                    {header}
                  </Table.Head>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row className='hover:bg-white'>
                <Table.Cell
                  colSpan={TABLE_HEADERS.length}
                  className='h-40 text-center text-sm text-gray-400'
                >
                  업로드된 엑셀 데이터가 여기에 표시됩니다.
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>

        <div className='flex flex-col gap-2'>
          <h2 className='text-foreground text-lg font-bold'>지급 방식</h2>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <RadioGroup className='flex gap-4'>
                <div className='flex items-center gap-2'>
                  <RadioGroup.Item
                    value='immediate'
                    id='immediate'
                  ></RadioGroup.Item>
                  <Label
                    htmlFor='immediate'
                    className='cursor-pointer font-normal'
                  >
                    즉시 지급
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroup.Item
                    value='reservation'
                    id='reservation'
                  ></RadioGroup.Item>
                  <Label
                    htmlFor='reservation'
                    className='cursor-pointer font-normal'
                  >
                    예약 지급
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
