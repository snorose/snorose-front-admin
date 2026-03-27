# Inquiry 도메인 API 스펙

> 프론트엔드 mock 구현 완료 상태. 실제 API 연동 시 각 훅/페이지 파일의 `TODO` 주석 위치 교체.

---

## 공통

### 공통 응답 포맷

```json
{
  "isSuccess": true,
  "message": "요청 성공",
  "result": { ... }
}
```

### Inquiry 객체 (공통 엔티티)

백엔드가 내려줘야 하는 필드 목록입니다.

| 필드             | 타입                              | 필수 | 설명                                               |
| ---------------- | --------------------------------- | ---- | -------------------------------------------------- |
| `id`             | number                            | ✅   | 문의/신고 고유 ID                                  |
| `category`       | `"문의"` \| `"신고"`              | ✅   | 대분류                                             |
| `subCategory`    | string                            | ✅   | 중분류 (아래 허용값 참고)                          |
| `userId`         | string                            | ✅   | 작성자 아이디 (예: `"noonsong(59360001)"`)         |
| `userName`       | string                            | ✅   | 작성자 이름 (예: `"김눈송"`)                       |
| `status`         | string                            | ✅   | 처리 상태 (아래 허용값 참고)                       |
| `title`          | string                            | ✅   | 글 제목                                            |
| `contentPreview` | string                            | ✅   | 본문 앞 30자 (목록 미리보기용)                     |
| `content`        | string                            | ✅   | 본문 전체 (상세 조회 시 사용)                      |
| `attachments`    | `{ name: string; url: string }[]` | ✅   | 첨부파일 목록 (없으면 빈 배열 `[]`)                |
| `reportedLink`   | string \| null                    | —    | 신고 대상 링크 또는 유저 아이디 (신고 유형일 때만) |
| `assignee`       | string \| null                    | —    | 담당 관리자 아이디 (없으면 `null`)                 |
| `adminReply`     | string \| null                    | —    | 관리자 답변 (없으면 `null`)                        |
| `action`         | string \| null                    | —    | 신고 처리 조치 (없으면 `null`, 아래 허용값 참고)   |
| `createdAt`      | string (ISO 8601)                 | ✅   | 작성일                                             |
| `updatedAt`      | string (ISO 8601)                 | ✅   | 최종 수정일                                        |

**허용값**

- `subCategory`: `"족보 관련 문의"` `"기타 문의"` `"족보 신고"` `"게시글 신고"` `"댓글 신고"` `"유저 신고"`
- `status`: `"접수"` `"진행중"` `"진행완료"` `"보류"`
- `action`: `"경고"` `"게시글 삭제"` `"계정 제재"`

---

## 1. 목록 조회

```
GET /v1/inquiries
```

### 프론트 → 백엔드 (Query Parameters)

| 파라미터      | 타입                 | 필수 | 설명                                                              |
| ------------- | -------------------- | ---- | ----------------------------------------------------------------- |
| `keyword`     | string               | N    | 제목·본문·아이디 검색어                                           |
| `category`    | `"문의"` \| `"신고"` | N    | 대분류 필터                                                       |
| `subCategory` | string               | N    | 중분류 필터                                                       |
| `status`      | string               | N    | 처리 상태 필터                                                    |
| `dateFrom`    | string (ISO 8601)    | N    | 작성일 시작                                                       |
| `dateTo`      | string (ISO 8601)    | N    | 작성일 종료                                                       |
| `page`        | number               | N    | 페이지 번호 — **1-based** (미입력 시 1페이지, 페이지당 10건 고정) |

예시 요청:

```
GET /v1/inquiries?keyword=족보&category=신고&status=접수&page=1
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "message": "조회 성공",
  "result": {
    "data": [ Inquiry, Inquiry, ... ],   // 현재 페이지 목록 (최대 10건)
    "hasNext": true,                      // 다음 페이지 존재 여부
    "total": 42                           // 전체 건수 (페이지네이션 표시용)
  }
}
```

