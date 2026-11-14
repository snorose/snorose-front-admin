# FAQ E2E 테스트

실제 dev 환경에서 FAQ 목록과 작성·수정·삭제를 확인합니다. 공통 실행 설정은 [E2E 가이드](../../../docs/playwright-e2e-guide.md)를 참고합니다.

## 실행

저장소 루트에서 실행합니다. 별도 고정 FAQ를 지정할 필요는 없습니다.

```bash
npx playwright test e2e/features/faqs --project=dev-read --project=dev-write
npm run test:e2e:read -- e2e/features/faqs/faqs.read.spec.ts
npm run test:e2e:write -- e2e/features/faqs/faqs.write.spec.ts
E2E_SLOW_MO=300 npm run test:e2e:headed -- e2e/features/faqs/faqs.read.spec.ts
```

## 테스트 케이스

| TC             | 검증 내용                                                             |
| -------------- | --------------------------------------------------------------------- |
| TC-ADM-FAQ-001 | 메뉴 진입, 목록 정보·순서·전체 건수                                   |
| TC-ADM-FAQ-002 | 10개 단위 번호형 페이지 이동·URL 페이지 반영                          |
| TC-ADM-FAQ-003 | 분류 미선택 안내                                                      |
| TC-ADM-FAQ-004 | 제목 누락 안내                                                        |
| TC-ADM-FAQ-005 | 내용 누락 안내                                                        |
| TC-ADM-FAQ-006 | 공백만 입력한 경우 안내                                               |
| TC-ADM-FAQ-007 | 작성 취소 확인·계속 작성 시 입력 유지                                 |
| TC-ADM-FAQ-008 | 잘못된 페이지 보정·새로고침                                           |
| TC-ADM-FAQ-009 | 작성·수정·삭제와 취소, 줄바꿈·이모지·URL 보존                         |
| TC-ADM-FAQ-010 | 작성자 정보에 따른 회원 메뉴 또는 이름 표시                           |
| TC-ADM-FAQ-011 | 행 아래 내용 펼침·접기와 수정 버튼                                    |
| TC-ADM-FAQ-012 | QA FAQ 11개로 2페이지 이동·내용 표시·펼침 해제                        |
| TC-ADM-FAQ-013 | 작성 중 뒤로 가기 확인·계속 작성 시 입력 유지                         |
| TC-ADM-FAQ-015 | 드롭다운 마지막 옵션에서 카테고리 추가, 칩 X 삭제·재선택, 저장·재사용 |
| TC-ADM-FAQ-016 | 텍스트 검색 비활성화·카테고리 즉시 적용·복원·초기화                   |

## 데이터 정리

조회 테스트는 기존 FAQ를 변경하지 않습니다. 변경 테스트는 전용 FAQ를 생성하여 확인한 뒤 종료 시 정리합니다. 페이지 이동 테스트는 별도로 11개를 생성하며, 기존 FAQ는 수정하거나 삭제하지 않습니다.

## 검증 한계

- 일부 조회 TC에는 등록된 FAQ가 필요합니다.
- 실패 응답·중복 제출·작성자 변경 후 정보 갱신은 단위·통합 테스트에서도 확인합니다.
- 유저 화면의 FAQ 이관·반영은 이번 어드민 E2E 범위에 포함하지 않습니다.

## 실행 결과

- 확인일: `2026-11-14`
- 실제 API E2E: 로그인 준비 1개·조회 12개·변경 3개로 **16개 통과**
- 단위·통합 테스트: 작성자 정보 갱신 회귀를 포함해 **35개 통과**
- 프로덕션 빌드·린트: 통과
- 테스트로 생성한 FAQ: 정리 완료

HTML 결과는 `npm run test:e2e:report`로 확인합니다.
