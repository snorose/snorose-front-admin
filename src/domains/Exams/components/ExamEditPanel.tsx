import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  STATUS_COLOR,
  SEMESTER_LIST,
  EXAM_TYPE_LIST,
  LECTURE_TYPE_OPTIONS,
} from '@/constants/exam-table-options';
import {
  deleteExamReview,
  updateExamReview,
  downloadExamReviewFile,
} from '@/apis/exam';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Trash2, Loader2 } from 'lucide-react';
import type {
  LectureType,
  ExamReview,
  ExamReviewDetailResult,
  UpdateExamReviewRequest,
} from '@/domains/Exams/types/exam';
import ConfirmModal from '@/components/ui/confirm-modal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  convertLectureTypeToString,
  convertSemesterEnumToString,
  convertExamTypeEnumToString,
  convertSemesterToEnum,
  convertExamTypeToEnum,
  getStatusName,
} from '@/domains/Exams/utils/examFormatters';
import { ExamStatusDot } from '@/domains/Exams/components';

const TABLE_CELL_BASE_STYLE = 'border border-gray-300 text-left text-[12px]';
const TABLE_HEADER_STYLE = `${TABLE_CELL_BASE_STYLE} bg-gray-100 font-medium w-[120px] px-3 py-1`;
const TABLE_DATA_STYLE = `${TABLE_CELL_BASE_STYLE} p-0 font-medium`;
const TABLE_DATA_READONLY_STYLE = `${TABLE_DATA_STYLE} bg-gray-50 text-gray-400`;
const SELECT_TRIGGER_STYLE =
  'm-1 !h-5 border-0 bg-transparent px-2 py-0.5 text-[11px] shadow-none hover:bg-transparent data-[size=default]:!h-5 data-[size=sm]:!h-5';
const SELECT_CONTENT_STYLE =
  'text-[10px] max-h-[200px] overflow-y-auto bg-blue-50 [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-highlighted]]:bg-blue-100/50 [&_[data-state=checked]]:bg-blue-100';

interface ExamEditPanelProps {
  selectedExamReview?: ExamReview | null;
  selectedExamReviewDetail?: ExamReviewDetailResult | null;
  isLoadingDetail?: boolean;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

interface FormData {
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
}

interface InitialValues {
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
}

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

export default function ExamEditPanel({
  selectedExamReview,
  selectedExamReviewDetail,
  isLoadingDetail,
  onSaveSuccess,
  onDeleteSuccess,
}: ExamEditPanelProps = {}) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDeleted, setIsFileDeleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(
    null
  );

  // 폼 리셋 함수
  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFocusedInput(null);
    setSelectedFile(null);
    setIsFileDeleted(false);
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