> `total`은 페이지 버튼 수 계산에 사용됩니다 (`Math.ceil(total / 10)`).
> 목록에서는 `content` 필드 대신 `contentPreview`만 내려줘도 됩니다.

---

## 2. 상세 조회

```
GET /v1/inquiries/:id
```

### 프론트 → 백엔드

URL 경로에 `id` 포함 (number).

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": Inquiry   // content, attachments 등 전체 필드 포함
}
```

---

## 3. 답변 등록

```
POST /v1/inquiries/:id/reply
```

### 프론트 → 백엔드 (Request Body)

| 필드         | 타입                                                 | 필수 | 설명                                                |
| ------------ | ---------------------------------------------------- | ---- | --------------------------------------------------- |
| `adminReply` | string                                               | ✅   | 관리자 답변 내용                                    |
| `action`     | `"경고"` \| `"게시글 삭제"` \| `"계정 제재"` \| null | N    | 신고 처리 조치 (신고 유형일 때만 전송, 문의는 생략) |

```json
{
  "adminReply": "안녕하세요. 확인 후 조치하였습니다.",
  "action": "경고"
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": Inquiry   // 갱신된 전체 Inquiry 객체 반환
}
```

**백엔드 처리 사항 (서버에서 자동 처리)**

- `status` → `"진행완료"` 로 자동 변경
- 답변 등록 후 사용자 측 수정·삭제 불가 처리

---

## 4. 카테고리 수정

```
PATCH /v1/inquiries/:id/category
```

### 프론트 → 백엔드 (Request Body)

| 필드          | 타입                 | 필수 | 설명          |
| ------------- | -------------------- | ---- | ------------- |
| `category`    | `"문의"` \| `"신고"` | ✅   | 변경할 대분류 |
| `subCategory` | string               | ✅   | 변경할 중분류 |

```json
{
  "category": "문의",
  "subCategory": "기타 문의"
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": Inquiry
}
```

---

## 5. 상태 변경 (단건·일괄 공용)

```
PATCH /v1/inquiries/status
```

> 체크박스로 여러 건 선택 후 일괄 변경에 사용됩니다. 단건도 `ids: [1]` 로 동일하게 처리합니다.

### 프론트 → 백엔드 (Request Body)

| 필드     | 타입     | 필수 | 설명              |
| -------- | -------- | ---- | ----------------- |
| `ids`    | number[] | ✅   | 변경 대상 ID 배열 |
| `status` | string   | ✅   | 변경할 상태값     |

```json
{
  "ids": [1, 3, 7],
  "status": "진행중"
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": {
    "updatedCount": 3 // 실제 변경된 건수
  }
}
```

---

## 6. 담당자 지정 (단건·일괄 공용)

```
PATCH /v1/inquiries/assignee
```

> 체크박스로 여러 건 선택 후 한 번에 동일한 담당자 지정에 사용됩니다.

### 프론트 → 백엔드 (Request Body)

| 필드       | 타입           | 필수 | 설명                                               |
| ---------- | -------------- | ---- | -------------------------------------------------- |
| `ids`      | number[]       | ✅   | 지정 대상 ID 배열                                  |
| `assignee` | string \| null | ✅   | 담당자 아이디. `null` 또는 빈 문자열이면 지정 해제 |

```json
{
  "ids": [1, 3, 7],
  "assignee": "admin01"
}
```

지정 해제 시:

```json
{
  "ids": [1, 3, 7],
  "assignee": null
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": {
    "updatedCount": 3
  }
}
```

---

## 7. FAQ 목록 조회

```
GET /v1/inquiries/faqs
```

### 프론트 → 백엔드

파라미터 없음.

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": [
    {
      "id": 1,
      "question": "족보 다운로드는 어떻게 하나요?",
      "answer": "족보 상세 페이지에서 다운로드 버튼을 클릭하면...",
      "category": "이용 방법",
      "createdAt": "2025-01-10T00:00:00Z",
      "updatedAt": "2025-01-10T00:00:00Z"
    }
  ]
}
```

