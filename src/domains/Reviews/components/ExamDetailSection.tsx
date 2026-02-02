import { useEffect, useMemo, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  ConfirmModal,
  Input,
  Select,
  Skeleton,
} from '@/shared/components/ui';
import {
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
  SEMESTER_LIST,
  STATUS_COLOR,
} from '@/shared/constants';

import { ExamStatusDot } from '@/domains/Reviews/components';
import type {
  ExamReview,
  ExamReviewDetailResult,
  LectureType,
  UpdateExamReviewRequest,
} from '@/domains/Reviews/types';
import {
  convertExamTypeEnumToString,
  convertExamTypeToEnum,
  convertLectureTypeToString,
  convertSemesterEnumToString,
  convertSemesterToEnum,
  getStatusName,
} from '@/domains/Reviews/utils';

import {
  deleteExamReview,
  downloadExamReviewFile,
  updateExamReview,
} from '@/apis/reviews';

interface ExamDetailSectionProps {
  selectedExamReview?: ExamReview | null;
  selectedExamReviewDetail?: ExamReviewDetailResult | null;
  isLoadingDetail?: boolean;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const FIELD_LABEL_CLASS =
  'text-[12px] font-semibold text-gray-700 tracking-[-0.01em]';
const FIELD_HINT_CLASS = 'text-[11px] text-gray-500';
const FIELD_CONTROL_CLASS =
  'mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-[13px] text-gray-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';
const FIELD_CONTROL_READONLY_CLASS =
  'mt-1 h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-600';

type FormData = {
  postId: number | null;
  status: string;
  examReviewName: string;
  uploadTime: string;
  lectureName: string;
  professorName: string;
  classNumber: number | null;
  semester: string;
  lectureType: LectureType;
  isPF: string;
  isOnline: string;
  examType: string;
  fileName: string;
  examTypeAndQuestions: string;
  author: string;
};

type InitialValues = {
  status: string;
  lectureName: string;
  professorName: string;
  classNumber: number | null;
  semester: string;
  lectureType: LectureType;
  isPF: string;
  isOnline: string;
  examType: string;
  questionDetail: string;
};

const DEFAULT_FORM_DATA: FormData = {
  postId: null,
  status: '',
  examReviewName: '',
  uploadTime: '',
  lectureName: '',
  professorName: '',
  classNumber: null,
  semester: '',
  lectureType: 'MAJOR_ELECTIVE',
  isPF: 'X',
  isOnline: 'X',
  examType: '',
  fileName: '',
  examTypeAndQuestions: '',
  author: '',
};

function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={FIELD_LABEL_CLASS}>{label}</div>
      {hint ? <div className={FIELD_HINT_CLASS}>{hint}</div> : null}
      {children}
    </div>
  );
}

