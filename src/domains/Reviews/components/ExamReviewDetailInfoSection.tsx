import { type RefObject } from 'react';

import { Field, Input, Select, Textarea } from '@/shared/components/ui';
import {
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
  SEMESTER_LIST,
} from '@/shared/constants';

import type { LectureType } from '@/domains/Reviews/types';
import { convertLectureTypeToString } from '@/domains/Reviews/utils';

export interface ExamReviewDetailInfoSectionFormData {
  lectureName: string;
  professorName: string;
  fileName: string;
  semester: string;
  examType: string;
  lectureType: LectureType;
  classNumber: number | null;
  isPF: string;
  isOnline: string;
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

export function ExamReviewDetailInfoSection({
  formData,
  setFormData,
  isFormDisabled,
  onFileDownload,
  fileInputRef,
  selectedFile,
  setSelectedFile,
}: ExamReviewDetailInfoSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4'>
        <Field className='gap-0'>
          <Field.Label>강의명</Field.Label>
          <Field.Content>
            <Input
              value={formData.lectureName}
              onChange={(e) => setFormData({ lectureName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>교수명</Field.Label>
          <Field.Content>
            <Input
              value={formData.professorName}
              onChange={(e) => setFormData({ professorName: e.target.value })}
              disabled={isFormDisabled}
            />
          </Field.Content>
        </Field>
        <Field className='gap-0'>
          <Field.Label>업로드 파일</Field.Label>
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
          <Field.Label>수강학기</Field.Label>
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
          <Field.Label>시험 종류</Field.Label>
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
          <Field.Label>강의 종류</Field.Label>
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
          <Field.Label>분반</Field.Label>
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
          <Field.Label>P/F</Field.Label>
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
          <Field.Label>온라인 강의 여부</Field.Label>
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
        <Field className='col-span-full'>
          <Field.Label>시험 유형 및 문항수</Field.Label>
          <Field.Content>
            <Textarea
              value={formData.examTypeAndQuestions}
              onChange={(e) =>
                setFormData({ examTypeAndQuestions: e.target.value })
              }
              disabled={isFormDisabled}
              rows={2}
              className='min-h-[90px] resize-none'
            />
          </Field.Content>
        </Field>
      </div>
    </div>
  );
}
