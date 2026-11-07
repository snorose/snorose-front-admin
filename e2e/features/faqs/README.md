# FAQ E2E 테스트

기존 `dev-auth` 로그인과 `dev-read`·`dev-write` 프로젝트를 사용합니다. API 응답을 대체하지 않고 실제 dev API와 DB를 검증합니다.

## 실행

저장소 루트에서 실행합니다. 공통 설치·로그인 설정은 [E2E 가이드](../../../docs/playwright-e2e-guide.md)를 참고합니다.

```bash
npx playwright test e2e/features/faqs --project=dev-read --project=dev-write
npm run test:e2e:read -- e2e/features/faqs/faqs.read.spec.ts
npm run test:e2e:write -- e2e/features/faqs/faqs.write.spec.ts
E2E_SLOW_MO=300 npm run test:e2e:headed -- e2e/features/faqs/faqs.read.spec.ts
```

`.env`의 `VITE_API_BASE_URL`과 `.env.e2e.local`의 `E2E_ADMIN_LOGIN_ID`·`E2E_ADMIN_PASSWORD`가 필요합니다. 추가 FAQ ID나 QA 계정은 필요하지 않습니다. 실제 서버 요청은 기존 공통 유틸로 `dev.snorose.com`에 제한합니다.

## 테스트 케이스

| TC             | 검증 내용                                                                           |
| -------------- | ----------------------------------------------------------------------------------- |
| TC-ADM-FAQ-001 | 사이드바 진입, 실제 목록의 열·순서·ID·분류·제목·작성자·날짜·전체 건수               |
| TC-ADM-FAQ-002 | 전체 목록을 10개씩 나눈 번호형 페이지 이동·URL 페이지·이전 페이지 복귀              |
| TC-ADM-FAQ-003 | 분류 미선택 시 필수 입력 안내, 변경 요청 없음                                       |
| TC-ADM-FAQ-004 | 제목 누락 시 브라우저 필수 입력 검증, 변경 요청 없음                                |
| TC-ADM-FAQ-005 | 내용 누락 시 브라우저 필수 입력 검증, 변경 요청 없음                                |
| TC-ADM-FAQ-006 | 공백만 입력한 경우 안내 표시, 변경 요청 없음                                        |
| TC-ADM-FAQ-007 | 작성 취소 확인, 계속 작성 시 내용 유지, 취소 확정 시 닫기                           |
| TC-ADM-FAQ-008 | 잘못된 URL 페이지 보정, 같은 페이지 새로고침                                        |
| TC-ADM-FAQ-009 | 실제 작성·수정·삭제, 수정·삭제 취소, 재조회, 분류 매핑·줄바꿈·빈 줄·이모지·URL 보존 |
| TC-ADM-FAQ-010 | 작성자 텍스트 표시, 회원 버튼·링크 미노출                                           |
| TC-ADM-FAQ-011 | 행 바로 아래 내용 펼침·접기, 펼친 영역의 수정 버튼                                  |
| TC-ADM-FAQ-012 | QA FAQ 11개로 번호형 2페이지 이동·내용 표시·페이지 변경 시 펼침 해제                |
| TC-ADM-FAQ-013 | 작성 중 브라우저 뒤로 가기 확인, 계속 작성 시 입력 보존, 취소 확정 후 이동          |

## 데이터 정리

- read 테스트는 변경 요청을 보내지 않습니다. 필수 입력 검증에서는 요청이 발생하지 않았는지도 확인합니다.
- CRUD write TC는 UI에서 `[E2E:FAQ:<16자리 실행 ID>]`로 시작하는 FAQ 1개를 생성하고, 번호형 페이지 이동 TC는 API로 별도 실행 접두사의 QA FAQ 11개를 생성합니다. 수정 후에도 접두사를 유지합니다. 기존 FAQ는 수정하거나 삭제하지 않습니다.
- 응답의 `faqId`로 모든 페이지를 탐색해 생성한 항목을 검증하므로 신규 항목의 정렬 위치나 페이지 크기를 가정하지 않습니다.
- fixture는 성공·실패 시 현재 실행 접두사의 FAQ만 찾아 삭제하고, 남은 항목이 없는지 재조회합니다. 삭제 전에 전체 대상 ID를 수집하여 페이지가 밀려 누락되는 일을 방지합니다.
- 프로세스 강제 종료나 서버 장애로 정리가 실행되지 못하면 해당 실행 접두사의 QA 항목이 남을 수 있습니다. 다음 실행이 다른 실행의 항목을 자동 삭제하지는 않습니다.

