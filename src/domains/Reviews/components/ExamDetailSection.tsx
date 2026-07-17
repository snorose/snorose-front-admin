import { useEffect, useMemo, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Card,
  ConfirmModal,
  Skeleton,
  Tabs,
  Textarea,
} from '@/shared/components/ui';

import {
  ExamReviewCommentSection,
  ExamReviewDetailInfoSection,
  ExamReviewLogSection,
  ExamReviewPostInfoSection,
  ExamReviewUpdateConfirmModal,
} from '@/domains/Reviews/components';
import type {
  ExamReview,
  ExamReviewDetailResult,
  ExamReviewProcessStatus,
  LectureType,
  UpdateExamReviewRequest,
} from '@/domains/Reviews/types';
import {
  convertExamTypeEnumToString,
  convertExamTypeToEnum,
  convertLectureTypeToString,
  convertSemesterEnumToString,
  convertSemesterToEnum,
  isExamReviewSanctioned,
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
  onSaveSuccess?: (updatedDetail?: ExamReviewDetailResult) => void;
  onDeleteSuccess?: () => void;
}

type FormData = {
  encryptedUserId: string;
  postId: number | null;
  isConfirmed: boolean;
  isDiscussed: boolean;
  deletionStatus: ExamReviewProcessStatus | null;
  isSanctioned: boolean;
  visibilityStatus: ExamReviewProcessStatus | null;
  memo: string | null;
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
  isConfirmed: boolean;
  isDiscussed: boolean;
  memo: string | null;
  lectureName: string;
  professorName: string;
  classNumber: number | null;
  semester: string;
  lectureType: LectureType;
  isPF: string;
  isOnline: string;
  examType: string;
  questionDetail: string;
  fileName: string;
};

