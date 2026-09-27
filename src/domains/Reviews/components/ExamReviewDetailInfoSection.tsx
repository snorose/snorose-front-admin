import { type RefObject, useId } from 'react';

import { StatusBadge } from '@/shared/components';
import { Field, Input, Select, Textarea } from '@/shared/components/ui';
import {
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
  SEMESTER_LIST,
} from '@/shared/constants';

import {
  ExamConfirmStatusBadge,
  ExamDiscussionStatusBadge,
  ExamReviewProcessStatusBadge,
} from '@/domains/Reviews/components';
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
  onFileNameRename: () => void;
  canRenameFileName: boolean;
  isEditMode: boolean;
  renameButtonRef: RefObject<HTMLButtonElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const STATUS_FIELD_CLASS_NAME =
  'flex min-h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3';

const renderProcessStatusBadge = (status: ExamReviewProcessStatus | null) =>
  status ? (
    <ExamReviewProcessStatusBadge status={status} />
  ) : (
    <StatusBadge tone='neutral'>-</StatusBadge>
  );

export function ExamReviewDetailInfoSection({
  formData,
  setFormData,
  isFormDisabled,
  onFileDownload,
  onFileNameRename,
  canRenameFileName,
  renameButtonRef,
  fileInputRef,
  selectedFile,
  setSelectedFile,
}: ExamReviewDetailInfoSectionProps) {
  const inputId = useId();
  const examTypeAndQuestionsId = useId();
  const memoId = useId();
  const confirmStatus = formData.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED';

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4'>
        <Field className='gap-0'>
          <Field.Label htmlFor={`${inputId}-isConfirmed`} required>
            확인여부
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.isConfirmed ? 'true' : 'false'}
              onValueChange={(value) =>
                setFormData({ isConfirmed: value === 'true' })
              }
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-isConfirmed`} className='w-full'>
                <ExamConfirmStatusBadge status={confirmStatus} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='true' textValue='확인 완료'>
                  <ExamConfirmStatusBadge status='CONFIRMED' />
                </Select.Item>
                <Select.Item value='false' textValue='미확인'>
                  <ExamConfirmStatusBadge status='UNCONFIRMED' />
                </Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label htmlFor={`${inputId}-isDiscussed`} required>
            논의 여부
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.isDiscussed ? 'true' : 'false'}
              onValueChange={(value) =>
                setFormData({ isDiscussed: value === 'true' })
              }
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-isDiscussed`} className='w-full'>
                <ExamDiscussionStatusBadge isDiscussed={formData.isDiscussed} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='true' textValue='논의 있음'>
                  <ExamDiscussionStatusBadge isDiscussed />
                </Select.Item>
                <Select.Item value='false' textValue='논의 없음'>
                  <ExamDiscussionStatusBadge isDiscussed={false} />
                </Select.Item>
              </Select.Content>
            </Select>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>삭제 상태</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              {renderProcessStatusBadge(formData.deletionStatus)}
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>징계 여부</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              <ExamReviewProcessStatusBadge
                status={formData.isSanctioned ? 'SANCTIONED' : 'DESANCTIONED'}
              />
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>공개 상태</Field.Label>
          <Field.Content>
            <div className={STATUS_FIELD_CLASS_NAME}>
              {renderProcessStatusBadge(formData.visibilityStatus)}
            </div>
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label htmlFor={`${inputId}-lectureName`} required>
            강의명
          </Field.Label>
          <Field.Content>
            <Input
              id={`${inputId}-lectureName`}
              value={formData.lectureName}
              onChange={(e) => setFormData({ lectureName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label htmlFor={`${inputId}-professorName`} required>
            교수명
          </Field.Label>
          <Field.Content>
            <Input
              id={`${inputId}-professorName`}
              value={formData.professorName}
              onChange={(e) => setFormData({ professorName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label required>업로드 파일</Field.Label>
          <Field.Content>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                className='min-w-0 flex-1 basis-full truncate rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-blue-600 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 sm:basis-0'
                onClick={onFileDownload}
                disabled={!formData.fileName}
                title={formData.fileName}
              >
                {selectedFile?.name || formData.fileName || '파일 없음'}
              </button>
              <button
                ref={renameButtonRef}
                type='button'
                onClick={onFileNameRename}
                disabled={!canRenameFileName}
                className='min-h-9 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
              >
                파일명 변경
              </button>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isFormDisabled}
                className='min-h-9 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
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
          <Field.Label htmlFor={`${inputId}-semester`} required>
            수강학기
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.semester}
              onValueChange={(value) => setFormData({ semester: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-semester`} className='w-full'>
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
          <Field.Label htmlFor={`${inputId}-examType`} required>
            시험 종류
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.examType}
              onValueChange={(value) => setFormData({ examType: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-examType`} className='w-full'>
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
          <Field.Label htmlFor={`${inputId}-lectureType`} required>
            강의 종류
          </Field.Label>
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
              <Select.Trigger id={`${inputId}-lectureType`} className='w-full'>
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
          <Field.Label htmlFor={`${inputId}-classNumber`} required>
            분반
          </Field.Label>
          <Field.Content>
            <Input
              id={`${inputId}-classNumber`}
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
          <Field.Label htmlFor={`${inputId}-isPF`} required>
            P/F
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.isPF}
              onValueChange={(value) => setFormData({ isPF: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-isPF`} className='w-full'>
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
          <Field.Label htmlFor={`${inputId}-isOnline`} required>
            온라인 강의 여부
          </Field.Label>
          <Field.Content>
            <Select
              value={formData.isOnline}
              onValueChange={(value) => setFormData({ isOnline: value })}
              disabled={isFormDisabled}
            >
              <Select.Trigger id={`${inputId}-isOnline`} className='w-full'>
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
          <Field.Label htmlFor={examTypeAndQuestionsId} required>
            시험 유형 및 문항수
          </Field.Label>
          <Field.Content>
            <Textarea
              id={examTypeAndQuestionsId}
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
          <Field.Label htmlFor={memoId}>메모</Field.Label>
          <Field.Content>
            <Textarea
              id={memoId}
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
