# 시험후기 담당 관리자 현황

> 대상 화면: `/reviews/exam`<br>
> 상태: 기간 CRUD와 통계 API 연동 구현

관리자가 기간별 시험후기 확인 진행률과 관리자별 확인 처리 건수를 조회한다.

## 화면과 사용자 흐름

1. 시험후기 관리 페이지의 `담당 관리자 현황` 버튼으로 다이얼로그를 연다.
2. 기간은 시작 일시 내림차순으로 표시하며, 새로 열면 첫 기간을 선택한다.
3. 선택 기간의 업로드 건수, 확인 완료·미확인 건수, 확인 완료율과 관리자별 처리 건수를 표시한다. 현황 제목은 `시험후기 확인 현황`이며, `선택한 기간에 업로드된 시험후기의 현재 확인 상태입니다.`로 집계 기준을 안내한다.
4. `기간 편집`으로 기간을 추가·수정·삭제한다. 편집에서 돌아오면 선택을 유지하고, 선택한 기간이 삭제되었으면 첫 기간을 선택한다.
5. 현황과 기간 편집 다이얼로그는 동시에 표시하지 않는다.

모달 상단에 조회 기간을 표시하고, 넓은 화면에서는 시험후기 확인 현황과 관리자별 처리 현황을 좌우로 배치한다. 세 건수는 아이콘 없이 3열로 비교하고, 확인 완료율은 얇은 가로 막대로 표시한다. 모바일에서는 확인 현황 → 관리자별 처리 현황 순서로 세로 배치한다. 기간 버튼과 긴 닉네임은 줄바꿈한다. 모달 헤더는 고정하고 본문과 긴 관리자 목록에 내부 스크롤을 제공한다.

## API 계약

### 기간 관리

기존 `/v1/admin/reviews/period` API를 사용한다.

- 일반 사용자 작성 기간: `WRITE`
- 관리자 편집 및 통계 조회 기간: `ADMIN_EDIT`
- 조회·삭제는 쿼리 파라미터, 추가·수정은 요청 본문에 기존 방식대로 타입을 포함한다.
- 기간을 생성한 뒤 목록을 다시 조회해 생성한 기간을 선택한다.
- 기간을 수정하면 해당 기간의 통계 캐시를 무효화한다.
- 기간을 삭제하면 목록 캐시에서 제거하고 해당 기간의 통계 캐시를 삭제한다.

**`ADMIN_EDIT`는 통계만을 위한 독립적인 기간이 아니다.** 백엔드에서 관리자의 시험후기 편집 가능 여부를 검사할 때도 사용한다. 기간 변경은 편집 가능 일정에도 영향을 줄 수 있다. `WRITE` 기간과는 분리된다.

### 통계 조회

```http
GET /v1/admin/reviews/statics/{periodId}
Authorization: Bearer <accessToken>
```

공통 Axios 인스턴스의 인증·토큰 재발급 처리를 재사용하며, `BaseResponse.result`를 반환한다.

```json
{
  "periodId": 3,
  "periodTitle": "어드민",
  "startAt": "2026-09-03T00:00:00",
  "endAt": "2026-10-12T00:00:00",
  "totalCount": 7,
  "confirmedCount": 5,
  "remainingCount": 2,
  "confirmedRate": 71.4,
  "averagePerAdmin": 4,
  "adminStatics": [
    {
      "encryptedAdminId": "encrypted-admin-1",
      "nickname": "리자",
      "processedCount": 4
    },
    {
      "encryptedAdminId": "encrypted-admin-2",
      "nickname": "어드민테스트",
      "processedCount": 1
    }
  ]
}
```

첨부 명세의 `/v1/admin/reviews/{periodId}`는 기존 상세 조회 경로와 겹친다. 백엔드 `develop` 소스의 실제 매핑인 `/statics/{periodId}`를 따른다. 문서의 `ADMIN_WRITE`도 실제 열거형인 `ADMIN_EDIT`를 따른다.

확인한 백엔드 소스:

- [통계 경로·기간 API](https://github.com/snorose/Snorose-Server/blob/develop/src/main/java/snorose/server/admin/review/controller/AdminReviewController.java)
- [기간 타입](https://github.com/snorose/Snorose-Server/blob/develop/src/main/java/snorose/server/global/enums/ExamReviewPeriodType.java)
- [통계 응답](https://github.com/snorose/Snorose-Server/blob/develop/src/main/java/snorose/server/admin/review/dto/response/ReviewStaticsResponse.java)
- [통계 계산·편집 가능 기간 검사](https://github.com/snorose/Snorose-Server/blob/develop/src/main/java/snorose/server/admin/review/service/AdminReviewService.java)

## 집계와 표시 기준

| 항목               | 기준                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| 기간 내 업로드     | 선택 기간에 업로드된 시험후기 수. 서버 집계 결과 사용                              |
| 확인 완료          | 서버가 집계한 현재 확인 완료 수                                                    |
| 미확인             | 서버의 `remainingCount`                                                            |
| 확인 완료율        | 서버의 `confirmedRate`. 예: `71.4%`                                                |
| 관리자별 처리 건수 | `isConfirmed`가 미확인에서 확인으로 변경된 로그를 관리자별로 집계한 `adminStatics` |
| 평균(화면 미표시)  | `총 시험후기 수 ÷ 처리 관리자 수`를 올림한 서버의 `averagePerAdmin`                |
| 관리자 표시        | 닉네임 사용. 서버에서 `null`이면 `닉네임 없음`                                     |
| 목록 정렬          | 처리 건수 내림차순, 같은 건수는 닉네임 오름차순                                    |

프런트엔드는 서버의 건수와 완료율을 그대로 표시한다. `averagePerAdmin`은 전체 업로드 수를 분자로 사용하므로 관리자별 실제 평균 처리량으로 오해할 수 있어 화면에서 제외한다. API 응답 타입은 유지한다. 관리자 목록 아래에 현재 확인 완료 수와 처리 이력의 합계가 다를 수 있음을 안내한다.

관리자 처리 건수는 확인 전환 로그를 세므로 현재 확인 완료 수와 합계가 같다고 가정하지 않는다. 이전 초안의 “가장 최근 확인 관리자 한 명에게 한 건 귀속” 규칙을 적용하지 않는다. 응답에 `unassignedCount`가 없으므로 `담당자 미상`을 표시하거나 건수 차이로 추정하지 않는다. 로그가 없는 후기의 처리 관리자는 프런트에서 복원하지 않는다.

## 조회 상태와 갱신

- 기간 조회 중: 기간과 현황 스켈레톤
- 기간 없음: 빈 상태와 `기간 추가` 버튼. 통계 요청 없음
- 통계 최초 조회 중: 현황 스켈레톤. 다른 기간의 이전 수치를 표시하지 않음
- 통계 재조회 중: 선택 기간의 캐시가 있으면 즉시 표시하며 백그라운드에서 최신 수치로 갱신. 패널의 `aria-busy`로 갱신 상태 제공
- 조회 실패: 오류 안내와 `다시 시도` 버튼
- 시험후기 0건: 서버가 내려준 `0%`, 세 건수 `0건`
- 관리자 없음: `처리 내역이 없습니다.`와 처리 이력이 생기면 표시된다는 안내
- 통계 쿼리 키: `['examReviewAdminStatus', periodId, startAt, endAt]`
- `staleTime: 0`: 다이얼로그 재진입과 기간 전환 시 최신 통계 조회
- 시험후기 수정·삭제·복구 성공 시 통계 캐시 무효화

실제 서비스의 배포·접속 상태는 별도 확인이 필요하다. 로컬 검증에서는 서버 응답을 테스트용으로 대체하며, 운영 화면에는 Mock 데이터를 사용하지 않는다.

## 주요 구현 파일

- `src/apis/reviews.ts`: 통계 API 함수
- `src/domains/Reviews/types/exam.ts`: 통계 응답 타입
- `src/domains/Reviews/hooks/use-exam-review-admin-status.ts`: 기간별 통계 Query
- `src/domains/Reviews/hooks/use-exam-review-admin-status-periods.ts`: 기간 CRUD와 통계 캐시 관리
- `src/domains/Reviews/components/ExamReviewAdminStatusDialog.tsx`: 기간 선택 및 조회 상태
- `src/domains/Reviews/components/ExamReviewProgressChart.tsx`: 완료율과 건수
- `src/domains/Reviews/components/ExamReviewAdminStatusList.tsx`: 로그 기반 처리 목록
- `src/pages/reviews/ExamReviewPage.tsx`: 진입 버튼, 수정·삭제·복구 후 통계 무효화

## 검증

- API의 `statics/{periodId}` 경로와 응답 반환
- 소수 완료율 표시와 평균 지표 제외
- 기간 전환 중 로딩과 다이얼로그 재진입 후 갱신
- 오류·재시도, 기간 없음, 후기 0건, 관리자 없음
- 로그 합계와 확인 완료 수가 다른 경우 및 닉네임 누락
- 기존 기간 CRUD·시험후기 관리 회귀 테스트
- `npm run lint`, `npm run build`