const DEFAULT_FORM_DATA: FormData = {
  encryptedUserId: '',
  postId: null,
  isConfirmed: false,
  isDiscussed: false,
  deletionStatus: null,
  isSanctioned: false,
  visibilityStatus: null,
  memo: null,
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

const getRequiredFieldErrorMessage = (formData: FormData): string | null => {
  if (formData.lectureName.trim() === '') {
    return '강의명을 입력해주세요.';
  }

  if (formData.professorName.trim() === '') {
    return '교수명을 입력해주세요.';
  }

  if (formData.fileName.trim() === '') {
    return '업로드 파일을 등록해주세요.';
  }

  if (formData.semester.trim() === '') {
    return '수강학기를 선택해주세요.';
  }

  if (formData.examType.trim() === '') {
    return '시험 종류를 선택해주세요.';
  }

  if (!formData.lectureType) {
    return '강의 종류를 선택해주세요.';
  }

  if (formData.classNumber === null || formData.classNumber < 1) {
    return '분반을 입력해주세요.';
  }

  if (formData.isPF.trim() === '') {
    return 'P/F를 선택해주세요.';
  }

  if (formData.isOnline.trim() === '') {
    return '온라인 강의 여부를 선택해주세요.';
  }

  if (formData.examTypeAndQuestions.trim() === '') {
    return '시험 유형 및 문항수를 입력해주세요.';
  }

  return null;
};

export function ExamDetailSection({
  selectedExamReview,
  selectedExamReviewDetail,
  isLoadingDetail,
  onSaveSuccess,
  onDeleteSuccess,
}: ExamDetailSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<
    'review' | 'post' | 'comments' | 'logs'
  >('review');
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(
    null
  );

  const isDisabled = !selectedExamReview || Boolean(isLoadingDetail);
  const isFormDisabled =
    !selectedExamReview || Boolean(isLoadingDetail) || !isEditMode;

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
      return {
        encryptedUserId: selectedExamReviewDetail.encryptedUserId,
        postId: selectedExamReviewDetail.postId,
        isConfirmed: selectedExamReviewDetail.isConfirmed,
        isDiscussed: selectedExamReviewDetail.isDiscussed,
        deletionStatus: selectedExamReviewDetail.deletionStatus,
        isSanctioned: isExamReviewSanctioned(
          selectedExamReviewDetail.isSanctioned
        ),
        visibilityStatus: selectedExamReviewDetail.visibilityStatus,
        memo: selectedExamReviewDetail.memo,
        examReviewName:
          selectedExamReviewDetail.title ??
          selectedExamReview?.reviewTitle ??
          '',
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
          isConfirmed: selectedExamReviewDetail.isConfirmed,
          isDiscussed: selectedExamReviewDetail.isDiscussed,
          memo: selectedExamReviewDetail.memo,
          lectureName: selectedExamReviewDetail.lectureName,
          professorName: selectedExamReviewDetail.professor,
          classNumber: selectedExamReviewDetail.classNumber,
          semester: semesterStr,
          lectureType: selectedExamReviewDetail.lectureType,
          isPF: selectedExamReviewDetail.isPF ? 'O' : 'X',
          isOnline: selectedExamReviewDetail.isOnline ? 'O' : 'X',
          examType: examTypeStr,
          questionDetail: selectedExamReviewDetail.questionDetail,
          fileName: selectedExamReviewDetail.fileName,
        },
      };
    }
    return null;
  }, [selectedExamReview?.reviewTitle, selectedExamReviewDetail]);

  useEffect(() => {
    setIsEditMode(false);
  }, [selectedExamReview?.id]);

  useEffect(() => {
    if (formInitialValues) {
      setFormData({
        encryptedUserId: formInitialValues.encryptedUserId,
        postId: formInitialValues.postId,
        isConfirmed: formInitialValues.isConfirmed,
        isDiscussed: formInitialValues.isDiscussed,
        deletionStatus: formInitialValues.deletionStatus,
        isSanctioned: formInitialValues.isSanctioned,
        visibilityStatus: formInitialValues.visibilityStatus,
        memo: formInitialValues.memo,
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
      formData.isConfirmed !== initialValues.isConfirmed ||
      formData.isDiscussed !== initialValues.isDiscussed ||
      (formData.memo ?? '') !== (initialValues.memo ?? '') ||
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

    add(
      '확인여부',
      initialValues.isConfirmed ? '확인' : '미확인',
      formData.isConfirmed ? '확인' : '미확인'
    );
    add(
      '논의 여부',
      initialValues.isDiscussed ? '논의 있음' : '논의 없음',
      formData.isDiscussed ? '논의 있음' : '논의 없음'
    );

    add('강의명', initialValues.lectureName, formData.lectureName);
    add('교수명', initialValues.professorName, formData.professorName);
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
    add('메모', initialValues.memo ?? '', formData.memo ?? '');

    if (selectedFile) {
      add('업로드 파일', initialValues.fileName || '', selectedFile.name);
    }

    return changes;
  }, [formData, initialValues, selectedFile]);

  const handleCancel = () => {
    if (selectedExamReviewDetail && initialValues) {
      setFormData((prev) => ({
        ...prev,
        encryptedUserId: selectedExamReviewDetail.encryptedUserId,
        postId: selectedExamReviewDetail.postId,
        isConfirmed: initialValues.isConfirmed,
        isDiscussed: initialValues.isDiscussed,
        memo: initialValues.memo,
        lectureName: initialValues.lectureName,
        professorName: initialValues.professorName,
        classNumber: initialValues.classNumber,
        semester: initialValues.semester,
        lectureType: initialValues.lectureType,
        isPF: initialValues.isPF,
        isOnline: initialValues.isOnline,
        examType: initialValues.examType,
        examTypeAndQuestions: initialValues.questionDetail,
        fileName: initialValues.fileName,
      }));
      setSelectedFile(null);
    }
    setIsEditMode(false);
  };

  const openSaveModal = () => {
    if (!isDirty) return;

    const requiredFieldErrorMessage = getRequiredFieldErrorMessage(formData);
    if (requiredFieldErrorMessage) {
      toast.error(requiredFieldErrorMessage);
      return;
    }

    setIsSaveModalOpen(true);
  };

  const openDeleteModal = () => {
    setDeleteReason('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteReason('');
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

    const requiredFieldErrorMessage = getRequiredFieldErrorMessage(formData);
    if (requiredFieldErrorMessage) {
      toast.error(requiredFieldErrorMessage);
      return;
    }

    setIsSaving(true);
    try {
      const post: UpdateExamReviewRequest['post'] = {};
      if (formData.isConfirmed !== initialValues.isConfirmed) {
        post.isConfirmed = formData.isConfirmed;
      }
      if (formData.isDiscussed !== initialValues.isDiscussed) {
        post.isDiscussed = formData.isDiscussed;
      }
      if ((formData.memo ?? '') !== (initialValues.memo ?? '')) {
        post.memo = formData.memo === '' ? null : formData.memo;
      }
      if (formData.lectureName !== initialValues.lectureName) {
        post.lectureName = formData.lectureName;
      }
      if (formData.professorName !== initialValues.professorName) {
        post.professor = formData.professorName;
      }
      if (formData.classNumber !== initialValues.classNumber) {
        post.classNumber = formData.classNumber!;
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
      if (formData.examTypeAndQuestions !== initialValues.questionDetail) {
        post.questionDetail = formData.examTypeAndQuestions;
      }

      const hasDetailUpdate =
        Object.keys(post).length > 0 || Boolean(selectedFile);

      if (!hasDetailUpdate) {
        return;
      }

      const updateData: UpdateExamReviewRequest = {
        ...(selectedFile ? { file: selectedFile } : {}),
        post,
      };

      const updatedDetail = await updateExamReview(
        selectedExamReview.id,
        updateData
      );

      toast.success('시험 후기가 성공적으로 수정되었습니다.');
      setSelectedFile(null);
      setIsEditMode(false);
      setInitialValues({
        isConfirmed: updatedDetail.isConfirmed,
        isDiscussed: updatedDetail.isDiscussed,
        memo: updatedDetail.memo,
        lectureName: formData.lectureName,
        professorName: formData.professorName,
        classNumber: formData.classNumber,
        semester: formData.semester,
        lectureType: formData.lectureType,
        isPF: formData.isPF,
        isOnline: formData.isOnline,
        examType: formData.examType,
        questionDetail: formData.examTypeAndQuestions,
        fileName: updatedDetail.fileName,
      });
      onSaveSuccess?.(updatedDetail);
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
    const trimmedDeleteReason = deleteReason.trim();
    if (!trimmedDeleteReason) {
      toast.error('삭제 사유를 입력해주세요.');
      return;
    }

    if (!selectedExamReview?.id) {
      toast.error('선택된 시험 후기가 없습니다.');
      return;
    }

    const existingMemo = selectedExamReviewDetail?.memo?.trim();
    const deleteReasonMarker = `[삭제 사유]\n${trimmedDeleteReason}`;
    const deleteMemo = existingMemo?.includes(deleteReasonMarker)
      ? existingMemo
      : [existingMemo, deleteReasonMarker].filter(Boolean).join('\n\n');

    try {
      setIsDeleting(true);
      await updateExamReview(selectedExamReview.id, {
        post: { memo: deleteMemo },
      });
      await deleteExamReview(selectedExamReview.id);
      toast.success('시험 후기가 성공적으로 삭제되었습니다.');
      closeDeleteModal();
      resetForm();
      onDeleteSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 삭제에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className='flex flex-col gap-1'>
      <div className='flex w-full flex-col rounded-md border'>
        <div className='flex items-center justify-between bg-blue-100 px-4 py-3'>
          <div className='flex items-center gap-3'>
            <p className='font-semibold'>
              {selectedExamReview?.reviewTitle || '시험후기'}
            </p>
            {selectedExamReviewDetail?.userDisplay && (
              <span>(작성자: {selectedExamReviewDetail.userDisplay})</span>
            )}
          </div>
          {selectedExamReview && (
            <button
              type='button'
              aria-label='시험 후기 삭제'
              className='rounded-sm bg-red-100 p-2 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60'
              onClick={openDeleteModal}
              disabled={isDisabled}
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </button>
          )}
        </div>

        {!selectedExamReview ? (
          <div className='rounded-md bg-gray-50 p-4 text-sm text-gray-600'>
            상단 시험후기 목록에서 시험후기를 선택해주세요.
          </div>
        ) : isLoadingDetail ? (
          <div className='flex flex-col gap-y-2 p-4 md:gap-x-4'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='mt-2 h-9 w-full' />
              </div>
            ))}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'review' | 'post' | 'comments' | 'logs')
            }
            className='w-full p-4'
          >
            <div className='flex flex-col gap-2'>
              <div className='mt-3 flex items-center justify-between gap-3'>
                <Tabs.List className='inline-flex gap-4'>
                  <Tabs.Trigger value='review' className='w-fit'>
                    시험후기 상세정보
                  </Tabs.Trigger>
                  <Tabs.Trigger value='post' className='w-fit'>
                    게시글 및 작성자 정보
                  </Tabs.Trigger>
                  <Tabs.Trigger value='comments' className='w-fit'>
                    댓글 목록 ({selectedExamReviewDetail?.commentCount ?? 0})
                  </Tabs.Trigger>
                  <Tabs.Trigger value='logs' className='w-fit'>
                    관리 이력 ({selectedExamReviewDetail?.logs?.length ?? 0})
                  </Tabs.Trigger>
                </Tabs.List>
                <div className='flex items-center gap-2'>
                  {activeTab === 'review' ? (
                    isEditMode ? (
                      <>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='h-8 px-5 text-xs'
                          onClick={handleCancel}
                          disabled={isDisabled || isSaving}
                        >
                          취소
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          className='h-8 bg-blue-600 px-5 text-xs text-white hover:bg-blue-700'
                          onClick={openSaveModal}
                          disabled={isDisabled || !isDirty || isSaving}
                        >
                          {isSaving ? (
                            <span className='inline-flex items-center gap-1'>
                              <Loader2 className='h-3 w-3 animate-spin' />
                              저장 중
                            </span>
                          ) : (
                            '저장'
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type='button'
                        variant='secondary'
                        size='sm'
                        className='h-8 bg-blue-100 px-5 text-xs text-blue-700 hover:bg-blue-200 hover:text-blue-800'
                        onClick={() => setIsEditMode((prev) => !prev)}
                        disabled={isDisabled}
                      >
                        <Pencil className='mr-1.5 h-3.5 w-3.5' />
                        편집 모드
                      </Button>
                    )
                  ) : null}
                </div>
              </div>

              <Tabs.Content value='review' className='min-h-[680px]'>
                <Card>
                  <Card.Content className='flex min-h-[620px] flex-col gap-y-2 p-4'>
                    <ExamReviewDetailInfoSection
                      formData={formData}
                      setFormData={(partialData) =>
                        setFormData((prev) => ({ ...prev, ...partialData }))
                      }
                      isFormDisabled={isFormDisabled}
                      onFileDownload={handleFileDownload}
                      fileInputRef={fileInputRef}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  </Card.Content>
                </Card>
              </Tabs.Content>

              <Tabs.Content value='post' className='min-h-[460px]'>
                <Card>
                  <Card.Content className='p-4'>
                    <ExamReviewPostInfoSection
                      postId={formData.postId}
                      uploadTime={formData.uploadTime}
                      author={formData.author}
                      encryptedUserId={formData.encryptedUserId}
                    />
                  </Card.Content>
                </Card>
              </Tabs.Content>

              <Tabs.Content value='comments' className='min-h-[460px]'>
                <Card>
                  <Card.Content className='p-4'>
                    <ExamReviewCommentSection postId={formData.postId} />
                  </Card.Content>
                </Card>
              </Tabs.Content>

              <Tabs.Content value='logs' className='min-h-[460px]'>
                <Card>
                  <Card.Content className='p-4'>
                    <ExamReviewLogSection
                      logs={selectedExamReviewDetail?.logs}
                    />
                  </Card.Content>
                </Card>
              </Tabs.Content>
            </div>
          </Tabs>
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
        confirmText={isDeleting ? '삭제 중' : '삭제'}
        confirmButtonClassName='bg-red-600 text-white hover:bg-red-700'
        confirmDisabled={!deleteReason.trim() || isDeleting}
        closeText='취소'
        onClose={closeDeleteModal}
        onConfirm={handleDeleteClick}
        title='시험 후기 삭제'
        description='기존 메모 아래에 삭제 사유를 추가해 저장합니다.'
      >
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='exam-review-existing-memo'
              className='text-sm font-medium text-gray-700'
            >
              기존 메모
            </label>
            <Textarea
              id='exam-review-existing-memo'
              value={selectedExamReviewDetail?.memo ?? ''}
              placeholder='기존 메모가 없습니다.'
              className='min-h-[96px] resize-none bg-gray-50'
              readOnly
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='exam-review-delete-reason'
              className='text-sm font-medium text-gray-700'
            >
              삭제 사유
            </label>
            <Textarea
              id='exam-review-delete-reason'
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              placeholder='삭제 사유를 입력해주세요.'
              className='min-h-[120px] resize-none'
              disabled={isDeleting}
            />
          </div>
        </div>
      </ConfirmModal>
    </article>
  );
}
