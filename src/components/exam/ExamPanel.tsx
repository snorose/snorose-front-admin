import { useState } from 'react';
import { Button } from '../ui';

type Tab = 'edit' | 'warning' | 'delete' | 'demotion' | 'discussion';

const TAB_BASE_STYLE =
  'text-xs border-r-2 py-2 px-4 font-semibold text-left w-full';
const TAB_ACTIVE_STYLE = 'border-blue-500 text-blue-500 bg-blue-50';
const TAB_INACTIVE_STYLE = 'border-transparent text-gray-500';

const TABS: { value: Tab; label: string }[] = [
  { value: 'edit', label: '편집' },
  { value: 'warning', label: '경고' },
  { value: 'delete', label: '삭제' },
  { value: 'demotion', label: '강등' },
  { value: 'discussion', label: '논의사항' },
];

const TABLE_CELL_BASE_STYLE = 'border border-gray-300 text-left text-[10px]';
const TABLE_HEADER_STYLE = `${TABLE_CELL_BASE_STYLE} bg-gray-50 font-medium w-[120px] px-3 py-1`;
const TABLE_DATA_STYLE = `${TABLE_CELL_BASE_STYLE} p-0`;

export default function ExamPanel() {
  // 초기값 상수
  const INITIAL_VALUES = {
    examReviewName: '수학 중간고사 후기 - 난이도 적절',
    lectureName: '미적분학 I',
    professorName: '김교수',
    examTypeAndQuestions: '객관식 5문항',
    discussionNotes: '',
  };

  const [activeTab, setActiveTab] = useState<Tab>('edit');
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 변경사항 감지
  const hasChanges =
    examReviewName !== INITIAL_VALUES.examReviewName ||
    lectureName !== INITIAL_VALUES.lectureName ||
    professorName !== INITIAL_VALUES.professorName ||
    examTypeAndQuestions !== INITIAL_VALUES.examTypeAndQuestions ||
    discussionNotes !== INITIAL_VALUES.discussionNotes;

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  const getTabClassName = (tab: Tab) => {
    const isActive = activeTab === tab;
    return `${TAB_BASE_STYLE} ${isActive ? TAB_ACTIVE_STYLE : TAB_INACTIVE_STYLE}`;
  };

  return (
    <div className='flex rounded-lg border border-gray-200'>
      {/* 메뉴 탭 - 왼쪽 세로 배치 */}
      <div className='flex min-w-[80px] flex-col shadow'>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={getTabClassName(tab.value)}
            onClick={() => handleTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 테이블 영역 */}
      <div className='flex w-full flex-col gap-2 px-4 py-2'>
        {/* 버튼 영역 */}
        <div className='flex justify-start gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-6 w-20 text-xs text-red-400 hover:text-red-400'
            disabled={!hasChanges}
          >
            초기화
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-6 w-20 text-xs'
            disabled={!hasChanges}
          >
            수정 완료
          </Button>
        </div>
        <div className='w-full overflow-auto'>
          {/* 선택된 row 정보 - table */}
          <table className='w-full border-collapse'>
            <tbody>
              <tr>
                <th className={TABLE_HEADER_STYLE}>상태</th>
                <td className={TABLE_DATA_STYLE}>
                  <div className='px-2 py-1'>확인</div>
                </td>
              </tr>
              <tr>
                <th className={TABLE_HEADER_STYLE}>시험후기명</th>
                <td
                  className={`border p-0 text-left text-[10px] ${
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
                  className={`border p-0 text-left text-[10px] ${
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
                  className={`border p-0 text-left text-[10px] ${
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
                  <div className='px-2 py-1'>2024-1</div>
                </td>
              </tr>
              <tr>
                <th className={TABLE_HEADER_STYLE}>시험종류</th>
                <td className={TABLE_DATA_STYLE}>
                  <div className='px-2 py-1'>중간고사</div>
                </td>
              </tr>
              <tr>
                <th className={TABLE_HEADER_STYLE}>시험 유형 및 문항수</th>
                <td
                  className={`border p-0 text-left text-[10px] ${
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
                <td className={TABLE_DATA_STYLE}>
                  <div className='px-2 py-1'>2024-06-01 12:00</div>
                </td>
              </tr>
              <tr>
                <th className={TABLE_HEADER_STYLE}>게시자</th>
                <td className={TABLE_DATA_STYLE}>
                  <div className='px-2 py-1'>홍길동</div>
                </td>
              </tr>
              <tr>
                <th className={TABLE_HEADER_STYLE}>기타 논의사항</th>
                <td
                  className={`border p-0 text-left text-[10px] ${
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
                  <div className='px-2 py-1'>관리자1</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
