import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui';
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
  type ExamReviewDetailResult,
  type UpdateExamReviewRequest,
} from '@/apis/exam';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Trash2, Loader2 } from 'lucide-react';
import type { ExamReview } from './ExamTable';
import ConfirmModal from '../ui/confirm-modal';
import { Skeleton } from '../ui/skeleton';

const TABLE_CELL_BASE_STYLE = 'border border-gray-300 text-left text-[12px]';
const TABLE_HEADER_STYLE = `${TABLE_CELL_BASE_STYLE} bg-gray-100 font-medium w-[120px] px-3 py-1`;
const TABLE_DATA_STYLE = `${TABLE_CELL_BASE_STYLE} p-0 font-medium`;
const TABLE_DATA_READONLY_STYLE = `${TABLE_DATA_STYLE} bg-gray-50 text-gray-400`;
const SELECT_TRIGGER_STYLE =
  'm-1 !h-5 border-0 bg-transparent px-2 py-0.5 text-[11px] shadow-none hover:bg-transparent data-[size=default]:!h-5 data-[size=sm]:!h-5';
const SELECT_CONTENT_STYLE =
  'text-[10px] max-h-[200px] overflow-y-auto bg-blue-50 [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-highlighted]]:bg-blue-100/50 [&_[data-state=checked]]:bg-blue-100';

// 상태 점 컴포넌트
const StatusDot = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const statusColor = STATUS_COLOR.find((color) => color.code === status);
    return statusColor?.color || 'bg-white';
  };

  return (
    <div className='flex items-center justify-center'>
      <div
        className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
        title={status}
      />
    </div>
  );
};

