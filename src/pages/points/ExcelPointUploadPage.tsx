import { useRef, useState } from 'react';

import { AlertTriangle, CheckCircle2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

import { DateTimePicker, PageHeader } from '@/shared/components';
import {
  Alert,
  Button,
  InputGroup,
  Label,
  RadioGroup,
  Table,
} from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import type { ExcelPointBulkRewardResult } from '@/shared/types';
import { formatDateTimeForAPI, getErrorMessage } from '@/shared/utils';

import { postExcelPointBulkRewardAPI } from '@/apis';

type PaymentTiming = 'immediate' | 'reservation';

const SUCCESS_TABLE_HEADERS = ['아이디'] as const;
const FAILURE_TABLE_HEADERS = [
  '행 번호',
  '아이디',
  '학번',
  '사유(코드)',
  '설명',
] as const;

const EXCEL_POINT_TEMPLATE_SHEET_ID = '1292A7Rx0lZCGagtanIwdmrXFjm1jxjwE';
const EXCEL_POINT_TEMPLATE_XLSX_URL = `https://docs.google.com/spreadsheets/d/${EXCEL_POINT_TEMPLATE_SHEET_ID}/export?format=xlsx`;

const ROW_FAILURE_REASON_LABELS: Record<string, string> = {
  REQUEST_ERROR:
    '이름·학번·카테고리 등 필수값 누락, 포인트가 숫자가 아니거나, 정의되지 않은 카테고리를 사용',
  USER_NOT_FOUND: '이름과 학번이 일치하는 회원을 찾을 수 없음',
  POINT_ENTRY_DIFFERENCE:
    '해당 카테고리는 포인트 값이 필수이지만, 값이 입력되지 않음',
};

function formatRowFailureReason(reason: string): string {
  return ROW_FAILURE_REASON_LABELS[reason] ?? reason;
}

export default function ExcelPointUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] =
    useState<ExcelPointBulkRewardResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentTiming, setPaymentTiming] =
    useState<PaymentTiming>('immediate');
  const reservationAt = useDateTimeField();

  const handleTemplateDownload = () => {
    window.open(EXCEL_POINT_TEMPLATE_XLSX_URL, '_blank', 'noopener,noreferrer');
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedFile(file);
    setUploadResult(null);
    toast.success('파일이 선택되었어요. 지급 실행을 눌러 업로드해 주세요.');
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }

    if (paymentTiming === 'reservation' && !reservationAt.dateTime) {
      toast.error('예약 일시를 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setUploadResult(null);

    try {
      const response = await postExcelPointBulkRewardAPI({
        file: uploadedFile,
        request: {
          paymentMethod:
            paymentTiming === 'immediate' ? 'IMMEDIATE' : 'RESERVED',
          bulkMemo: '',
          ...(paymentTiming === 'reservation' && reservationAt.dateTime
            ? { reservedAt: formatDateTimeForAPI(reservationAt.dateTime) }
            : {}),
        },
      });

      if (!response.isSuccess || !response.result) {
        toast.error(response.message || '처리에 실패했습니다.');
        return;
      }

      setUploadResult(response.result);
      toast.success(response.message || '처리가 완료되었습니다.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '엑셀 업로드 처리에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentTimingChange = (value: string) => {
    const next = value as PaymentTiming;
    setPaymentTiming(next);
    if (next === 'immediate') {
      reservationAt.reset();
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='엑셀 업로드 지급'
        description='엑셀 파일을 업로드하면 학번을 기준으로 회원을 매칭하여 포인트를 일괄 지급합니다.'
      />

      <Alert>
        <Megaphone />
        <Alert.Title>안내 사항</Alert.Title>
        <Alert.Description>
          <ul className='list-inside list-disc text-sm'>
            <li>
              포인트 지급 템플릿 파일을 다운로드하여 형식에 맞게 작성해 주세요.
            </li>
            <li>
              처리되지 않은 회원은 다시 조회할 수 없으므로, 사유를 즉시 확인하신
              후 해당 회원만 별도로 업로드해 주세요.
            </li>
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
                {uploadedFile?.name ?? '선택된 파일이 없습니다.'}
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

        <div className='flex flex-col gap-3'>
          <h2 className='text-foreground text-lg font-bold'>지급 방식</h2>
          <div className='flex w-full flex-col gap-4 rounded-md border p-4 pb-5'>
            <RadioGroup
              value={paymentTiming}
              onValueChange={handlePaymentTimingChange}
              className='flex flex-row gap-4'
            >
              <div className='flex items-center gap-2'>
                <RadioGroup.Item value='immediate' id='immediate' />
                <Label
                  htmlFor='immediate'
                  className='cursor-pointer font-normal'
                >
                  즉시 지급
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroup.Item value='reservation' id='reservation' />
                <Label
                  htmlFor='reservation'
                  className='cursor-pointer font-normal'
                >
                  예약 지급
                </Label>
              </div>
            </RadioGroup>

            {paymentTiming === 'reservation' ? (
              <DateTimePicker
                label='예약 일시'
                date={reservationAt.date}
                time={reservationAt.time}
                onDateSelect={reservationAt.onDateSelect}
                onTimeChange={reservationAt.onTimeChange}
                datePlaceholder='예약 날짜 선택'
                required
                className='max-w-2xl'
              />
            ) : null}

            <Button
              type='button'
              className='w-fit'
              disabled={isSubmitting || !uploadedFile || uploadResult !== null}
              title={
                uploadResult !== null
                  ? '다른 명단을 업로드하면 다시 지급할 수 있어요.'
                  : undefined
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? '처리 중…' : '지급 실행'}
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          {uploadResult ? (
            <div className='rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-xs sm:px-5'>
              <p className='flex flex-nowrap items-center gap-x-2 overflow-x-auto text-sm sm:gap-x-3'>
                <span className='shrink-0 font-semibold'>처리 결과 요약</span>
                <span>·</span>
                <span className='shrink-0'>
                  요청{' '}
                  <span className='font-semibold text-blue-600 tabular-nums'>
                    {uploadResult.requestedCount}
                  </span>
                  건
                </span>
                <span>·</span>
                <span className='shrink-0'>
                  성공{' '}
                  <span className='font-semibold text-green-600 tabular-nums'>
                    {uploadResult.successCount}
                  </span>
                  건
                </span>
                <span>·</span>
                <span className='shrink-0'>
                  실패{' '}
                  <span className='font-semibold text-red-600 tabular-nums'>
                    {uploadResult.failedCount}
                  </span>
                  건
                </span>
              </p>
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]'>
            <section
              aria-labelledby='excel-result-success-heading'
              className='flex min-h-0 flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-xs'
            >
              <div className='flex flex-col gap-0.5 border-b border-emerald-100 bg-emerald-50/90 px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2
                    className='size-5 shrink-0 text-emerald-600'
                    aria-hidden
                  />
                  <h3
                    id='excel-result-success-heading'
                    className='text-sm font-semibold text-emerald-950'
                  >
                    지급 성공
                  </h3>
                </div>
                <p className='pl-7 text-xs text-emerald-800/80'>
                  포인트가 정상 반영된 회원 아이디입니다.
                </p>
              </div>
              <div className='min-h-0 overflow-x-auto'>
                <Table>
                  <Table.Header className='bg-emerald-50/40'>
                    <Table.Row className='hover:bg-emerald-50/40'>
                      {SUCCESS_TABLE_HEADERS.map((header) => (
                        <Table.Head
                          key={header}
                          className='h-11 px-4 text-center text-xs font-semibold text-emerald-900'
                        >
                          {header}
                        </Table.Head>
                      ))}
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {uploadResult && uploadResult.successLoginIds.length > 0 ? (
                      uploadResult.successLoginIds.map((loginId, index) => (
                        <Table.Row
                          key={`${loginId}-${index}`}
                          className='hover:bg-emerald-50/20'
                        >
                          <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900'>
                            {loginId}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row className='hover:bg-white'>
                        <Table.Cell
                          colSpan={SUCCESS_TABLE_HEADERS.length}
                          className='h-24 text-center text-sm text-gray-400'
                        >
                          {uploadResult
                            ? '성공한 회원이 없습니다.'
                            : '지급 실행 후 결과가 여기에 표시됩니다.'}
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </section>

            <section
              aria-labelledby='excel-result-failure-heading'
              className='flex min-h-0 flex-col overflow-hidden rounded-xl border border-amber-200 bg-white shadow-xs'
            >
              <div className='flex flex-col gap-0.5 border-b border-amber-100 bg-amber-50/90 px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle
                    className='size-5 shrink-0 text-amber-600'
                    aria-hidden
                  />
                  <h3
                    id='excel-result-failure-heading'
                    className='text-sm font-semibold text-amber-950'
                  >
                    처리되지 않음
                  </h3>
                </div>
                <p className='pl-7 text-xs text-amber-900/80'>
                  엑셀 행 단위로 지급에 실패한 경우입니다. 사유를 확인해 수정해
                  주세요.
                </p>
              </div>
              <div className='min-h-0 overflow-x-auto'>
                <Table>
                  <Table.Header className='bg-amber-50/40'>
                    <Table.Row className='hover:bg-amber-50/40'>
                      {FAILURE_TABLE_HEADERS.map((header) => (
                        <Table.Head
                          key={header}
                          className='h-11 px-3 text-center text-xs font-semibold text-amber-950'
                        >
                          {header}
                        </Table.Head>
                      ))}
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {uploadResult &&
                    uploadResult.notProcessedRows.length > 0 ? (
                      uploadResult.notProcessedRows.map((row, index) => (
                        <Table.Row
                          key={`${row.rowNumber}-${row.reason}-${index}`}
                          className='hover:bg-amber-50/20'
                        >
                          <Table.Cell className='px-3 py-3 text-center text-sm'>
                            {row.rowNumber}
                          </Table.Cell>
                          <Table.Cell className='px-3 py-3 text-center text-sm'>
                            {row.loginId || '—'}
                          </Table.Cell>
                          <Table.Cell className='px-3 py-3 text-center text-sm'>
                            {row.studentNumber || '—'}
                          </Table.Cell>
                          <Table.Cell className='px-3 py-3 text-center text-sm'>
                            {row.reason}
                          </Table.Cell>
                          <Table.Cell className='max-w-[min(18rem,40vw)] px-3 py-3 text-left text-xs text-gray-600'>
                            {formatRowFailureReason(row.reason)}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row className='hover:bg-white'>
                        <Table.Cell
                          colSpan={FAILURE_TABLE_HEADERS.length}
                          className='h-24 text-center text-sm text-gray-400'
                        >
                          {uploadResult
                            ? '처리되지 않은 행이 없습니다.'
                            : '지급 실행 후 결과가 여기에 표시됩니다.'}
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
