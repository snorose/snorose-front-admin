# snorose-front-admin

## 기술 스택

- **프레임워크**: React 19 + Vite + TypeScript
- **스타일링**: Tailwind CSS v4, Radix UI
- **서버 상태**: TanStack Query v5
- **라우팅**: React Router v7
- **주요 라이브러리**: `@tanstack/react-table`, `sonner`, `react-day-picker`

## 디렉토리 구조

```
src/
  apis/          # API 호출 함수 (도메인별 파일)
  domains/       # 도메인별 컴포넌트, 훅, 타입 (Alerts, Comments, Posts, Reviews, ...)
  pages/         # 라우트별 페이지 컴포넌트
  shared/        # 공통 요소
    axios/       # Axios 인스턴스 및 인터셉터
    components/  # 공통 컴포넌트
    constants/   # 상수
    contexts/    # React Context (AuthProvider 등)
    hooks/       # 공통 커스텀 훅
    lib/         # 유틸리티 (cn 등)
    types/       # 공통 타입 정의
    utils/       # 유틸리티 함수
```

## 핵심 패턴

**API 응답 타입**: `BaseResponse<T>`를 axios 제네릭으로 사용하고, API 함수 내부에서 `.result`를 언래핑해 호출자에게 실제 데이터만 반환한다.

```ts
// 데이터 반환
export const getFooAPI = async (): Promise<FooResult> => {
  const response = await axiosInstance.get<BaseResponse<FooResult>>('/v1/foo');
  return response.data.result;
};

// void 반환
export const postFooAPI = async (data: FooRequest): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>('/v1/foo', data);
};
```

**타입 네이밍**: HTTP 응답 래퍼 포함 타입은 `BaseResponse<T>`, 실제 데이터 타입은 `XxxResult`로 분리.

**클래스명**: `cn()` 유틸리티 사용 (clsx + tailwind-merge).

**`any` 금지**: 명확한 `interface` 또는 `type`으로 정의.

## Git 컨벤션

커밋 메시지: `tag: 한국어 설명`

허용 태그: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `merge`

PR: `.github/pull_request_template.md` 양식 사용, `dev` 브랜치 기준.
