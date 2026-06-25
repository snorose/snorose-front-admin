# /review

현재 diff 또는 지정한 범위의 코드를 리뷰한다.

## 분석 범위

- 인자 없음: `git diff HEAD` (unstaged + staged 전체)
- `staged`: `git diff --cached`
- `{브랜치명}`: `git diff {브랜치}...HEAD`
- 파일 경로 지정 시 해당 파일만

## 리뷰 관점 (이 프로젝트 기준, 우선순위 순)

### 1. 정확성 — 버그, 로직 오류

- 조건 분기 누락, null/undefined 미처리
- 비동기 처리 오류 (Promise 미반환, 경쟁 조건)
- 타입 불일치 (TypeScript `any` 사용, 잘못된 타입 단언)

### 2. 이 프로젝트 패턴 준수

- API 함수: axios 제네릭에 `BaseResponse<T>` 사용 + 내부에서 `.result` 언래핑 여부
  ```ts
  // 올바른 패턴
  const response = await axiosInstance.get<BaseResponse<FooResult>>('/v1/foo');
  return response.data.result;
  ```
- void 반환 API는 `return` 없이 `await`만
- 타입 이름: 래퍼 포함 타입은 `BaseResponse<T>`, 실제 데이터 타입은 `XxxResult`
- 클래스명: `cn()` 유틸리티 사용 여부

### 3. 보안

- 하드코딩된 비밀값, API 키
- XSS 가능성 (dangerouslySetInnerHTML 등)
- 미인증 접근 가능한 경로

### 4. 유지보수성

- 함수/컴포넌트 크기 (50줄 초과 시 분리 검토)
- 불필요한 주석, 매직 넘버
- 중복 코드

## 심각도 분류

| 심각도   | 의미                          | 머지 여부           |
| -------- | ----------------------------- | ------------------- |
| CRITICAL | 보안 취약점, 데이터 손실 위험 | 반드시 수정 후 머지 |
| HIGH     | 버그, 명확한 로직 오류        | 수정 권장           |
| MEDIUM   | 유지보수 문제, 패턴 불일치    | 고려 권장           |
| LOW      | 스타일, 사소한 개선           | 선택                |

## 출력 형식

```
## 리뷰 결과

### [HIGH] null 체크 누락
파일: src/apis/users.ts:23
문제: `response.data.result`가 null일 때 호출부에서 런타임 에러 발생 가능
제안: 반환 타입을 `XxxResult | null`로 하거나, API 레이어에서 예외 처리 추가

---
총계: CRITICAL 0 / HIGH 1 / MEDIUM 0 / LOW 0
```

## 금지

- 문제 없을 때 "깔끔합니다!" 같은 빈 칭찬 금지
- 코드 전체 재작성 금지 (지적과 제안에 집중)
- 언어 스타일 취향 차이를 HIGH/CRITICAL로 분류 금지
