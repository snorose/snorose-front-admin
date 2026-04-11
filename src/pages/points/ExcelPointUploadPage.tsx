import { useRef, useState } from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Megaphone,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { DateTimePicker, PageHeader } from '@/shared/components';
import {
  Alert,
  Button,
  InputGroup,
  Label,
  RadioGroup,
  Table,
  Textarea,
} from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import type {
  ExcelPointBulkNotProcessedRow,
  ExcelPointBulkRewardResult,
} from '@/shared/types';
import {
  downloadNotProcessedRowsExcel,
  formatDateTimeForAPI,
  getErrorMessage,
} from '@/shared/utils';

import { postExcelPointBulkRewardAPI } from '@/apis';

type PaymentTiming = 'immediate' | 'reservation';

interface ExcelPreviewRow {
  rowNumber: number;
  userName: string;
  loginId: string;
  studentNumber: string;
  difference: string | number;
  category: string;
  memo: string;
}

const SUCCESS_TABLE_HEADERS = [
  '이름',
  '아이디',
  '학번',
  '포인트',
  '카테고리',
  '메모',
] as const;
const FAILURE_TABLE_HEADERS = [
  '행 번호',
  '이름',
  '아이디',
  '학번',
  '포인트',
  '카테고리',
  '메모',
  '사유(코드)',
  '설명',
] as const;
const PREVIEW_TABLE_HEADERS = [
  '행 번호',
  '이름',
  '학번',
  '포인트',
  '카테고리',
  '메모',
  '삭제',
] as const;

const RESULT_TABLE_BODY_MAX_HEIGHT_CLASS =
  'max-h-[min(24rem,50vh)] overflow-auto';

const EXCEL_POINT_TEMPLATE_SHEET_ID = '1292A7Rx0lZCGagtanIwdmrXFjm1jxjwE';
const EXCEL_POINT_TEMPLATE_XLSX_URL = `https://docs.google.com/spreadsheets/d/${EXCEL_POINT_TEMPLATE_SHEET_ID}/export?format=xlsx`;

const ROW_FAILURE_REASON_LABELS: Record<string, string> = {
  REQUEST_ERROR:
    '이름·학번·카테고리 등 필수값 누락, 포인트가 숫자가 아니거나, 정의되지 않은 카테고리를 사용',
  USER_NOT_FOUND: '이름과 학번이 일치하는 회원을 찾을 수 없음',
  POINT_ENTRY_DIFFERENCE:
    '해당 카테고리는 포인트 값이 필수이지만, 값이 입력되지 않음',
};

const EXCEL_PREVIEW_HEADER_ALIASES = {
  userName: ['이름', '성명', '회원명'],
  loginId: ['아이디', 'ID', 'id', '로그인아이디', '로그인 아이디'],
  studentNumber: ['학번', '학생번호', '학생 번호'],
  difference: ['포인트', '지급포인트', '지급 포인트', '점수'],
  category: ['카테고리', '분류'],
  memo: ['메모', '비고', '사유'],
} as const;
type ExcelPreviewField = keyof typeof EXCEL_PREVIEW_HEADER_ALIASES;
type ExcelPreviewColumnMap = Partial<Record<ExcelPreviewField, string>>;

