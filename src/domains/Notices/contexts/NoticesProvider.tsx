import type { ReactNode } from 'react';

import { useNoticeMockState } from '../hooks/useNoticeMockState';
import { NoticesContext } from './NoticesContext';

export default function NoticesProvider({ children }: { children: ReactNode }) {
  const value = useNoticeMockState();
  return (
    <NoticesContext.Provider value={value}>{children}</NoticesContext.Provider>
  );
}
