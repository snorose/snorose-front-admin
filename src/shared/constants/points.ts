export const POINT_CATEGORY_OPTIONS = Object.freeze([
  {
    value: 'ATTENDANCE',
    label: '출석체크',
    points: null,
  },
  {
    value: 'POINT_REWARD_REPORT_GENERAL',
    label: '일반 신고 보상 (호칭, 도배 등)',
    points: 10,
  },
  {
    value: 'POINT_REWARD_REPORT_EXAM_REVIEW',
    label: '시험후기 관련 신고 보상 (중복/허위 족보 등)',
    points: 20,
  },
  {
    value: 'POINT_REWARD_REPORT_OUTSIDER',
    label: '외부인 신고 보상',
    points: 50,
  },
  {
    value: 'POINT_REWARD_REPORT_PERMANENT_DEMOTION',
    label:
      '영구 강등에 해당하는 위반사항 신고 보상 (외부 유출, 아이디 공유 등)',
    points: 100,
  },
  {
    value: 'POINT_REWARD_ETC',
    label: '포인트 보상 - 기타 사유',
    points: null,
  },
  {
    value: 'POINT_DEDUCTION_FLOODING',
    label: '포인트 차감 - 도배',
    points: null,
  },
  {
    value: 'POINT_DEDUCTION_ETC',
    label: '포인트 차감 - 기타 사유',
    points: null,
  },
  {
    value: 'EVENT',
    label: '이벤트',
    points: null,
  },
  {
    value: 'ETC',
    label: '기타',
    points: null,
  },
]);
