# <img src="https://github.com/user-attachments/assets/546a4306-4c36-4717-94e5-1b7d360ffe36" width="40" height="auto"/> 스노로즈 어드민 사이트

스노로즈는 숙명인이 직접 운영하는 숙명인만을 위한 커뮤니티입니다.

<img src="https://github.com/user-attachments/assets/6a5bc684-d05a-488a-ac54-9a656f01fae1" width="200" height="auto"/>

<br>
<br>

## 🚀 프로젝트 목적

스노로즈 운영진이 회원과 콘텐츠를 관리하고, 커뮤니티 운영 업무를 효율적으로 처리할 수 있도록 개발한 관리자 전용 사이트입니다.

회원 관리, 게시글·댓글 모니터링, 포인트 정산, 시험후기 검수, 문의·신고 처리 등 주요 운영 기능을 한곳에서 제공합니다.

<br />

## 🔧 사용 기술

- 코어: `React`, `TypeScript`
- 상태 관리: `TanStack Query`
- UI/스타일링: `tailwind`, `shadcn/ui`
- 빌드 도구: `Vite`
- 패키지 매니저: `npm`
- 배포: `Cloudflare Pages`
- 테스트: `Vitest`, `Testing Library`, `Playwright` (E2E)

<br>

## 🧪 테스트 및 검증

Vitest·Testing Library 기반 테스트와 Playwright E2E 테스트를 사용합니다.
E2E는 실제 dev API·DB를 사용하는 조회·변경 테스트로 구성되어 있으며, 실행 방법과 기능별 안내는 [E2E 문서](./e2e/README.md)를 참고합니다.

<br>

## 📂 프로젝트 구조

공통 요소와 비즈니스 도메인을 분리한 구조를 기반으로 설계했습니다.

```text
src/
├── apis/                    # API 호출 함수
├── assets/                  # 정적 자산 (이미지, 로고 등)
├── components/              # 앱 수준 컴포넌트 (ErrorBoundary 등)
├── domains/                 # 도메인별 기능 (components, hooks 등)
│   ├── Alerts/              # 푸시 알림
│   ├── Comments/            # 댓글 관리
│   ├── InquiryReport/       # 문의·신고 관리
│   ├── MemberInfo/          # 회원 관리
│   ├── Points/              # 포인트 관리
│   ├── Posts/               # 게시글 관리
│   └── Reviews/             # 시험후기 관리
├── pages/                   # 페이지 컴포넌트
├── shared/                  # 공유 코드
│   ├── axios/               # Axios 인스턴스 설정
│   ├── components/          # 공통 컴포넌트
│   │   └── ui/              # shadcn/ui 컴포넌트
│   ├── constants/           # 상수 정의
│   ├── contexts/            # React Context
│   ├── hooks/               # 커스텀 훅
│   ├── lib/                 # 라이브러리 유틸 (cn 등)
│   ├── types/               # TypeScript 타입 정의
│   └── utils/               # 유틸리티 함수
└── test/                    # Vitest 공통 설정

e2e/                        # Playwright E2E 테스트
├── features/               # 기능별 조회·변경 테스트
├── setup/                  # 공통 로그인 설정
└── shared/                 # E2E 공통 코드

docs/                       # 개발·리팩터링·QA 문서
```

<br>