---

## 8. FAQ 등록

```
POST /v1/inquiries/faqs
```

### 프론트 → 백엔드 (Request Body)

| 필드       | 타입   | 필수 | 설명                                                                       |
| ---------- | ------ | ---- | -------------------------------------------------------------------------- |
| `question` | string | ✅   | 질문 내용                                                                  |
| `answer`   | string | ✅   | 답변 내용                                                                  |
| `category` | string | ✅   | FAQ 카테고리 (예: `"이용 방법"`, `"포인트"`, `"계정"`, `"족보"`, `"기타"`) |

```json
{
  "question": "포인트가 사라졌어요.",
  "answer": "마이페이지 > 포인트 내역에서 확인 가능합니다.",
  "category": "포인트"
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": {
    "id": 4,
    "question": "포인트가 사라졌어요.",
    "answer": "마이페이지 > 포인트 내역에서 확인 가능합니다.",
    "category": "포인트",
    "createdAt": "2025-03-25T10:00:00Z",
    "updatedAt": "2025-03-25T10:00:00Z"
  }
}
```

---

## 9. FAQ 수정

```
PUT /v1/inquiries/faqs/:id
```

### 프론트 → 백엔드 (Request Body)

| 필드       | 타입   | 필수 | 설명            |
| ---------- | ------ | ---- | --------------- |
| `question` | string | ✅   | 수정할 질문     |
| `answer`   | string | ✅   | 수정할 답변     |
| `category` | string | ✅   | 수정할 카테고리 |

```json
{
  "question": "포인트 내역은 어디서 볼 수 있나요?",
  "answer": "마이페이지 > 포인트 내역 메뉴에서 확인하세요.",
  "category": "포인트"
}
```

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": {
    "id": 4,
    "question": "포인트 내역은 어디서 볼 수 있나요?",
    "answer": "마이페이지 > 포인트 내역 메뉴에서 확인하세요.",
    "category": "포인트",
    "createdAt": "2025-03-25T10:00:00Z",
    "updatedAt": "2025-03-25T11:30:00Z"
  }
}
```

---

## 10. FAQ 삭제

```
DELETE /v1/inquiries/faqs/:id
```

### 프론트 → 백엔드

URL 경로에 `id` 포함 (number). Body 없음.

### 백엔드 → 프론트 (Response)

```json
{
  "isSuccess": true,
  "result": null
}
```

---

## 프론트엔드 교체 위치 요약

| 파일                                                | 함수                     | 연결 API                           |
| --------------------------------------------------- | ------------------------ | ---------------------------------- |
| `hooks/useInquiryList.ts`                           | `fetchInquiryList`       | `GET /v1/inquiries`                |
| `hooks/useInquiryDetail.ts`                         | `fetchInquiryDetail`     | `GET /v1/inquiries/:id`            |
| `hooks/useFaqList.ts`                               | `fetchFaqList`           | `GET /v1/inquiries/faqs`           |
| `pages/inquiry/InquiryPage.tsx`                     | `handleBulkStatusChange` | `PATCH /v1/inquiries/status`       |
| `pages/inquiry/InquiryPage.tsx`                     | `handleBulkAssignee`     | `PATCH /v1/inquiries/assignee`     |
| `domains/Inquiry/components/InquiryDetailPanel.tsx` | `handleReplySave`        | `POST /v1/inquiries/:id/reply`     |
| `domains/Inquiry/components/InquiryDetailPanel.tsx` | `handleCategorySave`     | `PATCH /v1/inquiries/:id/category` |
| `pages/inquiry/InquiryFaqPage.tsx`                  | `handleCreate`           | `POST /v1/inquiries/faqs`          |
| `pages/inquiry/InquiryFaqPage.tsx`                  | `handleEdit`             | `PUT /v1/inquiries/faqs/:id`       |
| `pages/inquiry/InquiryFaqPage.tsx`                  | `handleDeleteConfirm`    | `DELETE /v1/inquiries/faqs/:id`    |
