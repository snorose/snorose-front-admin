# 모달 공통 기준

## 구성과 스타일

- 폼·조회형은 `Dialog`, 확인·취소형은 `ConfirmModal`을 사용한다.
- 기본 모서리는 `rounded-lg`, 테두리는 1px, 패딩은 `p-6`(24px), 영역 간격은 `gap-4`(16px)이다.
- 제목은 `text-lg font-semibold`(18px), 여러 줄은 `leading-snug`로 표시한다. 설명과 확인창 본문은 `text-sm`(14px)이다.
- 기본 너비는 `sm:max-w-lg`, 모바일 좌우 여백은 16px이다. 비교표·편집창·짧은 선택창은 내용에 맞게 너비를 조절할 수 있다.
- 헤더의 제목과 설명 간격은 8px이다. `ConfirmModal`은 닫기 버튼과 겹치지 않도록 헤더 오른쪽 공간을 확보한다.
- 버튼은 `size='default'`(높이 36px), 간격은 8px이다. 취소는 `outline`, 확인은 `default`, 삭제는 `destructive`를 사용한다.
- 데스크톱 버튼은 취소·확인 순서로 오른쪽 정렬한다. 모바일에서는 확인이 위, 취소가 아래인 세로 배치를 사용한다.
- `ConfirmModal`은 최대 높이 `80dvh` 안에서 헤더·버튼을 유지하고 본문만 스크롤한다.
- 화면별 모서리·패딩·제목·버튼 스타일 덮어쓰기는 지양한다. 기존 사용처 정리는 별도 단계로 진행한다.

## 확인창의 상태와 닫기

```tsx
<ConfirmModal
  isOpen={isOpen}
  title='일정 삭제'
  description='이 일정을 삭제하시겠습니까?'
  confirmText='삭제'
  confirmVariant='destructive'
  confirmDisabled={!isValid}
  isPending={isPending}
  pendingText='삭제 중…'
  onConfirm={handleDelete}
  onClose={handleClose}
/>
```

- `confirmDisabled`: 입력 미완성 등으로 확인만 비활성화한다. 취소·X·Esc·바깥 클릭은 허용한다.
- `isPending`: 확인·취소·X를 비활성화하고 Esc·바깥 클릭으로 닫히는 것도 차단한다. 확인 버튼에 스피너와 `pendingText`(기본 `처리 중…`)를 표시한다.
- 열림 상태 변경은 닫힐 때만 `onClose`로 전달한다. 요청 성공 후 부모가 `isOpen`을 변경해 닫을 수 있다.
- 요청 상태와 성공·실패 처리는 호출부에서 관리한다. `onConfirm`의 반환값으로 처리 중 상태를 자동 추론하지 않는다.
- 기존 호출부의 `confirmDisabled`는 의미가 유지된다. 처리 중 닫기도 막으려면 후속 작업에서 `isPending`을 명시적으로 연결한다.
- 폼·조회형 `Dialog`의 기본 닫기 동작은 유지한다. `Dialog.Content`의 `closeButtonDisabled`는 내장 X 버튼만 비활성화한다. 요청 중 Esc·바깥 클릭 제어는 별도로 연결해야 한다.