function normalizeExcelHeader(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function getExcelCellValue(
  row: Record<string, unknown>,
  columnKey?: string
): string {
  if (!columnKey) {
    return '';
  }

  return String(row[columnKey] ?? '').trim();
}

function buildExcelPreviewColumnMap(
  rows: Record<string, unknown>[]
): ExcelPreviewColumnMap {
  const firstRow = rows[0];

  if (!firstRow) {
    return {};
  }

  const normalizedAliasEntries = Object.entries(
    EXCEL_PREVIEW_HEADER_ALIASES
  ).map(
    ([field, aliases]) =>
      [
        field as ExcelPreviewField,
        new Set(aliases.map((alias) => normalizeExcelHeader(alias))),
      ] as const
  );

  const columnMap: ExcelPreviewColumnMap = {};

  for (const key of Object.keys(firstRow)) {
    const normalizedKey = normalizeExcelHeader(key);

    for (const [field, normalizedAliases] of normalizedAliasEntries) {
      if (normalizedAliases.has(normalizedKey)) {
        columnMap[field] = key;
        break;
      }
    }
  }

  return columnMap;
}

function parseExcelPreviewRows(
  rows: Record<string, unknown>[]
): ExcelPreviewRow[] {
  const columnMap = buildExcelPreviewColumnMap(rows);

  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      userName: getExcelCellValue(row, columnMap.userName),
      loginId: getExcelCellValue(row, columnMap.loginId),
      studentNumber: getExcelCellValue(row, columnMap.studentNumber),
      difference: getExcelCellValue(row, columnMap.difference),
      category: getExcelCellValue(row, columnMap.category),
      memo: getExcelCellValue(row, columnMap.memo),
    }))
    .filter((row) =>
      Object.values(row).some((value) => String(value ?? '').trim().length > 0)
    );
}

