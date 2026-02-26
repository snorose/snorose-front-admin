# <img src="https://github.com/user-attachments/assets/546a4306-4c36-4717-94e5-1b7d360ffe36" width="40" height="auto"/> 스노로즈 어드민 사이트

스노로즈는 숙명인이 직접 운영하는 숙명인만을 위한 커뮤니티입니다.

<img src="https://github.com/user-attachments/assets/6a5bc684-d05a-488a-ac54-9a656f01fae1" width="200" height="auto"/>

<br>
<br>

## 🚀 프로젝트 배경

운영기획팀(운영 관리·이벤트 기획·회계 파트)은 회원 관리, 게시글·댓글 모니터링, 포인트 정산, 시험 후기 검수, 이벤트 기획 등 커뮤니티 전반의 운영을 담당합니다.<br>
회원과 콘텐츠 규모가 점차 확대되면서, 운영 업무를 보다 효율적이고 체계적으로 관리할 수 있는 환경의 필요성이 커졌습니다.<br>
이에 따라 운영 효율을 높이고 관리 부담을 줄이기 위한 관리자 전용 페이지를 개발했습니다.

<br />

## 🔧 사용 기술

- 코어: `React`, `TypeScript`
- 상태 관리: `TanStack Query`
- UI/스타일링: `tailwind`, `shadcn/ui`
- 빌드 도구: `Vite`
- 패키지 매니저: `npm`
- 배포: `Cloudflare Pages`
- 테스트: `Vitest`

<br>

## 📂 프로젝트 구조

공통 요소와 비즈니스 도메인을 분리한 구조를 기반으로 설계했습니다.

```text
src/
├── apis/                    # API 호출 함수
├── assets/                  # 정적 자산 (이미지, 로고 등)
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
└── domains/                 # 도메인별 기능
    ├── Points/
    │   ├── components/
    │   ├── hooks/
    │   └── ...
    └── Reviews/
        ├── components/
        ├── hooks/
        └── ...
```

<br>