export function ExamDetailSection({
  selectedExamReview,
  selectedExamReviewDetail,
  isLoadingDetail,
  onSaveSuccess,
  onDeleteSuccess,
}: ExamDetailSectionProps = {}) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(
    null
  );

  const isDisabled = !selectedExamReview || isLoadingDetail || false;

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setSelectedFile(null);
    setIsSaving(false);
  };

  const formInitialValues = useMemo(() => {
    if (selectedExamReviewDetail) {
      const date = new Date(selectedExamReviewDetail.createdAt);
      const uploadTimeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      const semesterStr = convertSemesterEnumToString(
        selectedExamReviewDetail.semester,
        selectedExamReviewDetail.lectureYear
      );
      const examTypeStr = convertExamTypeEnumToString(
        selectedExamReviewDetail.examType
      );
      const statusValue =
        selectedExamReview?.status ||
        (selectedExamReviewDetail.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED');

      return {
        postId: selectedExamReviewDetail.postId,
        status: statusValue,
        examReviewName: selectedExamReviewDetail.title,
        uploadTime: uploadTimeStr,
        lectureName: selectedExamReviewDetail.lectureName,
        professorName: selectedExamReviewDetail.professor,
        classNumber: selectedExamReviewDetail.classNumber,
        semester: semesterStr,
        lectureType: selectedExamReviewDetail.lectureType,
        isPF: selectedExamReviewDetail.isPF ? 'O' : 'X',
        isOnline: selectedExamReviewDetail.isOnline ? 'O' : 'X',
        examType: examTypeStr,
        fileName: selectedExamReviewDetail.fileName,
        examTypeAndQuestions: selectedExamReviewDetail.questionDetail,
        author: selectedExamReviewDetail.userDisplay,
        initialValues: {
          status: statusValue,
          lectureName: selectedExamReviewDetail.lectureName,
          professorName: selectedExamReviewDetail.professor,
          classNumber: selectedExamReviewDetail.classNumber,
          semester: semesterStr,
          lectureType: selectedExamReviewDetail.lectureType,
          isPF: selectedExamReviewDetail.isPF ? 'O' : 'X',
          isOnline: selectedExamReviewDetail.isOnline ? 'O' : 'X',
          examType: examTypeStr,
          questionDetail: selectedExamReviewDetail.questionDetail,
        },
      };
    }
    return null;
  }, [selectedExamReviewDetail, selectedExamReview?.status]);

  useEffect(() => {
    if (formInitialValues) {
      setFormData({
        postId: formInitialValues.postId,
        status: formInitialValues.status,
        examReviewName: formInitialValues.examReviewName,
        uploadTime: formInitialValues.uploadTime,
        lectureName: formInitialValues.lectureName,
        professorName: formInitialValues.professorName,
        classNumber: formInitialValues.classNumber,
        semester: formInitialValues.semester,
        lectureType: formInitialValues.lectureType,
        isPF: formInitialValues.isPF,
        isOnline: formInitialValues.isOnline,
        examType: formInitialValues.examType,
        fileName: formInitialValues.fileName,
        examTypeAndQuestions: formInitialValues.examTypeAndQuestions,
        author: formInitialValues.author,
      });
      setSelectedFile(null);
      setInitialValues(formInitialValues.initialValues);
    } else {
      resetForm();
      setInitialValues(null);
    }
  }, [formInitialValues]);

  const isDirty = useMemo(() => {
    if (!initialValues) return false;
    return (
      formData.status !== initialValues.status ||
      formData.lectureName !== initialValues.lectureName ||
      formData.professorName !== initialValues.professorName ||
      formData.classNumber !== initialValues.classNumber ||
      formData.semester !== initialValues.semester ||
      formData.lectureType !== initialValues.lectureType ||
      formData.isPF !== initialValues.isPF ||
      formData.isOnline !== initialValues.isOnline ||
      formData.examType !== initialValues.examType ||
      formData.examTypeAndQuestions !== initialValues.questionDetail ||
      selectedFile !== null
    );
  }, [formData, initialValues, selectedFile]);

  const handleCancel = () => {
    if (selectedExamReviewDetail && initialValues) {
      setFormData((prev) => ({
        ...prev,
        postId: selectedExamReviewDetail.postId,
        status: initialValues.status,
        lectureName: initialValues.lectureName,
        professorName: initialValues.professorName,
        classNumber: initialValues.classNumber,
        semester: initialValues.semester,
        lectureType: initialValues.lectureType,
        isPF: initialValues.isPF,
        isOnline: initialValues.isOnline,
        examType: initialValues.examType,
        examTypeAndQuestions: initialValues.questionDetail,
        fileName: selectedExamReviewDetail.fileName,
      }));
      setSelectedFile(null);
    }
  };

  const handleFileDownload = async () => {
    if (!selectedExamReview || !formData.fileName) {
      toast.error('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      const blob = await downloadExamReviewFile(
        selectedExamReview.id,
        formData.fileName
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = formData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('파일이 다운로드되었습니다.');
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '파일 다운로드에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!selectedExamReview || !selectedExamReviewDetail || !initialValues) {
      toast.error('선택된 시험 후기가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const post: UpdateExamReviewRequest['post'] = {};

      if (formData.lectureName !== initialValues.lectureName) {
        post.lectureName = formData.lectureName;
      }
      if (formData.professorName !== initialValues.professorName) {
        post.professor = formData.professorName || undefined;
      }
      if (formData.classNumber !== initialValues.classNumber) {
        post.classNumber = formData.classNumber ?? undefined;
      }
      if (formData.semester !== initialValues.semester) {
        const yearMatch = formData.semester.match(/^(\d{4})/);
        const lectureYear = yearMatch
          ? parseInt(yearMatch[1], 10)
          : selectedExamReviewDetail.lectureYear;
        post.lectureYear = lectureYear;
        post.semester = convertSemesterToEnum(formData.semester);
      }
      if (formData.lectureType !== initialValues.lectureType) {
        post.lectureType = formData.lectureType;
      }
      if (formData.isPF !== initialValues.isPF) {
        post.isPF = formData.isPF === 'O';
      }
      if (formData.isOnline !== initialValues.isOnline) {
        post.isOnline = formData.isOnline === 'O';
      }
      if (formData.examType !== initialValues.examType) {
        post.examType = convertExamTypeToEnum(formData.examType);
      }
      if (formData.status !== initialValues.status) {
        post.isConfirmed = formData.status === 'CONFIRMED';
      }
      if (formData.examTypeAndQuestions !== initialValues.questionDetail) {
        post.questionDetail = formData.examTypeAndQuestions;
      }

      const updateData: UpdateExamReviewRequest = {
        ...(selectedFile ? { file: selectedFile } : {}),
        post,
      };

      const response = await updateExamReview(
        selectedExamReview.id,
        updateData
      );

      if (response.isSuccess) {
        toast.success('시험 후기가 성공적으로 수정되었습니다.');
        setSelectedFile(null);
        setInitialValues({
          status: formData.status,
          lectureName: formData.lectureName,
          professorName: formData.professorName,
          classNumber: formData.classNumber,
          semester: formData.semester,
          lectureType: formData.lectureType,
          isPF: formData.isPF,
          isOnline: formData.isOnline,
          examType: formData.examType,
          questionDetail: formData.examTypeAndQuestions,
        });
        onSaveSuccess?.();
      } else {
        toast.error(response.message || '시험 후기 수정에 실패했습니다.');
      }
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 수정에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      if (!selectedExamReview?.id) {
        toast.error('선택된 시험 후기가 없습니다.');
        return;
      }
      const response = await deleteExamReview(selectedExamReview.id);
      if (response.isSuccess) {
        toast.success('시험 후기가 성공적으로 삭제되었습니다.');
        setIsDeleteModalOpen(false);
        resetForm();
        onDeleteSuccess?.();
      } else {
        toast.error(response.message || '시험 후기 삭제에 실패했습니다.');
      }
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 삭제에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  return (
    <article className='flex flex-col gap-1'>
      <div className='w-full rounded-md border p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <div>
            <p className='font-semibold'>
              {selectedExamReview?.reviewTitle || '시험후기'}
            </p>
          </div>
          <button
            type='button'
            className='rounded-sm bg-red-100 p-2 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60'
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!selectedExamReview || Boolean(isLoadingDetail)}
          >
            <Trash2 className='h-4 w-4 text-red-500' />
          </button>
        </div>

        {!selectedExamReview ? (
          <div className='rounded-md bg-gray-50 p-4 text-sm text-gray-600'>
            상단 시험후기 목록에서 시험후기를 선택해주세요.
          </div>
        ) : isLoadingDetail ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='mt-2 h-9 w-full' />
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Field label='상태'>
              <div className='mt-1'>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <div className='flex items-center gap-2'>
                      <ExamStatusDot status={formData.status} />
                      <span>{getStatusName(formData.status)}</span>
                    </div>
                  </Select.Trigger>
                  <Select.Content
                    align='start'
                    className='max-h-[200px] overflow-y-auto bg-blue-50 text-[12px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
                  >
                    {STATUS_COLOR.map((statusOption) => (
                      <Select.Item
                        key={statusOption.code}
                        value={statusOption.code}
                        className='text-[12px] font-medium'
                      >
                        <div className='flex items-center gap-2'>
                          <ExamStatusDot status={statusOption.code} />
                          <span>{statusOption.name}</span>
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='ID'>
              <div className={FIELD_CONTROL_READONLY_CLASS}>
                {formData.postId ?? ''}
              </div>
            </Field>

            <Field label='게시자'>
              <div className={FIELD_CONTROL_READONLY_CLASS}>
                {formData.author}
              </div>
            </Field>

            <Field label='업로드 시간'>
              <div className={FIELD_CONTROL_READONLY_CLASS}>
                {formData.uploadTime}
              </div>
            </Field>

            <Field label='업로드 파일'>
              <div className='mt-1 flex items-center gap-2'>
                <button
                  type='button'
                  className='flex-1 truncate rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-[13px] text-blue-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'
                  onClick={handleFileDownload}
                  disabled={!formData.fileName}
                  title={formData.fileName}
                >
                  {formData.fileName || '파일 없음'}
                </button>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDisabled}
                  className='rounded-md border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
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
                      setFormData((prev) => ({
                        ...prev,
                        fileName: file.name,
                      }));
                    }
                    if (e.target) e.target.value = '';
                  }}
                  accept='.pdf,.doc,.docx,.hwp'
                />
              </div>
            </Field>

            <Field label='강의명'>
              <Input
                value={formData.lectureName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lectureName: e.target.value,
                  }))
                }
                disabled={isDisabled}
                className={FIELD_CONTROL_CLASS}
              />
            </Field>

            <Field label='교수'>
              <Input
                value={formData.professorName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professorName: e.target.value,
                  }))
                }
                disabled={isDisabled}
                className={FIELD_CONTROL_CLASS}
              />
            </Field>

            <Field label='수강학기'>
              <div className='mt-1'>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, semester: value }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <Select.Value>{formData.semester}</Select.Value>
                  </Select.Trigger>
                  <Select.Content className='max-h-[200px] overflow-y-auto text-[12px]'>
                    {SEMESTER_LIST.map((semesterOption) => (
                      <Select.Item
                        key={semesterOption}
                        value={semesterOption}
                        className='text-[12px] font-medium'
                      >
                        {semesterOption}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='시험 종류'>
              <div className='mt-1'>
                <Select
                  value={formData.examType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, examType: value }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <Select.Value>{formData.examType}</Select.Value>
                  </Select.Trigger>
                  <Select.Content className='max-h-[200px] overflow-y-auto text-[12px]'>
                    {EXAM_TYPE_LIST.map((examTypeOption) => (
                      <Select.Item
                        key={examTypeOption}
                        value={examTypeOption}
                        className='text-[12px] font-medium'
                      >
                        {examTypeOption}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='강의 종류'>
              <div className='mt-1'>
                <Select
                  value={formData.lectureType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      lectureType:
                        value as (typeof LECTURE_TYPE_OPTIONS)[number]['value'],
                    }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <Select.Value>
                      {convertLectureTypeToString(formData.lectureType)}
                    </Select.Value>
                  </Select.Trigger>
                  <Select.Content className='max-h-[200px] overflow-y-auto text-[12px]'>
                    {LECTURE_TYPE_OPTIONS.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className='text-[12px] font-medium'
                      >
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='분반'>
              <Input
                type='number'
                value={formData.classNumber ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    classNumber: value === '' ? null : parseInt(value, 10),
                  }));
                }}
                disabled={isDisabled}
                min={1}
                className={FIELD_CONTROL_CLASS}
              />
            </Field>

            <Field label='P/F'>
              <div className='mt-1'>
                <Select
                  value={formData.isPF}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, isPF: value }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <Select.Value>{formData.isPF}</Select.Value>
                  </Select.Trigger>
                  <Select.Content className='text-[12px]'>
                    <Select.Item value='O' className='text-[12px] font-medium'>
                      O
                    </Select.Item>
                    <Select.Item value='X' className='text-[12px] font-medium'>
                      X
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='온라인 수업'>
              <div className='mt-1'>
                <Select
                  value={formData.isOnline}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, isOnline: value }))
                  }
                  disabled={isDisabled}
                >
                  <Select.Trigger className='h-9 w-full justify-between rounded-md border border-gray-200 bg-white px-3 text-[13px] shadow-sm'>
                    <Select.Value>{formData.isOnline}</Select.Value>
                  </Select.Trigger>
                  <Select.Content className='text-[12px]'>
                    <Select.Item value='O' className='text-[12px] font-medium'>
                      O
                    </Select.Item>
                    <Select.Item value='X' className='text-[12px] font-medium'>
                      X
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </Field>

            <Field label='시험 유형 및 문항수' className='md:col-span-2'>
              <Input
                value={formData.examTypeAndQuestions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    examTypeAndQuestions: e.target.value,
                  }))
                }
                disabled={isDisabled}
                className={FIELD_CONTROL_CLASS}
              />
            </Field>

            <div className='flex justify-end gap-2 pt-2 md:col-span-2'>
              <Button
                variant='secondary'
                size='sm'
                className='h-8 w-20 text-sm'
                onClick={handleCancel}
                disabled={isDisabled || !isDirty}
              >
                취소
              </Button>
              <Button
                variant='default'
                size='sm'
                className='h-8 w-20 bg-gray-700 text-sm'
                onClick={handleSave}
                disabled={isDisabled || !isDirty || isSaving}
              >
                {isSaving ? (
                  <div className='flex items-center gap-1'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    <span>수정 중</span>
                  </div>
                ) : (
                  '수정'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        confirmText='삭제'
        closeText='취소'
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClick}
        title='시험 후기 삭제'
        description='시험 후기를 삭제하시겠습니까?'
      />
    </article>
  );
}
