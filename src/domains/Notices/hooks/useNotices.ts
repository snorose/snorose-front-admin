import { useContext } from 'react';

import { NoticesContext } from '../contexts/NoticesContext';

export function useNotices() {
  const context = useContext(NoticesContext);
  if (!context) throw new Error('NoticesProvider가 필요합니다.');
  return context;
}
