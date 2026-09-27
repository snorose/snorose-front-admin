# Input 공용화 작업 범위

> 2026-09-27 소스 기준. 작업 계획 및 적용 현황. 시험후기·게시글·댓글 관리의 우선 교체 항목은 적용했으며, 후속 항목은 예정 작업이다.

## 1. 적용 방향

**기존 shadcn 기반 [`Input`](../src/shared/components/ui/input.tsx)을 그대로 공용 기준으로 사용한다.** 이미 `shared/components/ui`에서 export하므로 새 `CommonInput`이나 범용 입력 래퍼는 필요하지 않다.

- 일반 텍스트·비밀번호·숫자·날짜 입력은 `Input`을 직접 사용한다.
- 기본 높이 `h-9`, 테두리, 둥근 모서리, 포커스, 비활성·오류 스타일을 유지한다. 호출부에는 너비·배치 위주로 지정한다. 로그인은 입력이 적은 독립 폼이므로 44px 높이를 예외로 유지하고 입력 글자 크기는 14px로 맞춘다.
- 레이블·설명·오류 문구는 기존 `Label` 또는 `Field`와 조합한다. `id`/`htmlFor`, `aria-describedby`, `aria-invalid`로 연결한다.
- 입력 내부 버튼·아이콘이 필요한 곳은 기존 `InputGroup.Input`, `InputGroup.Addon`, `InputGroup.Button`을 활용한다. 검색 실행·초기화·복사 로직은 호출부에 둔다.
- 값 변환, 검증, API 호출은 페이지·도메인에 유지한다. 숫자 입력도 편집 중에는 빈 문자열을 허용하고 기존 제출 시점 변환을 보존한다.