interface ExamEditPanelProps {
  selectedExamReview?: ExamReview | null;
  selectedExamReviewDetail?: ExamReviewDetailResult | null;
  isLoadingDetail?: boolean;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export default function ExamEditPanel({
  selectedExamReview,
  selectedExamReviewDetail,
  isLoadingDetail,
  onSaveSuccess,
  onDeleteSuccess,
}: ExamEditPanelProps = {}) {
  // 초기값 상수

  const [status, setStatus] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [examReviewName, setExamReviewName] = useState('');
  const [uploadTime, setUploadTime] = useState('');
  const [lectureName, setLectureName] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [classNumber, setClassNumber] = useState<number | null>(null);
  const [semester, setSemester] = useState('');
  const [lectureType, setLectureType] = useState<
    | 'MAJOR_REQUIRED'
    | 'MAJOR_ELECTIVE'
    | 'GENERAL_REQUIRED'
    | 'GENERAL_ELECTIVE'
    | 'OTHER'
  >('MAJOR_ELECTIVE');
  const [isPF, setIsPF] = useState<string>('X');
  const [isOnline, setIsOnline] = useState<string>('X');
  const [examType, setExamType] = useState('');
  const [fileName, setFileName] = useState('');
  const [examTypeAndQuestions, setExamTypeAndQuestions] = useState('');
  const [author, setAuthor] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDeleted, setIsFileDeleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기값 저장 (변경사항 비교용)
  const [initialValues, setInitialValues] = useState<{
    status: string;
    lectureName: string;
    professorName: string;
    classNumber: number | null;
    semester: string;
    lectureType:
      | 'MAJOR_REQUIRED'
      | 'MAJOR_ELECTIVE'
      | 'GENERAL_REQUIRED'
      | 'GENERAL_ELECTIVE'
      | 'OTHER';
    isPF: string;
    isOnline: string;
    examType: string;
    questionDetail: string;
  } | null>(null);

  // 폼 리셋 함수
  const resetForm = () => {
    setStatus('');
    setPostId(null);
    setExamReviewName('');
    setUploadTime('');
    setLectureName('');
    setProfessorName('');
    setClassNumber(null);
    setSemester('');
    setLectureType('MAJOR_ELECTIVE');
    setIsPF('X');
    setIsOnline('X');
    setExamType('');
    setFileName('');
    setExamTypeAndQuestions('');
    setAuthor('');
    setFocusedInput(null);
    setSelectedFile(null);
    setIsFileDeleted(false);
    setIsSaving(false);
  };

  // lectureType enum을 문자열로 변환
  const convertLectureTypeToString = (
    lectureTypeEnum:
      | 'MAJOR_REQUIRED'
      | 'MAJOR_ELECTIVE'
      | 'GENERAL_REQUIRED'
      | 'GENERAL_ELECTIVE'
      | 'OTHER'
  ): string => {
    const typeMap: Record<string, string> = {
      MAJOR_REQUIRED: '전공필수',
      MAJOR_ELECTIVE: '전공선택',
      GENERAL_REQUIRED: '교양필수',
      GENERAL_ELECTIVE: '교양선택',
      OTHER: '기타',
    };
    return typeMap[lectureTypeEnum] || lectureTypeEnum;
  };

  // selectedExamReviewDetail이 변경되면 폼 값 업데이트 또는 리셋
  useEffect(() => {
    if (selectedExamReviewDetail) {
      setPostId(selectedExamReviewDetail.postId);
      setStatus(
        selectedExamReviewDetail.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED'
      );
      setExamReviewName(selectedExamReviewDetail.title);
      // createdAt 포맷 변환: "2024-12-21T01:42:16.596374" -> "2024-12-21 01:42"
      const date = new Date(selectedExamReviewDetail.createdAt);
      const uploadTimeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      setUploadTime(uploadTimeStr);
      setLectureName(selectedExamReviewDetail.lectureName);
      setProfessorName(selectedExamReviewDetail.professor);
      setClassNumber(selectedExamReviewDetail.classNumber);
      // semester enum을 문자열로 변환
      const semesterStr = convertSemesterEnumToString(
        selectedExamReviewDetail.semester,
        selectedExamReviewDetail.lectureYear
      );
      setSemester(semesterStr);
      setLectureType(selectedExamReviewDetail.lectureType);
      setIsPF(selectedExamReviewDetail.isPF ? 'O' : 'X');
      setIsOnline(selectedExamReviewDetail.isOnline ? 'O' : 'X');
      // examType enum을 문자열로 변환
      const examTypeStr = convertExamTypeEnumToString(
        selectedExamReviewDetail.examType
      );
      setExamType(examTypeStr);
      setFileName(selectedExamReviewDetail.fileName);
      setExamTypeAndQuestions(selectedExamReviewDetail.questionDetail);
      setAuthor(selectedExamReviewDetail.userDisplay);
      setSelectedFile(null);
      setIsFileDeleted(false);

      // 초기값 저장
      setInitialValues({
        status: selectedExamReviewDetail.isConfirmed
          ? 'CONFIRMED'
          : 'UNCONFIRMED',
        lectureName: selectedExamReviewDetail.lectureName,
        professorName: selectedExamReviewDetail.professor,
        classNumber: selectedExamReviewDetail.classNumber,
        semester: semesterStr,
        lectureType: selectedExamReviewDetail.lectureType,
        isPF: selectedExamReviewDetail.isPF ? 'O' : 'X',
        isOnline: selectedExamReviewDetail.isOnline ? 'O' : 'X',
        examType: examTypeStr,
        questionDetail: selectedExamReviewDetail.questionDetail,
      });
    } else {
      // 선택 해제 시 폼 리셋
      resetForm();
      setInitialValues(null);
    }
  }, [selectedExamReviewDetail]);

  // 상태 이름 가져오기
  const getStatusName = (statusCode: string) => {
    const statusOption = STATUS_COLOR.find((s) => s.code === statusCode);
    return statusOption?.name || '확인';
  };

  // semester enum을 문자열로 변환: "FIRST" -> "2024-1" 형식
  const convertSemesterEnumToString = (
    semesterEnum: 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER',
    year: number
  ): string => {
    if (semesterEnum === 'FIRST') {
      return `${year}-1`;
    }
    if (semesterEnum === 'SECOND') {
      return `${year}-2`;
    }
    if (semesterEnum === 'SUMMER') {
      return `${year} 여름`;
    }
    if (semesterEnum === 'WINTER') {
      return `${year} 겨울`;
    }
    if (semesterEnum === 'OTHER') {
      return `${year} 기타`;
    }
    return '';
  };

  // semester 문자열을 enum으로 변환: "2024-1" -> "FIRST", "2024-2" -> "SECOND" 등
  const convertSemesterToEnum = (
    semesterStr: string
  ): 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER' => {
    if (
      semesterStr.includes('1') &&
      !semesterStr.includes('여름') &&
      !semesterStr.includes('겨울')
    ) {
      return 'FIRST';
    }
    if (
      semesterStr.includes('2') &&
      !semesterStr.includes('여름') &&
      !semesterStr.includes('겨울')
    ) {
      return 'SECOND';
    }
    if (semesterStr.includes('여름')) {
      return 'SUMMER';
    }
    if (semesterStr.includes('겨울')) {
      return 'WINTER';
    }
    return 'OTHER';
  };

