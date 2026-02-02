import { useEffect, useMemo, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  ConfirmModal,
  Field,
  Input,
  Select,
  Skeleton,
  Textarea,
} from '@/shared/components/ui';
import {
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
  SEMESTER_LIST,
  STATUS_COLOR,
} from '@/shared/constants';

import {
  ExamReviewMetaInfoSection,
  ExamReviewUpdateConfirmModal,
  ExamStatusDot,
} from '@/domains/Reviews/components';
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

import type { ExamReviewUpdateChange } from './ExamReviewUpdateConfirmModal';

interface ExamDetailSectionProps {
  selectedExamReview?: ExamReview | null;
  selectedExamReviewDetail?: ExamReviewDetailResult | null;
  isLoadingDetail?: boolean;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

type FormData = {
  userId: string;
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
  userId: '',
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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(
    null
  );

  const isDisabled = !selectedExamReview || isLoadingDetail || false;
  const isFormDisabled = !selectedExamReview || Boolean(isLoadingDetail);

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
        userId: selectedExamReviewDetail.userId,
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
        userId: formInitialValues.userId,
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

  const updateChanges = useMemo<ExamReviewUpdateChange[]>(() => {
    if (!initialValues) return [];

    const changes: ExamReviewUpdateChange[] = [];
    const add = (label: string, before: string, after: string) => {
      if (before === after) return;
      changes.push({ label, before, after });
    };

    if (formData.status !== initialValues.status) {
      add(
        '확인 여부',
        getStatusName(initialValues.status),
        getStatusName(formData.status)
      );
    }

    add('강의명', initialValues.lectureName, formData.lectureName);
    add('교수', initialValues.professorName, formData.professorName);
    add('수강학기', initialValues.semester, formData.semester);
    add('시험 종류', initialValues.examType, formData.examType);
    add(
      '강의 종류',
      convertLectureTypeToString(initialValues.lectureType),
      convertLectureTypeToString(formData.lectureType)
    );
    add(
      '분반',
      String(initialValues.classNumber ?? ''),
      String(formData.classNumber ?? '')
    );
    add('P/F', initialValues.isPF, formData.isPF);
    add('온라인 수업', initialValues.isOnline, formData.isOnline);
    add(
      '시험 유형 및 문항수',
      initialValues.questionDetail,
      formData.examTypeAndQuestions
    );

    if (selectedFile) {
      add('업로드 파일', formData.fileName || '', selectedFile.name);
    }

    return changes;
  }, [formData, initialValues, selectedFile]);

  const handleCancel = () => {
    if (selectedExamReviewDetail && initialValues) {
      setFormData((prev) => ({
        ...prev,
        userId: selectedExamReviewDetail.userId,
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

  const openSaveModal = () => {
    if (!isDirty) return;
    setIsSaveModalOpen(true);
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
        post.professor = formData.professorName;
      }
      if (formData.classNumber !== initialValues.classNumber) {
        if (formData.classNumber !== null) {
          post.classNumber = formData.classNumber;
        }
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
          <div className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-4'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='mt-2 h-9 w-full' />
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-4'>
              <Field className='gap-0'>
                <Field.Label>확인 여부</Field.Label>
                <Field.Content>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                    disabled={isFormDisabled}
                  >
                    <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                      <div className='flex items-center gap-2'>
                        <ExamStatusDot status={formData.status} />
                        <span>{getStatusName(formData.status)}</span>
                      </div>
                    </Select.Trigger>
                    <Select.Content align='start'>
                      {STATUS_COLOR.map((statusOption) => (
                        <Select.Item
                          key={statusOption.code}
                          value={statusOption.code}
                        >
                          <div className='flex items-center gap-2'>
                            <ExamStatusDot status={statusOption.code} />
                            <span>{statusOption.name}</span>
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Field.Content>
              </Field>

              <Field className='gap-0'>
                <Field.Label>강의명</Field.Label>
                <Field.Content>
                  <Input
                    value={formData.lectureName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lectureName: e.target.value,
                      }))
                    }
                    disabled={isFormDisabled}
                  />
                </Field.Content>
              </Field>

              <Field className='gap-0'>
                <Field.Label>교수</Field.Label>
                <Field.Content>
                  <Input
                    value={formData.professorName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        professorName: e.target.value,
                      }))
                    }
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
                      onClick={handleFileDownload}
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
                </Field.Content>
              </Field>

              <Field className='gap-0'>
                <Field.Label>수강학기</Field.Label>
                <Field.Content>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, semester: value }))
                    }
                    disabled={isFormDisabled}
                  >
                    <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                      <Select.Value>{formData.semester}</Select.Value>
                    </Select.Trigger>
                    <Select.Content className='max-h-[200px] overflow-y-auto'>
                      {SEMESTER_LIST.map((semesterOption) => (
                        <Select.Item
                          key={semesterOption}
                          value={semesterOption}
                        >
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, examType: value }))
                    }
                    disabled={isFormDisabled}
                  >
                    <Select.Trigger className='w-full justify-between rounded-md border border-gray-200 bg-white px-3'>
                      <Select.Value>{formData.examType}</Select.Value>
                    </Select.Trigger>
                    <Select.Content className='max-h-[200px] overflow-y-auto'>
                      {EXAM_TYPE_LIST.map((examTypeOption) => (
                        <Select.Item
                          key={examTypeOption}
                          value={examTypeOption}
                        >
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
                      setFormData((prev) => ({
                        ...prev,
                        lectureType:
                          value as (typeof LECTURE_TYPE_OPTIONS)[number]['value'],
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        classNumber: value === '' ? null : parseInt(value, 10),
                      }));
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, isPF: value }))
                    }
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
                <Field.Label>온라인 수업</Field.Label>
                <Field.Content>
                  <Select
                    value={formData.isOnline}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, isOnline: value }))
                    }
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
                <Field.Label>시험 유형 및 문항수</Field.Label>
                <Field.Content>
                  <Textarea
                    value={formData.examTypeAndQuestions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        examTypeAndQuestions: e.target.value,
                      }))
                    }
                    disabled={isFormDisabled}
                    className='min-h-[84px]'
                  />
                </Field.Content>
              </Field>

              <div className='flex justify-end gap-2 pt-2 md:col-span-2'>
                <>
                  <Button
                    variant='outline'
                    className='w-20'
                    onClick={handleCancel}
                    disabled={isDisabled || !isDirty || isSaving}
                  >
                    취소
                  </Button>
                  <Button
                    variant='default'
                    className='w-20 bg-gray-700'
                    onClick={openSaveModal}
                    disabled={isDisabled || !isDirty || isSaving}
                  >
                    {isSaving ? (
                      <div className='flex items-center gap-1'>
                        <Loader2 className='h-3 w-3 animate-spin' />
                        <span>저장 중</span>
                      </div>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </>
              </div>
            </div>

            <ExamReviewMetaInfoSection
              postId={formData.postId}
              uploadTime={formData.uploadTime}
              author={formData.author}
              userId={formData.userId}
            />
          </div>
        )}
      </div>

      <ExamReviewUpdateConfirmModal
        isOpen={isSaveModalOpen}
        changes={updateChanges}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={() => {
          setIsSaveModalOpen(false);
          void handleSave();
        }}
      />

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