[shadcn 공식 Input 문서](https://ui.shadcn.com/docs/components/input)도 기본 Input에 Field와 InputGroup을 조합하는 방식을 안내한다. 이번 작업은 저장소에 설치된 구현을 기준으로 하며, 최신 컴포넌트 재설치나 UI 라이브러리 전환은 필요하지 않다.

## 2. 페이지별 수정 목록

파일명은 실제 수정할 컴포넌트 기준이다. **교체**는 기본 `<input>` → 공용 `Input`, **정리**는 이미 사용 중인 `Input`의 스타일·레이블 보완을 뜻한다.

### 우선 적용: 기본 input 교체

- [x] **게시글 관리 `/posts/manage`** — [`PostFilterPanel.tsx`](../src/domains/Posts/components/PostFilterPanel.tsx): 시작일·종료일, 게시자 검색, 게시글 검색 **4개 교체**. 개별 테두리·배경·패딩 제거, 레이블 연결.
- [x] **댓글 관리 `/posts/comments`** — [`CommentFilterPanel.tsx`](../src/domains/Comments/components/CommentFilterPanel.tsx): 시작일·종료일, 게시자 검색, 댓글/ID 검색 **4개 교체**. 검색 범위별 placeholder와 값 처리 유지, 레이블 연결.
- [x] **시험후기 관리 `/reviews/exam`** — [`ExamSearch.tsx`](../src/domains/Reviews/components/ExamSearch.tsx): 시험후기명/postId·작성자 검색 **2개 교체**. 지우기 버튼은 InputGroup으로 조합하고 접근성 이름 추가. 기존 날짜 Input 2개의 글자 크기·중복 높이 지정 정리.

**우선 교체 대상은 3개 파일의 입력 10개다.** 시험후기 검색 2개는 InputGroup으로 교체하고, 날짜 Input의 크기 재정의를 정리했다. 검색 입력·지우기 버튼에 접근성 이름도 추가했다. 게시글·댓글의 8개도 공용 Input으로 교체하고 레이블을 연결해 우선 교체를 완료했다. 검색 범위 Select에는 접근성 이름을 추가하고 입력과 높이를 맞췄다. 날짜는 `Input type='date'`로 유지하며, 검색 조건·URL 동기화·Enter 동작을 바꾸지 않는다.

### 후속 적용: 기존 Input 사용처 정리

- [x] **로그인 `/`** — [`LogInPage.tsx`](../src/pages/login/LogInPage.tsx): 아이디·비밀번호에 숨김 레이블과 자동완성 연결. 기존 44px 높이 유지, 입력 글자 크기는 데스크톱에서 기존에 표시되던 14px로 통일. 비밀번호 보기 버튼은 InputGroup으로 조합하고 로딩 중 함께 비활성화. 좁은 화면에서는 폼 너비와 카드 패딩 조정.
- [x] **회원 정보 `/member/info`, `/member/info/:memberKey`** — [`MemberDirectorySection.tsx`](../src/domains/MemberInfo/components/MemberDirectorySection.tsx), [`MemberInfoEditFormFields.tsx`](../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx), [`MemberPointAdjustmentDialog.tsx`](../src/domains/MemberInfo/components/MemberPointAdjustmentDialog.tsx): 검색 아이콘을 InputGroup으로 조합하고 숨김 레이블 연결. 검색·회원 수정·포인트 카테고리 직접 입력·수량의 h-12, 큰 radius, 별도 배경·포커스 재정의 제거. 인접 검색 버튼과 등급·카테고리 Select 높이도 공용 기준으로 정리. useId 기반 레이블 연결과 기존 오류 연결 유지, 자동 수량 readOnly와 bg-muted 배경 유지.
- [x] **경고·강등 관리 `/member/penalty`** — [`MemberPenaltyManagementPage.tsx`](../src/pages/member/MemberPenaltyManagementPage.tsx), [`PenaltyUserInfoView.tsx`](../src/domains/MemberInfo/components/PenaltyUserInfoView.tsx), [`WarnPenaltyTab.tsx`](../src/domains/MemberInfo/components/WarnPenaltyTab.tsx), [`DemotionPenaltyTab.tsx`](../src/domains/MemberInfo/components/DemotionPenaltyTab.tsx): 회원 검색·조회 전용 정보·상세 사유·경고 횟수·강등 개월에 useId 기반 레이블 연결. 검색 결과 오류도 aria-describedby로 연결. 조회 정보·비활성 입력의 배경과 보조 글자 색상을 테마 토큰으로 정리. 학번·아이디 복사 버튼은 InputGroup으로 조합하고 항목별 접근성 이름 추가. 기존 크기·배치, 읽기 전용·비활성 조건과 경고·강등 로직 유지.
- [x] **회원 정보 및 제재 모달 사용 화면** — [`PenaltyHistoryAddFields.tsx`](../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddFields.tsx), [`SearchableSelect.tsx`](../src/domains/MemberInfo/components/SearchableSelect.tsx): 경고/강등 상세 사유·횟수·개월의 높이·radius·배경·오류 스타일 재정의 제거, 공용 Input·Select 기준 적용. useId로 레이블 연결, 상세 사유 레이블 추가, 자동 경고 횟수 안내·강등 종료일 연결. 선택 목록 검색은 InputGroup과 숨김 레이블로 정리하고 IME·Enter 선택 동작 유지. 공유 모달의 값 처리·오류 상태·비활성 조건 유지. 회원·게시글·댓글 도메인 기존 테스트 확인; 실제 화면별 제재 적용 E2E는 미실행.
- [x] **시험후기 상세 및 파일명 변경 `/reviews/exam` 내부** — [`ExamReviewDetailInfoSection.tsx`](../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx), [`ExamReviewFileNameModal.tsx`](../src/domains/Reviews/components/ExamReviewFileNameModal.tsx): 강의명·교수명·분반 입력에 고유 id와 레이블 연결. 파일명 입력은 고유 id로 레이블·설명·오류 연결 유지. 기본 Input, 편집 비활성·파일명 검증·저장 후 포커스 흐름 보존. 현재 상세 정보 컴포넌트에는 정답 Input이 없다.
- [x] **시험후기 작성 기간 `/reviews/exam-period`** — [`ExamReviewPeriodScheduleForm.tsx`](../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx), [`ExamReviewPeriodUpdateConfirmModal.tsx`](../src/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx): 기간 제목 Input 유지, 생성/수정 레이블 연결. useId로 생성 폼과 수정 모달의 입력 id 중복 방지.
- [x] **개별 포인트 지급·차감 `/point/single`** — [`AdjustSinglePointPage.tsx`](../src/pages/points/AdjustSinglePointPage.tsx), [`MemberInfoSection.tsx`](../src/domains/Points/components/MemberInfoSection.tsx), [`PointDetailSection.tsx`](../src/domains/Points/components/PointDetailSection.tsx): 회원 검색에 숨김 레이블 연결. 조회 정보·포인트 유형·수량·메모에 useId 기반 레이블 연결. 공용 Input과 값 처리 유지, 조회 정보·자동 수량의 읽기 전용 배경을 bg-muted로 정리.
- [x] **전체 포인트 지급·차감 `/point/all`** — [`PointDetailSection.tsx`](../src/domains/Points/components/PointDetailSection.tsx): 개별 포인트와 공유하는 PointDetailSection의 레이블 연결과 읽기 전용 배경 변경 함께 반영. 수량·메모 입력과 초기화 로직 유지.
- [x] **포인트 동결 기간 `/point/freeze`** — [`PointFreezeScheduleForm.tsx`](../src/domains/Points/components/PointFreezeScheduleForm.tsx), [`PointFreezeUpdateConfirmModal.tsx`](../src/domains/Points/components/PointFreezeUpdateConfirmModal.tsx): 동결 제목 Input 유지, 생성/수정 레이블 연결 및 useId로 입력 id 중복 방지. 일정 생성·수정과 대기 상태 처리 유지.
- [x] **푸시 알림 `/alerts`** — [`PushNotificationPage.tsx`](../src/pages/alerts/PushNotificationPage.tsx): 알림명·제목·URL Input과 내용 Textarea 유지. 설명·글자 수를 aria-describedby로 연결하고 useId로 레이블·입력·안내의 고유 id 부여. URL 유형·메시지 유형·발송 대상 라디오 그룹에 접근성 이름 연결. 제목 21자·내용 100자 제한과 내부 경로/외부 URL 처리 유지.

높이를 기본값으로 줄이는 화면은 인접 버튼과 Select의 정렬도 함께 확인한다. 입력 크기를 줄이기 위해 페이지 전체를 재설계할 필요는 없다.

### 이번 범위에서 유지할 화면·요소

| 대상                                                  | 처리                                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 엑셀 포인트 업로드 `/point/excel-upload`              | 버튼으로 여는 숨김 `input type='file'` 유지. 파일명 표시와 파싱은 일반 Input 공용화 대상이 아니다. |
| 게시글 상세 `/posts/manage/:postId`                   | 페이지 자체의 입력은 textarea·checkbox 중심이므로 직접 교체 없음. 제재 모달의 공용 변경만 확인.    |
| 문의·신고 `/report/inquiry`                           | 일반 Input 교체 대상 없음. 댓글 Textarea와 분류 Select 유지.                                       |
| 각 목록의 전체/행 선택, 공지 필터, 시험후기 신고 필터 | checkbox는 Input으로 교체하지 않는다. Checkbox 공용화는 별도 작업.                                 |
| 시험후기 상세의 숨김 파일 입력                        | 파일 선택용 기본 input 유지.                                                                       |
| 날짜·시간 선택 `DateTimePicker`                       | Calendar·Select 조합 유지. 이번 Input 통합과 분리.                                                 |
| `ExamWarningPanel`, `ExamDegradePanel`                | 현재 호출되지 않는 컴포넌트이며 기본 input도 checkbox다. 이번 교체에서 제외.                       |
| `PointMultiplePage`, 오류 페이지                      | 일반 입력 및 교체 대상 없음.                                                                       |

## 3. 적용 예시

별도 래퍼 없이 기존 공용 컴포넌트를 import한다. 스타일은 기본값을 사용하고, 상태와 이벤트는 기존 코드를 유지한다.

```tsx
import { Input, Label } from '@/shared/components/ui';

<div className='flex flex-col gap-1'>
  <Label htmlFor='post-author-search'>게시자 검색</Label>
  <Input
    id='post-author-search'
    value={filters.keywordAuthor ?? ''}
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        keywordAuthor: e.target.value || undefined,
      }))
    }
    placeholder='아이디, 닉네임, 학번'
  />
</div>;
```

입력 오류에는 `aria-invalid={Boolean(error)}`를 전달하고, 오류 문구의 id를 `aria-describedby`로 연결한다. 공용 Input에 `error`, `onSearch`, `onClear`, 숫자 변환 같은 도메인 전용 prop을 추가하지 않는다.

## 4. 권장 작업 순서와 완료 기준

- [x] **기본 input 10개 교체:** 게시글 → 댓글 → 시험후기 검색 순서로 작은 변경 단위로 적용한다.
- [ ] **기존 Input 정리:** 회원 화면의 큰 스타일 재정의와 InputGroup 조합을 먼저 정리하고, 나머지 폼의 레이블·상태 연결을 보완한다.
- [ ] **회귀 확인:** 검색·초기화·Enter·URL 복원, 날짜 값, 음수/빈 수량, 읽기 전용·비활성, 오류 표시, 지우기·복사·비밀번호 보기 버튼을 확인한다.

완료 기준:

- [ ] 활성 화면의 일반 입력이 공용 `Input` 또는 이를 사용하는 `InputGroup.Input`으로 렌더링된다.
- [ ] 입력 테두리·포커스·오류 스타일의 페이지별 재정의가 정리되고, 크기 예외는 필요한 곳에만 남는다.
- [ ] 입력마다 접근성 이름이 있고, 설명·오류 문구가 연결된다.
- [ ] 기존 값 처리·검증·검색·저장 동작이 유지된다.
- [ ] 변경 화면의 기존 테스트, `npm run lint`, `npm run build`가 통과하고 키보드 포커스와 좁은 화면 배치를 확인한다.

폼 라이브러리 도입, 검증 로직 통합, Textarea·Select·Checkbox 공용화, 전체 페이지 디자인 변경은 별도 범위로 둔다.
