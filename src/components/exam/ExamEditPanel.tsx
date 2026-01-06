import { useState, useEffect } from 'react';
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
  MANAGER_LIST,
  SEMESTER_LIST,
  EXAM_TYPE_LIST,
} from '@/constants/exam-table-options';
import type { ExamReview } from './ExamTable';

const TABLE_CELL_BASE_STYLE = 'border border-gray-300 text-left text-[10px]';
const TABLE_HEADER_STYLE = `${TABLE_CELL_BASE_STYLE} bg-gray-100 font-medium w-[120px] px-3 py-1`;
const TABLE_DATA_STYLE = `${TABLE_CELL_BASE_STYLE} p-0 font-medium`;
const TABLE_DATA_READONLY_STYLE = `${TABLE_DATA_STYLE} bg-gray-50 text-gray-400`;
const SELECT_TRIGGER_STYLE =
  'm-1 !h-5 border-0 bg-transparent px-2 py-0.5 text-[10px] shadow-none hover:bg-transparent data-[size=default]:!h-5 data-[size=sm]:!h-5';
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
}

export default function ExamEditPanel({
  selectedExamReview,
}: ExamEditPanelProps = {}) {
  // 초기값 상수
  const INITIAL_VALUES = {
    status: 'CONFIRMED',
    examReviewName: '수학 중간고사 후기 - 난이도 적절',
    lectureName: '미적분학 I',
    professorName: '김교수',
    semester: '2024-1',
    examType: '중간고사',
    examTypeAndQuestions: '객관식 5문항',
    discussionNotes: '',
    manager: '관리자1',
    uploadTime: '2024-06-01 12:00',
    author: '홍길동',
  };

  const [status, setStatus] = useState<string>(INITIAL_VALUES.status);
  const [examReviewName, setExamReviewName] = useState(
    INITIAL_VALUES.examReviewName
  );
  const [lectureName, setLectureName] = useState(INITIAL_VALUES.lectureName);
  const [professorName, setProfessorName] = useState(
    INITIAL_VALUES.professorName
  );
  const [examTypeAndQuestions, setExamTypeAndQuestions] = useState(
    INITIAL_VALUES.examTypeAndQuestions
  );
  const [discussionNotes, setDiscussionNotes] = useState(
    INITIAL_VALUES.discussionNotes
  );
  const [semester, setSemester] = useState(INITIAL_VALUES.semester);
  const [examType, setExamType] = useState(INITIAL_VALUES.examType);
  const [manager, setManager] = useState(INITIAL_VALUES.manager);
  const [uploadTime, setUploadTime] = useState(INITIAL_VALUES.uploadTime);
  const [author, setAuthor] = useState(INITIAL_VALUES.author);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // selectedExamReview가 변경되면 폼 값 업데이트
  useEffect(() => {
    if (selectedExamReview) {
      setStatus(selectedExamReview.status);
      setExamReviewName(selectedExamReview.reviewTitle);
      setLectureName(selectedExamReview.courseName);
      setProfessorName(selectedExamReview.professor);
      setSemester(selectedExamReview.semester);
      setExamType(selectedExamReview.examType);
      setExamTypeAndQuestions(selectedExamReview.examFormat);
      setDiscussionNotes(selectedExamReview.discussion);
      setManager(selectedExamReview.manager);
      setUploadTime(selectedExamReview.uploadTime);
      setAuthor(selectedExamReview.author);
    }
  }, [selectedExamReview]);

  // 상태 이름 가져오기
  const getStatusName = (statusCode: string) => {
    const statusOption = STATUS_COLOR.find((s) => s.code === statusCode);
    return statusOption?.name || '확인';
  };

  return (
    <div className='flex w-full flex-col gap-2 px-4 py-2'>
      <div className='w-full overflow-auto'>
        {/* 선택된 row 정보 - table */}
        <p className='px-1 py-1 text-[14px] font-semibold'># 시험후기 편집</p>
        <table className='w-full border-collapse'>
          <tbody>
            <tr>
              <th className={TABLE_HEADER_STYLE}>상태</th>
              <td className={TABLE_DATA_STYLE}>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                    <div className='flex items-center gap-2'>
                      <StatusDot status={status} />
                      <span>{getStatusName(status)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent align='start' className={SELECT_CONTENT_STYLE}>
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
            <tr>
              <th className={TABLE_HEADER_STYLE}>시험후기명</th>
              <td
                className={`border p-0 text-left text-[10px] font-medium ${
                  focusedInput === 'examReviewName'
                    ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type='text'
                  value={examReviewName}
                  onChange={(e) => setExamReviewName(e.target.value)}
                  onFocus={() => setFocusedInput('examReviewName')}
                  onBlur={() => setFocusedInput(null)}
                  className='w-full bg-transparent px-2 py-1 text-[10px] outline-none'
                />
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>강의명</th>
              <td
                className={`border p-0 text-left text-[10px] font-medium ${
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
                  className='w-full bg-transparent px-2 py-1 text-[10px] outline-none'
                />
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>교수</th>
              <td
                className={`border p-0 text-left text-[10px] font-medium ${
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
                  className='w-full bg-transparent px-2 py-1 text-[10px] outline-none'
                />
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>수강학기</th>
              <td className={TABLE_DATA_STYLE}>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                    <SelectValue>{semester}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align='start' className={SELECT_CONTENT_STYLE}>
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
            <tr>
              <th className={TABLE_HEADER_STYLE}>시험종류</th>
              <td className={TABLE_DATA_STYLE}>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                    <SelectValue>{examType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align='start' className={SELECT_CONTENT_STYLE}>
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
            <tr>
              <th className={TABLE_HEADER_STYLE}>시험 유형 및 문항수</th>
              <td
                className={`border p-0 text-left text-[10px] font-medium ${
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
                  className='w-full bg-transparent px-2 py-1 text-[10px] outline-none'
                />
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>업로드 시간</th>
              <td className={TABLE_DATA_READONLY_STYLE}>
                <div className='px-2 py-1'>{uploadTime}</div>
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>게시자</th>
              <td className={TABLE_DATA_READONLY_STYLE}>
                <div className='px-2 py-1'>{author}</div>
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>기타 논의사항</th>
              <td
                className={`border p-0 text-left text-[10px] font-medium ${
                  focusedInput === 'discussionNotes'
                    ? 'border-blue-500 outline-1 outline-offset-[-1px] outline-blue-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type='text'
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  onFocus={() => setFocusedInput('discussionNotes')}
                  onBlur={() => setFocusedInput(null)}
                  className='w-full bg-transparent px-2 py-1 text-[10px] outline-none'
                />
              </td>
            </tr>
            <tr>
              <th className={TABLE_HEADER_STYLE}>담당리자</th>
              <td className={TABLE_DATA_STYLE}>
                <Select value={manager} onValueChange={setManager}>
                  <SelectTrigger className={SELECT_TRIGGER_STYLE}>
                    <SelectValue>{manager}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align='start' className={SELECT_CONTENT_STYLE}>
                    {MANAGER_LIST.map((managerOption) => (
                      <SelectItem
                        key={managerOption}
                        value={managerOption}
                        className='text-[12px] font-medium'
                      >
                        {managerOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 버튼 영역 */}
      <div className='flex justify-end gap-2 pt-2'>
        <Button
          variant='secondary'
          size='sm'
          className='h-6 w-20 text-sm'
          disabled={!discussionNotes}
          onClick={() => setDiscussionNotes('')}
        >
          취소
        </Button>
        <Button
          variant='default'
          size='sm'
          className='h-6 w-20 bg-gray-700 text-sm'
          disabled={!discussionNotes}
        >
          저장
        </Button>
      </div>
    </div>
  );
}
