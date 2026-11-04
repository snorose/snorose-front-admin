// 서버 배포 전 기본값은 목 모드다. false로 지정하면 실제 API를 호출한다.
export function isPopupMockEnabled() {
  return import.meta.env.VITE_POPUP_MOCK !== 'false';
}
