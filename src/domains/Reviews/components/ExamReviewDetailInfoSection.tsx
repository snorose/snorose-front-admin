import { type RefObject } from 'react';

import { Badge, Field, Input, Select, Textarea } from '@/shared/components/ui';
import {
  EXAM_REVIEW_PROCESS_STATUS,
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
  SEMESTER_LIST,
} from '@/shared/constants';
import { cn } from '@/shared/lib';

import { ExamConfirmStatusBadge } from '@/domains/Reviews/components';
import type {
  ExamReviewProcessStatus,
  LectureType,
} from '@/domains/Reviews/types';
import { convertLectureTypeToString } from '@/domains/Reviews/utils';

export interface ExamReviewDetailInfoSectionFormData {
  isConfirmed: boolean;
  isDiscussed: boolean;
  lectureName: string;
  professorName: string;
  lectureType: LectureType;
  semester: string;
  classNumber: number | null;
  examType: string;
  isPF: string;
  isOnline: string;
  deletionStatus: ExamReviewProcessStatus | null;
  isSanctioned: boolean;
  visibilityStatus: ExamReviewProcessStatus | null;
  memo: string | null;
  fileName: string;
  examTypeAndQuestions: string;
}

export interface ExamReviewDetailInfoSectionProps {
  formData: ExamReviewDetailInfoSectionFormData;
  setFormData: (partial: Partial<ExamReviewDetailInfoSectionFormData>) => void;
  isFormDisabled: boolean;
  onFileDownload: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const STATUS_FIELD_CLASS_NAME =
  'flex min-h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3';

const getProcessStatusLabel = (
  status: ExamReviewProcessStatus | null
): string => {
  if (!status) {
    return '-';
  }

  return (
    EXAM_REVIEW_PROCESS_STATUS.find((option) => option.code === status)
      ?.label ?? status
  );
};

const renderStatusBadge = (
  label: string,
  isActive: boolean,
  activeClassName: string,
  inactiveClassName = 'bg-gray-100 text-gray-500'
) => (
  <Badge
    variant='default'
    className={cn(
      'max-w-full truncate',
      isActive ? activeClassName : inactiveClassName
    )}
    title={label}
  >
    {label}
  </Badge>
);

export function ExamReviewDetailInfoSection({
  formData,
  setFormData,
  isFormDisabled,
  onFileDownload,
  fileInputRef,
  selectedFile,
  setSelectedFile,
}: ExamReviewDetailInfoSectionProps) {
  const confirmStatus = formData.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED';
  const deletionStatusLabel = getProcessStatusLabel(formData.deletionStatus);
  const visibilityStatusLabel = getProcessStatusLabel(
    formData.visibilityStatus
  );

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4'>
        <Field className='gap-0'>
          <Field.Label required>확인여부</Field.Label>
          <Field.Content>
            <Select
              value={formData.isConfirmed ? 'true' : 'false'}
              onValueChange={(value) =>
                setFormData({ isConfirmed: value === 'true' })
              }
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <ExamConfirmStatusBadge status={confirmStatus} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='true'>
                  <ExamConfirmStatusBadge status='CONFIRMED' />
                </Select.Item>
                <Select.Item value='false'>
                  <ExamConfirmStatusBadge status='UNCONFIRMED' />
                </Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>논의 여부</Field.Label>
          <Field.Content>
            <Select
              value={formData.isDiscussed ? 'true' : 'false'}
              onValueChange={(value) =>
                setFormData({ isDiscussed: value === 'true' })
              }
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                {renderStatusBadge(
                  formData.isDiscussed ? '논의 있음' : '논의 없음',
                  formData.isDiscussed,
                  'border-blue-200 bg-blue-50 text-blue-700'
                )}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='true'>
                  {renderStatusBadge(
                    '논의 있음',
                    true,
                    'border-blue-200 bg-blue-50 text-blue-700'
                  )}
                </Select.Item>
                <Select.Item value='false'>
                  {renderStatusBadge(
                    '논의 없음',
                    false,
                    'border-blue-200 bg-blue-50 text-blue-700'
                  )}
                </Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>삭제 상태</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              {renderStatusBadge(
                deletionStatusLabel,
                formData.deletionStatus !== null &&
                  formData.deletionStatus !== 'VISIBLE',
                'bg-red-50 text-red-700'
              )}
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>징계 여부</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              {renderStatusBadge(
                formData.isSanctioned ? '징계' : '징계 없음',
                true,
                formData.isSanctioned
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-emerald-50 text-emerald-700'
              )}
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>공개 상태</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              {renderStatusBadge(
                visibilityStatusLabel,
                formData.visibilityStatus !== null &&
                  formData.visibilityStatus !== 'VISIBLE',
                'bg-amber-50 text-amber-700'
              )}
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>강의명</Field.Label>
          <Field.Content>
            <Input
              value={formData.lectureName}
              onChange={(e) => setFormData({ lectureName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>교수명</Field.Label>
          <Field.Content>
            <Input
              value={formData.professorName}
              onChange={(e) => setFormData({ professorName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>업로드 파일</Field.Label>
          <Field.Content>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                className='flex-1 truncate rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-blue-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'
                onClick={onFileDownload}
                disabled={!formData.fileName}
                title={formData.fileName}
              >
                {selectedFile?.name || formData.fileName || '파일 없음'}
              </button>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isFormDisabled}
                className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                파일 변경
              </button>
              <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setFormData({ fileName: file.name });
                  }
                  if (e.target) e.target.value = '';
                }}
                accept='.pdf,.doc,.docx,.hwp'
              />
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>수강학기</Field.Label>
          <Field.Content>
            <Select
              value={formData.semester}
              onValueChange={(value) => setFormData({ semester: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <Select.Value>{formData.semester}</Select.Value>
              </Select.Trigger>
              <Select.Content className='max-h-[200px] overflow-y-auto'>
                {SEMESTER_LIST.map((semesterOption) => (
                  <Select.Item key={semesterOption} value={semesterOption}>
                    {semesterOption}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>시험 종류</Field.Label>
          <Field.Content>
            <Select
              value={formData.examType}
              onValueChange={(value) => setFormData({ examType: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <Select.Value>{formData.examType}</Select.Value>
              </Select.Trigger>
              <Select.Content className='max-h-[200px] overflow-y-auto'>
                {EXAM_TYPE_LIST.map((examTypeOption) => (
                  <Select.Item key={examTypeOption} value={examTypeOption}>
                    {examTypeOption}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>강의 종류</Field.Label>
          <Field.Content>
            <Select
              value={formData.lectureType}
              onValueChange={(value) =>
                setFormData({
                  lectureType:
                    value as (typeof LECTURE_TYPE_OPTIONS)[number]['value'],
                })
              }
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <Select.Value>
                  {convertLectureTypeToString(formData.lectureType)}
                </Select.Value>
              </Select.Trigger>
              <Select.Content className='max-h-[200px] overflow-y-auto'>
                {LECTURE_TYPE_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>분반</Field.Label>
          <Field.Content>
            <Input
              type='number'
              value={formData.classNumber ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = Number.parseInt(value, 10);
                setFormData({
                  classNumber:
                    value === '' || Number.isNaN(parsedValue)
                      ? null
                      : parsedValue,
                });
              }}
              disabled={isFormDisabled}
              min={1}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>P/F</Field.Label>
          <Field.Content>
            <Select
              value={formData.isPF}
              onValueChange={(value) => setFormData({ isPF: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <Select.Value>{formData.isPF}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='O'>O</Select.Item>
                <Select.Item value='X'>X</Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>온라인 강의 여부</Field.Label>
          <Field.Content>
            <Select
              value={formData.isOnline}
              onValueChange={(value) => setFormData({ isOnline: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                <Select.Value>{formData.isOnline}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='O'>O</Select.Item>
                <Select.Item value='X'>X</Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>시험 유형 및 문항수</Field.Label>
          <Field.Content>
            <Textarea
              value={formData.examTypeAndQuestions}
              onChange={(e) =>
                setFormData({ examTypeAndQuestions: e.target.value })
              }
              disabled={isFormDisabled}
              rows={3}
              className='min-h-[110px] resize-none'
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>메모</Field.Label>
          <Field.Content>
            <Textarea
              value={formData.memo ?? ''}
              onChange={(e) => setFormData({ memo: e.target.value })}
              disabled={isFormDisabled}
              rows={3}
              className='min-h-[110px] resize-none'
            />
          </Field.Content>
        </Field>
      </div>
    </div>
  );
}