  // examType enum을 문자열로 변환: "MIDTERM" -> "중간고사", "FINALTERM" -> "기말고사"
  const convertExamTypeEnumToString = (
    examTypeEnum: 'MIDTERM' | 'FINALTERM'
  ): string => {
    if (examTypeEnum === 'MIDTERM') {
      return '중간고사';
    }
    return '기말고사';
  };

  // examType 문자열을 enum으로 변환: "중간고사" -> "MIDTERM", "기말고사" -> "FINALTERM"
  const convertExamTypeToEnum = (
    examTypeStr: string
  ): 'MIDTERM' | 'FINALTERM' => {
    if (examTypeStr === '중간고사') {
      return 'MIDTERM';
    }
    return 'FINALTERM';
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (isSaving) {
      return; // 이미 저장 중이면 중복 호출 방지
    }

    if (!selectedExamReview || !selectedExamReviewDetail || !initialValues) {
      toast.error('선택된 시험 후기가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      // 변경된 필드만 포함하는 post 객체 생성
      const post: UpdateExamReviewRequest['post'] = {};

      // 각 필드가 변경되었는지 확인하고 변경된 것만 추가
      if (lectureName !== initialValues.lectureName) {
        post.lectureName = lectureName || undefined;
      }

      if (professorName !== initialValues.professorName) {
        post.professor = professorName || undefined;
      }

      if (classNumber !== initialValues.classNumber) {
        post.classNumber = classNumber ?? undefined;
      }

      if (semester !== initialValues.semester) {
        // semester에서 연도 추출 (예: "2024-1" -> 2024)
        const yearMatch = semester.match(/^(\d{4})/);
        const lectureYear = yearMatch
          ? parseInt(yearMatch[1], 10)
          : selectedExamReviewDetail.lectureYear;
        post.lectureYear = lectureYear;
        post.semester = convertSemesterToEnum(semester);
      }

      if (lectureType !== initialValues.lectureType) {
        post.lectureType = lectureType;
      }

      if (isPF !== initialValues.isPF) {
        post.isPF = isPF === 'O';
      }

      if (isOnline !== initialValues.isOnline) {
        post.isOnline = isOnline === 'O';
      }

      if (examType !== initialValues.examType) {
        post.examType = convertExamTypeToEnum(examType);
      }

      if (status !== initialValues.status) {
        post.isConfirmed = status === 'CONFIRMED';
      }

      if (examTypeAndQuestions !== initialValues.questionDetail) {
        post.questionDetail = examTypeAndQuestions || undefined;
      }

      // 파일 처리 로직:
      // 1. 새 파일이 선택되었으면 (selectedFile이 있으면) → 새 파일 업로드
      // 2. 파일이 삭제되었고 새 파일이 없으면 → undefined (파일 삭제)
      // 3. 둘 다 없으면 → 파일 필드 자체를 보내지 않음 (기존 파일 유지)
      let file: File | undefined | null = null;
      if (selectedFile) {
        file = selectedFile;
      } else if (isFileDeleted) {
        file = undefined;
      }
      // 둘 다 없으면 file은 null로 유지 (필드 자체를 보내지 않음)

      const updateData: UpdateExamReviewRequest = {
        ...(file !== null && { file }), // file이 null이 아니면 포함
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
      console.log(selectedExamReview?.id);
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
      status !== initialValues.status ||
      lectureName !== initialValues.lectureName ||
      professorName !== initialValues.professorName ||
      classNumber !== initialValues.classNumber ||
      semester !== initialValues.semester ||
      lectureType !== initialValues.lectureType ||
      isPF !== initialValues.isPF ||
      isOnline !== initialValues.isOnline ||
      examType !== initialValues.examType ||
      examTypeAndQuestions !== initialValues.questionDetail ||
      selectedFile !== null || // 새 파일이 선택되었는지
      isFileDeleted // 파일이 삭제되었는지
    );
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = async () => {
    if (!selectedExamReview || !fileName) {
      toast.error('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      const blob = await downloadExamReviewFile(
        selectedExamReview.id,
        fileName
      );

      // Blob을 URL로 변환하여 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
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
    setFileName('');
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (selectedExamReviewDetail && initialValues) {
      // 원래 값으로 복원
      setPostId(selectedExamReviewDetail.postId);
      setStatus(initialValues.status);
      setLectureName(initialValues.lectureName);
      setProfessorName(initialValues.professorName);
      setClassNumber(initialValues.classNumber);
      setSemester(initialValues.semester);
      setLectureType(initialValues.lectureType);
      setIsPF(initialValues.isPF);
      setIsOnline(initialValues.isOnline);
      setExamType(initialValues.examType);
      setExamTypeAndQuestions(initialValues.questionDetail);
      setSelectedFile(null);
      setIsFileDeleted(false);
      if (selectedExamReviewDetail) {
        setFileName(selectedExamReviewDetail.fileName);
      }
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
                      value={status}
                      onValueChange={setStatus}
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <div className='flex items-center gap-2'>
                          <StatusDot status={status} />
                          <span>{getStatusName(status)}</span>
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
                              <StatusDot status={statusOption.code} />
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
                    <div className='px-2 py-1'>{postId ?? ''}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>게시자</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{author}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>시험후기명</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{examReviewName}</div>
                  </td>
                </tr>
                <tr className='h-[30px]'>
                  <th className={TABLE_HEADER_STYLE}>업로드시간</th>
                  <td className={TABLE_DATA_READONLY_STYLE}>
                    <div className='px-2 py-1'>{uploadTime}</div>
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
                      ) : fileName ? (
                        <div className='flex-1'>
                          <span
                            className='cursor-pointer text-blue-500 underline hover:text-blue-700'
                            onClick={handleFileDownload}
                            title='클릭하여 다운로드'
                          >
                            {fileName}
                          </span>
                        </div>
                      ) : (
                        <div className='flex-1'>{fileName}</div>
                      )}
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!selectedExamReview || isLoadingDetail}
                          className='rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {fileName || selectedFile
                            ? '파일 변경'
                            : '파일 업로드'}
                        </button>
                        <button
                          type='button'
                          onClick={handleFileDelete}
                          disabled={
                            !selectedExamReview ||
                            isLoadingDetail ||
                            (!selectedFile && !fileName && !isFileDeleted)
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
                            setFileName(file.name);
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
                      value={lectureName}
                      onChange={(e) => setLectureName(e.target.value)}
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
                      value={professorName}
                      onChange={(e) => setProfessorName(e.target.value)}
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
                      value={semester}
                      onValueChange={setSemester}
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{semester}</SelectValue>
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
                      value={examType}
                      onValueChange={setExamType}
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{examType}</SelectValue>
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
                      value={lectureType}
                      onValueChange={(value) =>
                        setLectureType(
                          value as (typeof LECTURE_TYPE_OPTIONS)[number]['value']
                        )
                      }
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>
                          {convertLectureTypeToString(lectureType)}
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
                    className={`$${TABLE_CELL_BASE_STYLE} ${
                      focusedInput === 'classNumber'
                        ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='number'
                      value={classNumber ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setClassNumber(
                          value === '' ? null : parseInt(value, 10)
                        );
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
                      value={isPF}
                      onValueChange={setIsPF}
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{isPF}</SelectValue>
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
                      value={isOnline}
                      onValueChange={setIsOnline}
                      disabled={!selectedExamReview || isLoadingDetail}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                        <SelectValue>{isOnline}</SelectValue>
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
                      value={examTypeAndQuestions}
                      onChange={(e) => setExamTypeAndQuestions(e.target.value)}
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
