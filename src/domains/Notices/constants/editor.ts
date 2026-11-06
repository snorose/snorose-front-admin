// snorose-front FixedMenuEditor의 팔레트와 style/variable.css의 실제 색상입니다.
export const NOTICE_TEXT_COLORS = [
  { label: '회색', value: '#484848' },
  { label: '검정', value: '#000000' },
  { label: '파랑', value: '#00368e' },
  { label: '핑크', value: '#ff4b6c' },
] as const;

export const NOTICE_HIGHLIGHT_COLORS = [
  { label: '핑크', value: '#fee9eb' },
  { label: '노랑', value: '#fdff6c' },
  { label: '연두', value: '#aad916' },
  { label: '파랑', value: '#bfd7ec' },
] as const;

export const NOTICE_EDITOR_COLOR_VARIABLES: Record<string, string> = {
  '--grey-4': '#484848',
  '--blue-4': '#00368e',
  '--pink-3': '#ff4b6c',
  '--pink-1': '#fee9eb',
  '--green-2': '#aad916',
  '--blue-2': '#bfd7ec',
};
