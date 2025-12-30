import { useState } from 'react';
import {
  ExamEditPanel,
  ExamDiscussionPanel,
  ExamWarningPanel,
  ExamDeletePanel,
  ExamDegradePanel,
} from './index';

type Tab = 'edit' | 'warning' | 'delete' | 'demotion' | 'discussion';

const TAB_BASE_STYLE = 'text-xs py-2 px-4 font-semibold text-left w-full';
const TAB_ACTIVE_STYLE = 'border-blue-500 text-blue-500 bg-blue-50';
const TAB_INACTIVE_STYLE = 'border-transparent text-gray-500';

const TABS: { value: Tab; label: string }[] = [
  { value: 'edit', label: '편집' },
  { value: 'discussion', label: '논의사항' },
  { value: 'delete', label: '삭제' },
  { value: 'warning', label: '경고' },
  { value: 'demotion', label: '강등' },
];

export default function ExamPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('edit');

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  const getTabClassName = (tab: Tab) => {
    const isActive = activeTab === tab;
    return `${TAB_BASE_STYLE} ${isActive ? TAB_ACTIVE_STYLE : TAB_INACTIVE_STYLE}`;
  };

  return (
    <div className='flex overflow-hidden rounded-lg border border-gray-200'>
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
      <div className='flex-1'>
        {activeTab === 'edit' && <ExamEditPanel />} {/* 편집 */}
        {activeTab === 'discussion' && <ExamDiscussionPanel />} {/* 논의사항 */}
        {activeTab === 'delete' && <ExamDeletePanel />} {/* 삭제 */}
        {activeTab === 'warning' && <ExamWarningPanel />} {/* 경고 */}
        {activeTab === 'demotion' && <ExamDegradePanel />} {/* 강등 */}
      </div>
    </div>
  );
}