function createUploadFileFromPreviewRows(
  rows: ExcelPreviewRow[],
  originalFileName: string
): File {
  const worksheetData = [
    ['이름', '학번', '카테고리', '포인트', '메모'],
    ...rows.map((row) => [
      row.userName,
      row.studentNumber,
      row.category,
      row.difference,
      row.memo,
    ]),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '포인트지급');

  const workbookArray = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const nextFileName = originalFileName.replace(/\.(xlsx|xls|csv)$/i, '.xlsx');

  return new File([workbookArray], nextFileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function remapNotProcessedRowNumber(
  row: ExcelPointBulkNotProcessedRow,
  submittedRows: ExcelPreviewRow[]
): ExcelPointBulkNotProcessedRow {
  const submittedRow = submittedRows[row.rowNumber - 2];

  if (!submittedRow) {
    return row;
  }

  return {
    ...row,
    rowNumber: submittedRow.rowNumber,
  };
}

function remapUploadResultRowNumbers(
  result: ExcelPointBulkRewardResult,
  submittedRows: ExcelPreviewRow[]
): ExcelPointBulkRewardResult {
  return {
    ...result,
    notProcessedRows: result.notProcessedRows.map((row) =>
      remapNotProcessedRowNumber(row, submittedRows)
    ),
  };
}

function formatRowFailureReason(reason: string): string {
  return ROW_FAILURE_REASON_LABELS[reason] ?? reason;
}

export default function ExcelPointUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ExcelPreviewRow[]>([]);
  const [uploadResult, setUploadResult] =
    useState<ExcelPointBulkRewardResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [bulkMemo, setBulkMemo] = useState('');
  const [paymentTiming, setPaymentTiming] =
    useState<PaymentTiming>('immediate');
  const reservationAt = useDateTimeField();

  const handleTemplateDownload = () => {
    window.open(EXCEL_POINT_TEMPLATE_XLSX_URL, '_blank', 'noopener,noreferrer');
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setIsParsingFile(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = firstSheetName
        ? workbook.Sheets[firstSheetName]
        : undefined;

      if (!firstSheet) {
        toast.error('엑셀 시트를 찾을 수 없습니다.');
        return;
      }

      const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        {
          defval: '',
        }
      );
      const nextPreviewRows = parseExcelPreviewRows(sheetRows);

      if (nextPreviewRows.length === 0) {
        toast.error('미리보기로 표시할 데이터가 없습니다.');
        return;
      }

      setUploadedFile(file);
      setPreviewRows(nextPreviewRows);
      setUploadResult(null);
      setBulkMemo('');
    } catch (error: unknown) {
      setUploadedFile(null);
      setPreviewRows([]);
      setUploadResult(null);
      toast.error(
        getErrorMessage(error, '엑셀 파일을 읽는 중 오류가 발생했습니다.')
      );
    } finally {
      setIsParsingFile(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    if (previewRows.length === 0) {
      toast.error('업로드할 명단 미리보기가 없습니다.');
      return;
    }

    if (paymentTiming === 'reservation' && !reservationAt.dateTime) {
      toast.error('예약 일시를 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setUploadResult(null);

    try {
      const submittedRows = [...previewRows];
      const submitFile = createUploadFileFromPreviewRows(
        submittedRows,
        uploadedFile.name
      );

      const response = await postExcelPointBulkRewardAPI({
        file: submitFile,
        request: {
          paymentMethod:
            paymentTiming === 'immediate' ? 'IMMEDIATE' : 'RESERVED',
          bulkMemo,
          ...(paymentTiming === 'reservation' && reservationAt.dateTime
            ? { reservedAt: formatDateTimeForAPI(reservationAt.dateTime) }
            : {}),
        },
      });

      if (!response.isSuccess || !response.result) {
        toast.error(response.message || '처리에 실패했습니다.');
        return;
      }

      setUploadResult(
        remapUploadResultRowNumbers(response.result, submittedRows)
      );
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

  const handleDownloadNotProcessedExcel = () => {
    if (!uploadResult?.notProcessedRows.length) {
      return;
    }
    downloadNotProcessedRowsExcel(
      uploadResult.notProcessedRows,
      formatRowFailureReason
    );
  };

  const handleRemovePreviewRow = (rowNumber: number) => {
    setPreviewRows((prevRows) => {
      const nextRows = prevRows.filter((row) => row.rowNumber !== rowNumber);

      if (nextRows.length === 0) {
        setUploadedFile(null);
        setUploadResult(null);
      }

      return nextRows;
    });
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
            <li>
              미리보기와 결과에 표시되는 행 번호는 엑셀 기준{' '}
              <strong>2번 행부터</strong>입니다. 1번 행은 제목 줄입니다.
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
                variant='outline'
                className='mx-1'
                disabled={isSubmitting || isParsingFile}
                onClick={handleUploadButtonClick}
              >
                {isParsingFile ? '불러오는 중…' : '명단 업로드'}
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
              disabled={isSubmitting || isParsingFile}
              onClick={handleTemplateDownload}
            >
              템플릿 다운로드
            </Button>
          </div>
          <p className='text-sm text-gray-600'>
            엑셀 파일에는 이름, 학번, 카테고리, 포인트, 메모 컬럼이 반드시
            포함되어야 합니다.
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          <section
            aria-labelledby='excel-preview-heading'
            className='flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs'
          >
            <div className='flex flex-col gap-0.5 border-b border-slate-100 bg-slate-50/90 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <h3
                  id='excel-preview-heading'
                  className='text-sm font-semibold text-slate-950'
                >
                  업로드 명단 미리보기{' '}
                  {previewRows.length > 0 ? (
                    <span className='font-semibold text-slate-950'>
                      ({previewRows.length}명)
                    </span>
                  ) : null}
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                엑셀 업로드 후 실제 지급 전에 표에서 입력값을 먼저 확인합니다.
              </p>
            </div>
            <div className={`min-h-0 ${RESULT_TABLE_BODY_MAX_HEIGHT_CLASS}`}>
              <Table>
                <Table.Header className='sticky top-0 z-[1] border-b border-slate-100 bg-slate-50'>
                  <Table.Row className='hover:bg-slate-50/40'>
                    {PREVIEW_TABLE_HEADERS.map((header) => (
                      <Table.Head
                        key={header}
                        className={`h-11 px-3 text-center text-xs font-semibold text-slate-950 ${
                          header === '삭제'
                            ? 'sticky right-0 z-[2] bg-slate-50'
                            : ''
                        }`}
                      >
                        {header}
                      </Table.Head>
                    ))}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {previewRows.length > 0 ? (
                    previewRows.map((row, index) => (
                      <Table.Row
                        key={`${row.rowNumber}-${row.studentNumber}-${index}`}
                        className='hover:bg-slate-50/20'
                      >
                        <Table.Cell className='px-3 py-3 text-center text-sm'>
                          {row.rowNumber}
                        </Table.Cell>
                        <Table.Cell className='px-3 py-3 text-center text-sm'>
                          {row.userName || '—'}
                        </Table.Cell>
                        <Table.Cell className='px-3 py-3 text-center text-sm'>
                          {row.studentNumber || '—'}
                        </Table.Cell>
                        <Table.Cell className='px-3 py-3 text-center text-sm tabular-nums'>
                          {row.difference || '—'}
                        </Table.Cell>
                        <Table.Cell className='px-3 py-3 text-center text-sm'>
                          {row.category || '—'}
                        </Table.Cell>
                        <Table.Cell className='max-w-[min(14rem,35vw)] px-3 py-3 text-center text-xs text-gray-700'>
                          {row.memo || '—'}
                        </Table.Cell>
                        <Table.Cell className='sticky right-0 bg-white px-3 py-3 text-center'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='text-red-600 hover:bg-red-50 hover:text-red-700'
                            disabled={isSubmitting}
                            onClick={() =>
                              handleRemovePreviewRow(row.rowNumber)
                            }
                          >
                            <Trash2 className='size-4' aria-hidden />
                            삭제
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row className='hover:bg-white'>
                      <Table.Cell
                        colSpan={PREVIEW_TABLE_HEADERS.length}
                        className='h-24 text-center text-sm text-gray-400'
                      >
                        {isParsingFile
                          ? '엑셀 내용을 불러오는 중입니다.'
                          : '명단 업로드 후 미리보기 표가 여기에 표시됩니다.'}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </section>

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
                {/* <div className='flex items-center gap-2'>
                <RadioGroup.Item value='reservation' id='reservation' />
                <Label
                  htmlFor='reservation'
                  className='cursor-pointer font-normal'
                >
                  예약 지급
                </Label>
              </div> */}
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

              <div className='flex flex-col gap-2'>
                <Label htmlFor='excel-bulk-memo'>총괄 메모</Label>
                <Textarea
                  id='excel-bulk-memo'
                  value={bulkMemo}
                  onChange={(e) => setBulkMemo(e.target.value)}
                  placeholder='지급 요청에 공통으로 남길 메모를 입력해 주세요.'
                  disabled={isSubmitting}
                  className='min-h-28 resize-y'
                />
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  className='w-fit'
                  disabled={
                    isSubmitting ||
                    isParsingFile ||
                    !uploadedFile ||
                    previewRows.length === 0 ||
                    uploadResult !== null
                  }
                  title={
                    uploadResult !== null
                      ? '다른 명단을 업로드하면 다시 지급할 수 있어요.'
                      : undefined
                  }
                  onClick={handleSubmit}
                >
                  {isSubmitting ? '처리 중…' : '지급 실행'}
                </Button>
                {uploadedFile && uploadResult !== null ? (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-fit'
                    disabled={isSubmitting || isParsingFile}
                    onClick={handleUploadButtonClick}
                  >
                    다른 명단 업로드
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {uploadResult ? (
            <div className='rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-xs sm:px-5'>
              <p className='flex flex-nowrap items-center gap-x-2 overflow-x-auto text-sm sm:gap-x-3'>
                <span className='shrink-0 font-semibold'>처리 결과 요약</span>
                <span>·</span>
                <span className='shrink-0'>
                  업로드한 회원{' '}
                  <span className='font-semibold text-blue-600 tabular-nums'>
                    {uploadResult.requestedCount}
                  </span>
                  명
                </span>
                <span>·</span>
                <span className='shrink-0'>
                  지급 성공{' '}
                  <span className='font-semibold text-green-600 tabular-nums'>
                    {uploadResult.successCount}
                  </span>
                  명
                </span>
                <span>·</span>
                <span className='shrink-0'>
                  실패{' '}
                  <span className='font-semibold text-red-600 tabular-nums'>
                    {uploadResult.failedCount}
                  </span>
                  명
                </span>
              </p>
            </div>
          ) : null}

          <div className='flex flex-col gap-3'>
            {uploadResult ? (
              <>
                <h2 className='text-foreground text-lg font-bold'>지급 결과</h2>
                <div className='flex flex-col gap-6'>
                  <section
                    aria-labelledby='excel-result-failure-heading'
                    className='flex min-h-0 flex-col overflow-hidden rounded-xl border border-amber-200 bg-white shadow-xs'
                  >
                    <div className='flex flex-col gap-2 border-b border-amber-100 bg-amber-50/90 px-4 py-3'>
                      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                        <div className='min-w-0 flex-1'>
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
                              <span className='ml-1.5 font-normal text-amber-900/90 tabular-nums'>
                                ({uploadResult.failedCount}명)
                              </span>
                            </h3>
                          </div>
                          <p className='pl-7 text-xs text-amber-900/80'>
                            엑셀 행 단위로 지급에 실패한 경우입니다. 사유를
                            확인해 주세요.
                          </p>
                        </div>
                        {uploadResult &&
                        uploadResult.notProcessedRows.length > 0 ? (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='shrink-0 border-amber-200 bg-white text-amber-950 hover:bg-amber-50'
                            onClick={handleDownloadNotProcessedExcel}
                          >
                            <Download className='size-4' aria-hidden />
                            미처리 명단 엑셀 저장
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={`min-h-0 ${RESULT_TABLE_BODY_MAX_HEIGHT_CLASS}`}
                    >
                      <Table>
                        <Table.Header className='sticky top-0 z-[1] border-b border-amber-100 bg-amber-50'>
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
                                  {row.userName || '—'}
                                </Table.Cell>
                                <Table.Cell className='px-3 py-3 text-center text-sm'>
                                  {row.loginId ?? '—'}
                                </Table.Cell>
                                <Table.Cell className='px-3 py-3 text-center text-sm'>
                                  {row.studentNumber || '—'}
                                </Table.Cell>
                                <Table.Cell className='px-3 py-3 text-center text-sm tabular-nums'>
                                  {row.difference}
                                </Table.Cell>
                                <Table.Cell className='px-3 py-3 text-center text-sm'>
                                  {row.category}
                                </Table.Cell>
                                <Table.Cell className='max-w-[min(12rem,30vw)] px-3 py-3 text-center text-xs text-gray-700'>
                                  {row.memo || '—'}
                                </Table.Cell>
                                <Table.Cell className='px-3 py-3 text-center text-sm'>
                                  {row.reason}
                                </Table.Cell>
                                <Table.Cell className='max-w-[min(24rem,45vw)] min-w-64 px-3 py-3 text-left text-xs break-words whitespace-normal text-gray-600'>
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
                          <span className='ml-1.5 font-normal text-emerald-900/90 tabular-nums'>
                            ({uploadResult.successCount}명)
                          </span>
                        </h3>
                      </div>
                      <p className='pl-7 text-xs text-emerald-800/80'>
                        포인트가 정상 반영된 회원 목록입니다.
                      </p>
                    </div>
                    <div
                      className={`min-h-0 ${RESULT_TABLE_BODY_MAX_HEIGHT_CLASS}`}
                    >
                      <Table>
                        <Table.Header className='sticky top-0 z-[1] border-b border-emerald-100 bg-emerald-50'>
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
                          {uploadResult &&
                          uploadResult.successRows.length > 0 ? (
                            uploadResult.successRows.map((row, index) => (
                              <Table.Row
                                key={`${row.loginId}-${row.studentNumber}-${index}`}
                                className='hover:bg-emerald-50/20'
                              >
                                <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900'>
                                  {row.userName}
                                </Table.Cell>
                                <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900'>
                                  {row.loginId}
                                </Table.Cell>
                                <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900'>
                                  {row.studentNumber}
                                </Table.Cell>
                                <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900 tabular-nums'>
                                  {row.difference}
                                </Table.Cell>
                                <Table.Cell className='px-4 py-3 text-center text-sm text-gray-900'>
                                  {row.category}
                                </Table.Cell>
                                <Table.Cell className='max-w-[min(14rem,35vw)] px-4 py-3 text-center text-xs text-gray-700'>
                                  {row.memo}
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
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
