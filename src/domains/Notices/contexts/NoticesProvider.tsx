import type { ReactNode } from 'react';

import { useNoticeState } from '../hooks/useNoticeState';
import { NoticesContext } from './NoticesContext';

export default function NoticesProvider({ children }: { children: ReactNode }) {
  const value = useNoticeState();
  return (
    <NoticesContext.Provider value={value}>{children}</NoticesContext.Provider>
  );
}
