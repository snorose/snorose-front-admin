import { useState } from 'react';

interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabListsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export default function TabList({ tabs, defaultTab }: TabListsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab ?? tabs[0]?.value ?? ''
  );
  const fallbackTabsByDefault: Record<
    string,
    Pick<TabItem, 'label' | 'value'>[]
  > = {
    point: [
      { label: '포인트 내역', value: 'point' },
      { label: '다운받은 시험후기', value: 'review' },
      { label: '강등/경고 내역', value: 'blacklist' },
    ],
    warn: [
      { label: '경고 관리', value: 'warn' },
      { label: '강등 관리', value: 'demotion' },
    ],
  };
  const fallbackTabs = defaultTab
    ? (fallbackTabsByDefault[defaultTab] ?? [])
    : [];
  const visibleTabs =
    tabs.length > 0
      ? tabs
      : fallbackTabs.map((tab) => ({
          ...tab,
          content: null,
        }));

  return (
    <div className='w-full'>
      <div className='flex gap-4 border-b pb-2'>
        {visibleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-600 hover:text-black'
            } ${tabs.length === 0 ? 'opacity-70' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='mt-4'>
        {tabs.length === 0 ? (
          <div className='rounded-md border bg-white px-4 py-6 text-center text-gray-500'>
            회원을 검색해 주세요.
          </div>
        ) : (
          tabs.map(
            (tab) =>
              activeTab === tab.value && (
                <div key={tab.value}>{tab.content}</div>
              )
          )
        )}
      </div>
    </div>
  );
}
