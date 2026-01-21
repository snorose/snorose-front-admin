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
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0].value);

  return (
    <div className='w-full'>
      <div className='flex gap-4 border-b pb-2'>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-600 hover:text-black'
            } `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='mt-4'>
        {tabs.map(
          (tab) =>
            activeTab === tab.value && <div key={tab.value}>{tab.content}</div>
        )}
      </div>
    </div>
  );
}