## 검증 한계

- 로그인 또는 API가 실패하면 실패로 보고합니다. 서버 장애를 빈 목록이나 통과로 처리하지 않습니다.
- read TC는 실제 데이터가 10개를 넘으면 2페이지를 비교하고, 10개 이하면 2페이지가 없는지 확인합니다. write TC는 별도로 QA FAQ 11개를 생성하여 2페이지 번호 이동을 반드시 검증합니다.
- 실패 응답·로딩 지연·중복 제출은 기존 FAQ 단위·통합 테스트에서 검증합니다. 이 E2E는 해당 상황을 만들기 위해 실제 서버 응답을 대체하지 않습니다.
- 유저단 FAQ 이관·공개 화면 반영은 이번 어드민 E2E의 범위가 아닙니다.

## 실행 결과

2026-11-07 작성자 검색 연결 제거 후 재검증 결과:

- `npx playwright test e2e/features/faqs/faqs.read.spec.ts --project=dev-read`: **12개 모두 통과 (22.4초)**. 로그인 setup 1개와 FAQ read TC 11개를 실제 dev API로 확인했다.
- 작성자 텍스트 표시와 회원 버튼·링크 미노출, 목록·페이지 이동·행 펼침·입력 검증·작성 중 이탈 보호를 확인했다. 쓰기 E2E는 이번 변경에서 재실행하지 않았다.
- 관련 단위·통합 테스트 37개와 프로덕션 빌드가 통과했다.

2026-11-07 코드 리뷰 수정 후 실제 dev API 실행 결과 (작성자 검색 연결 제거 전):

- `npx playwright test e2e/features/faqs --project=dev-read --project=dev-write`: **15개 모두 통과 (38.4초)**.
- 실제 어드민 로그인 setup 1개, FAQ read TC 12개, write TC 2개가 통과했다. API 응답을 대체하지 않았다.
- 작성 중 뒤로 가기에 대한 확인과 입력 보존을 검증했다.
- 행 펼침과 QA FAQ 11개를 이용한 번호형 페이지 이동도 통과했다. 당시 포함된 회원 검색 연결 TC는 작성자 텍스트 표시로 변경하면서 교체·제거했다.
- UI로 FAQ를 작성·수정·삭제하고 실제 API를 재조회해 저장 결과를 확인했다. 분류 매핑, 줄바꿈·빈 줄·이모지·URL 보존, 수정·삭제 취소도 확인했다.
- 현재 실행에서 생성한 QA FAQ는 삭제했고, fixture의 최종 재조회에서도 해당 실행 접두사의 항목이 남아 있지 않음을 확인했다.
- HTML 결과는 `npm run test:e2e:report`로 확인할 수 있다.

2026-11-06 실행 결과:

- `npx tsc -p e2e/tsconfig.json`, `npm run lint`: 통과.
- `--list`: 로그인 setup 1개와 FAQ TC 9개를 정상 수집.
- 위의 전체 FAQ 실행 명령: **로그인 setup 1개 실패, FAQ TC 9개 미실행**.
- 로그인 요청의 응답이 없어 공통 인증 setup에서 중단되었다. 별도 HTTP 확인에서 `https://dev.snorose.com/v1/users/login`의 OPTIONS 요청과 `/v1/admin/support/faq`의 GET 요청 모두 `503`을 반환했다.
- 인증 의존 단계에서 중단되어 FAQ 생성·수정·삭제 요청과 QA 데이터 생성은 발생하지 않았다.

당시 서버 장애로 확인하지 못한 실제 API E2E를 2026-11-07 재실행해 위와 같이 통과했다.