  // formInitialValues가 변경되면 상태 업데이트
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
      setIsFileDeleted(false);
      setInitialValues(formInitialValues.initialValues);
    } else {
      resetForm();
      setInitialValues(null);
    }
  }, [formInitialValues]);

  // 편집 내용 저장 핸들러
  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!selectedExamReview || !selectedExamReviewDetail || !initialValues) {
      toast.error('선택된 시험 후기가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const post: UpdateExamReviewRequest['post'] = {}; // 변경된 필드만 포함하는 post 객체 생성

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

      let file: File | undefined | null = null; // 파일 선택 로직 (파일 없으면 안 보냄)
      if (selectedFile) {
        file = selectedFile;
      } else if (isFileDeleted) {
        file = undefined;
      }

      const updateData: UpdateExamReviewRequest = {
        ...(file !== null && { file }),
        post,
      };

      const response = await updateExamReview(
        selectedExamReview.id,
        updateData
      );

      if (response.isSuccess) {
        toast.success('시험 후기가 성공적으로 수정되었습니다.');
        setIsFileDeleted(false);
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

  // 삭제 핸들러
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

  // 변경사항 확인 함수
  const hasChanges = (): boolean => {
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
      selectedFile !== null || // 새 파일이 선택되었는지
      isFileDeleted // 파일이 삭제되었는지
    );
  };

  // 파일 다운로드 핸들러
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

  // 파일 삭제 핸들러
  const handleFileDelete = () => {
    setSelectedFile(null);
    setIsFileDeleted(true);
    setFormData((prev) => ({ ...prev, fileName: '' }));
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (selectedExamReviewDetail && initialValues) {
      // 원래 값으로 복원
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
      setIsFileDeleted(false);
    }
  };

  // 스켈레톤 테이블 렌더링
  const renderSkeletonTable = () => (
    <>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>상태</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-24' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>id</th>
        <td className={TABLE_DATA_READONLY_STYLE}>
          <Skeleton className='mx-2 my-1 h-4 w-16' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>게시자</th>
        <td className={TABLE_DATA_READONLY_STYLE}>
          <Skeleton className='mx-2 my-1 h-4 w-20' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>시험후기명</th>
        <td className={TABLE_DATA_READONLY_STYLE}>
          <Skeleton className='mx-2 my-1 h-4 w-32' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>업로드시간</th>
        <td className={TABLE_DATA_READONLY_STYLE}>
          <Skeleton className='mx-2 my-1 h-4 w-28' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>업로드 파일</th>
        <td className={`${TABLE_DATA_READONLY_STYLE} bg-white`}>
          <div className='flex items-center justify-between px-2 py-1'>
            <Skeleton className='h-4 w-32' />
            <div className='flex items-center gap-1'>
              <Skeleton className='h-5 w-16' />
              <Skeleton className='h-5 w-16' />
            </div>
          </div>
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>강의명</th>
        <td className='border border-gray-300 p-0 text-left text-[10px] font-medium'>
          <Skeleton className='mx-2 my-1 h-4 w-32' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>교수</th>
        <td className='border border-gray-300 p-0 text-left text-[10px] font-medium'>
          <Skeleton className='mx-2 my-1 h-4 w-24' />
        </td>
      </tr>
      <tr>
        <th className={TABLE_HEADER_STYLE}>학기</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-20' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>시험 종류</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-20' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>강의 종류</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-20' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>분반</th>
        <td className='border border-gray-300 p-0 text-left text-[10px] font-medium'>
          <Skeleton className='mx-2 my-1 h-4 w-12' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>P/F</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-8' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>온라인 수업</th>
        <td className={TABLE_DATA_STYLE}>
          <Skeleton className='m-1 h-5 w-8' />
        </td>
      </tr>
      <tr className='h-[30px]'>
        <th className={TABLE_HEADER_STYLE}>시험 유형 및 문항수</th>
        <td className='border border-gray-300 p-0 text-left text-[10px] font-medium'>
          <Skeleton className='mx-2 my-1 h-4 w-40' />
        </td>
      </tr>
    </>
  );

  return (
    <div className='flex w-full flex-col gap-2 px-4 py-2'>
      <div className='w-full overflow-auto'>
        {/* 선택된 row 정보 - table */}
        <div className='flex items-center justify-between py-1'>
          <p className='text-[14px] font-semibold'># 시험후기 편집</p>
          <div
            className='cursor-pointer rounded-sm bg-red-100 p-1 hover:bg-red-200'
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ pointerEvents: isLoadingDetail ? 'none' : 'auto' }}
          >
            <Trash2 className='h-4 w-4 text-red-500' />
          </div>
        </div>
        <table className='w-full border-collapse'>
          <tbody>
            {isLoadingDetail ? (
              renderSkeletonTable()
            ) : (
              <>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>상태</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <div className='flex items-center gap-2'>
                          <ExamStatusDot status={formData.status} />
                          <span>{getStatusName(formData.status)}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        {STATUS_COLOR.map((statusOption) => (
                          <SelectItem
                            key={statusOption.code}
                            value={statusOption.code}
                            className='text-[12px] font-medium'
                          >
                            <div className='flex items-center gap-2'>
                              <ExamStatusDot status={statusOption.code} />
                              <span>{statusOption.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>id</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{formData.postId ?? ''}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>게시자</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{formData.author}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>시험후기명</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{formData.examReviewName}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>업로드시간</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{formData.uploadTime}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>업로드 파일</th>
                  <td className={`${TABLE_DATA_READONLY_STYLE} bg-white`}>
                    <div className='flex items-center justify-between px-2 py-1'>
                      {selectedFile ? (
                        <div
                          className='flex-1 cursor-pointer text-blue-500 underline hover:text-blue-700'
                          onClick={() => fileInputRef.current?.click()}
                          title='클릭하여 파일 선택'
                        >
                          {selectedFile.name}
                        </div>
                      ) : isFileDeleted ? (
                        <div className='flex-1 text-gray-400 italic'>
                          파일 없음
                        </div>
                      ) : formData.fileName ? (
                        <div className='flex-1'>
                          <span
                            className='cursor-pointer text-blue-500 underline hover:text-blue-700'
                            onClick={handleFileDownload}
                            title='클릭하여 다운로드'
                          >
                            {formData.fileName}
                          </span>
                        </div>
                      ) : (
                        <div className='flex-1'>{formData.fileName}</div>
                      )}
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!selectedExamReview || isLoadingDetail}
                          className='rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {formData.fileName || selectedFile
                            ? '파일 변경'
                            : '파일 업로드'}
                        </button>
                        <button
                          type='button'
                          onClick={handleFileDelete}
                          disabled={
                            !selectedExamReview ||
                            isLoadingDetail ||
                            (!selectedFile &&
                              !formData.fileName &&
                              !isFileDeleted)
                          }
                          className='rounded bg-gray-500 px-2 py-0.5 text-[10px] text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          파일 제거
                        </button>
                      </div>
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
                            setIsFileDeleted(false); // 새 파일 선택 시 삭제 플래그 해제
                          }
                          // 같은 파일을 다시 선택할 수 있도록 value 리셋
                          if (e.target) {
                            e.target.value = '';
                          }
                        }}
                        accept='.pdf,.doc,.docx,.hwp'
                      />
                    </div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>강의명</th>
                  <td
                    className={`${TABLE_CELL_BASE_STYLE} ${
                      focusedInput === 'lectureName'
                        ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='text'
                      value={formData.lectureName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lectureName: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedInput('lectureName')}
                      onBlur={() => setFocusedInput(null)}
                      disabled={!selectedExamReview || isLoadingDetail}
                      className='w-full bg-transparent px-2 py-1 outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    />
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>교수</th>
                  <td
                    className={`${TABLE_CELL_BASE_STYLE} ${
                      focusedInput === 'professorName'
                        ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='text'
                      value={formData.professorName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professorName: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedInput('professorName')}
                      onBlur={() => setFocusedInput(null)}
                      disabled={!selectedExamReview || isLoadingDetail}
                      className='w-full bg-transparent px-2 py-1 outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    />
                  </td>
                </tr>
                <tr>
                  <th className={TABLE_HEADER_STYLE}>학기</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, semester: value }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{formData.semester}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        {SEMESTER_LIST.map((semesterOption) => (
                          <SelectItem
                            key={semesterOption}
                            value={semesterOption}
                            className='text-[12px] font-medium'
                          >
                            {semesterOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>시험 종류</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.examType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, examType: value }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{formData.examType}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        {EXAM_TYPE_LIST.map((examTypeOption) => (
                          <SelectItem
                            key={examTypeOption}
                            value={examTypeOption}
                            className='text-[12px] font-medium'
                          >
                            {examTypeOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>강의 종류</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.lectureType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          lectureType:
                            value as (typeof LECTURE_TYPE_OPTIONS)[number]['value'],
                        }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>
                          {convertLectureTypeToString(formData.lectureType)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        {LECTURE_TYPE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className='text-[12px] font-medium'
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>분반</th>
                  <td
                    className={`${TABLE_CELL_BASE_STYLE} ${
                      focusedInput === 'classNumber'
                        ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='number'
                      value={formData.classNumber ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          classNumber:
                            value === '' ? null : parseInt(value, 10),
                        }));
                      }}
                      onFocus={() => setFocusedInput('classNumber')}
                      onBlur={() => setFocusedInput(null)}
                      disabled={!selectedExamReview || isLoadingDetail}
                      className='w-full bg-transparent px-2 py-1 outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      min='1'
                    />
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>P/F</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.isPF}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, isPF: value }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{formData.isPF}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        <SelectItem
                          value='O'
                          className='text-[12px] font-medium'
                        >
                          O
                        </SelectItem>
                        <SelectItem
                          value='X'
                          className='text-[12px] font-medium'
                        >
                          X
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>온라인 수업</th>
                  <td className={TABLE_DATA_STYLE}>
                    <Select
                      value={formData.isOnline}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, isOnline: value }))
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{formData.isOnline}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align='start'
                        className={SELECT_CONTENT_STYLE}
                      >
                        <SelectItem
                          value='O'
                          className='text-[12px] font-medium'
                        >
                          O
                        </SelectItem>
                        <SelectItem
                          value='X'
                          className='text-[12px] font-medium'
                        >
                          X
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>시험 유형 및 문항수</th>
                  <td
                    className={`${TABLE_CELL_BASE_STYLE} ${
                      focusedInput === 'examTypeAndQuestions'
                        ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='text'
                      value={formData.examTypeAndQuestions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          examTypeAndQuestions: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedInput('examTypeAndQuestions')}
                      onBlur={() => setFocusedInput(null)}
                      disabled={!selectedExamReview || isLoadingDetail}
                      className='w-full bg-transparent px-2 py-1 outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      {/* 버튼 영역 */}
      <div className='flex justify-end gap-2 pt-2'>
        <Button
          variant='secondary'
          size='sm'
          className='h-6 w-20 text-sm'
          onClick={handleCancel}
          disabled={!selectedExamReview || isLoadingDetail || !hasChanges()}
        >
          취소
        </Button>
        <Button
          variant='default'
          size='sm'
          className='h-6 w-20 bg-gray-700 text-sm'
          onClick={handleSave}
          disabled={
            !selectedExamReview || isLoadingDetail || !hasChanges() || isSaving
          }
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
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        confirmText='삭제'
        closeText='취소'
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClick}
        title='시험 후기 삭제'
        description='시험 후기를 삭제하시겠습니까?'
      />
    </div>
  );
}
