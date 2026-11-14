# 문의 및 신고 E2E 테스트

실제 dev 환경에서 문의·신고 화면을 확인합니다. 공통 실행 설정은 [E2E 가이드](../../../docs/playwright-e2e-guide.md), 상세 테스트 케이스는 [문의·신고 QA TC](../../../docs/inquiry-report-admin-test-cases.md)를 참고합니다.

## 현재 검증 상태

- 조회 23개·변경 6개로 TC는 총 29개이며, 로그인 준비를 포함하면 30개가 수집됩니다.
- 2026-11-14 실제 API E2E: 로그인 준비 포함 **29개 통과·1개 생략 (3.9분)**.
- TC-ADM-IR-021은 탈퇴 작성자의 공개 댓글 데이터가 없어 생략했습니다. 해당 작성자 표시는 단위·통합 테스트로 확인했습니다.
- 관련 단위·통합 테스트 **180개**, 린트·프로덕션 빌드가 통과했습니다.

## 실행

저장소 루트에서 실행합니다. 테스트 서버는 Playwright가 준비합니다.

```bash
# 최근 변경의 조회 회귀 테스트
npx playwright test e2e/features/inquiry-report/inquiry-report-authors.read.spec.ts --project=dev-read

# 문의·신고 조회 테스트
npm run test:e2e:read -- e2e/features/inquiry-report

# 문의·신고 변경 테스트
npm run test:e2e:write -- e2e/features/inquiry-report/inquiry-report.write.spec.ts

# 문의·신고 전체 테스트
npx playwright test e2e/features/inquiry-report --project=dev-read --project=dev-write

# 테스트 수집만 확인
npx playwright test e2e/features/inquiry-report --project=dev-read --project=dev-write --list
```

브라우저를 보려면 `npm run test:e2e:headed -- e2e/features/inquiry-report`를 사용합니다. 기능 경로를 생략하면 다른 기능의 테스트도 실행됩니다.

## 준비 데이터

- 공통 실행 설정 외에 기존 read/write 테스트에는 전용 문의·신고 QA 글이 필요합니다.
- 댓글·대댓글 테스트에는 댓글을 등록·수정·삭제할 수 있는 QA 글과 공개 최상위 댓글이 필요합니다.
- 최근 회귀 파일은 실제 목록에서 테스트 대상을 찾으며 별도 고정 QA 글을 요구하지 않습니다.

## 테스트 케이스

| 파일                                  | 범위      | 주요 확인 내용                                         |
| ------------------------------------- | --------- | ------------------------------------------------------ |
| `inquiry-report.read.spec.ts`         | 조회 20개 | 목록·필터·페이지 이동·상세·여러 페이지의 댓글·레이아웃 |
| `inquiry-report-authors.read.spec.ts` | 조회 3개  | 작성자 회원 메뉴·담당자·표 너비·통합 검색·즉시 필터    |
| `inquiry-report.write.spec.ts`        | 변경 6개  | 답변 상태 변경·댓글 및 대댓글 등록·수정·삭제           |

TC별 절차·기대 결과·최근 결과는 [상세 TC 문서](../../../docs/inquiry-report-admin-test-cases.md)에서 관리합니다.

## 데이터 정리

조회 테스트는 화면 확인과 이동만 수행합니다. 변경 테스트는 전용 QA 글을 사용하고 종료 후 댓글 등록으로 바뀐 답변 상태까지 복구하고 테스트 댓글을 정리합니다. 같은 QA 글을 사용하는 변경 테스트는 동시에 실행하지 않습니다.

## 검증 한계

- 필요한 신고 유형·첨부·댓글 데이터가 없으면 일부 TC는 생략될 수 있습니다. 현재 생략한 TC는 위 검증 상태에 명시합니다.
- 여러 페이지의 댓글 조회, 조회 실패 안내·재시도는 단위·통합 테스트에서도 확인합니다.
- 담당자 정보 조회는 관련 응답 항목 추가 전까지 화면 통합 테스트로 확인합니다.
- 페이지 정보와 서버 상태 필터 지원 전까지 일부 목록 처리는 프론트에서 수행합니다.

HTML 결과는 `npm run test:e2e:report`로 확인합니다.
