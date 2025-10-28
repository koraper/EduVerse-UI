# 개발 환경 설정 가이드

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 개발 환경 설정 가이드 |
| 버전 | 1.2 |
| 작성일 | 2025-10-18 |
| 최종 수정 | 2025-10-19 |
| 작성자 | Development Team |
| 목적 | EduVerse 프론트엔드 개발 환경 구축 및 MSW 설정 가이드 |

---

## 1. 프로젝트 구조

```
EduVerse/
├── frontend/                      # React 프론트엔드
│   ├── src/
│   │   ├── mocks/                # MSW 목업 API
│   │   │   ├── db/               # 인메모리 데이터베이스
│   │   │   │   ├── schema.ts    # 데이터 스키마
│   │   │   │   ├── seed.ts      # 초기 시드 데이터
│   │   │   │   ├── memory.ts    # 인메모리 DB + localStorage
│   │   │   │   ├── storage.ts   # localStorage 유틸리티
│   │   │   │   └── README.md    # DB 사용 가이드
│   │   │   ├── handlers/         # API 핸들러
│   │   │   │   ├── auth.ts      # 인증 API
│   │   │   │   └── index.ts     # 핸들러 통합
│   │   │   ├── browser.ts        # Service Worker 설정
│   │   │   └── README.md         # MSW 사용 가이드
│   │   ├── components/           # React 컴포넌트
│   │   ├── pages/                # 페이지 컴포넌트
│   │   ├── hooks/                # Custom Hooks
│   │   ├── services/             # API 서비스
│   │   ├── store/                # 상태 관리
│   │   ├── types/                # TypeScript 타입
│   │   ├── utils/                # 유틸리티 함수
│   │   ├── assets/               # 정적 자원
│   │   ├── App.tsx               # 메인 앱
│   │   ├── main.tsx              # 엔트리 포인트 (MSW 초기화)
│   │   └── index.css             # 전역 스타일
│   ├── public/
│   │   └── mockServiceWorker.js  # MSW Service Worker
│   ├── package.json
│   ├── vite.config.ts            # Vite 설정 (프록시, 경로 별칭)
│   ├── tailwind.config.js        # Tailwind CSS 설정
│   └── tsconfig.json             # TypeScript 설정
├── docs/                          # 문서
└── backend/                        # Express.js 백엔드 (Phase 2+)
```

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.1.1 | UI 프레임워크 |
| TypeScript | 5+ | 타입 안전성 |
| Vite | 7.1.10 | 빌드 도구 |
| Tailwind CSS | 3.4.x | 스타일링 |
| React Router DOM | 7.9.4 | 라우팅 |
| Monaco Editor | 4.7.0 | 코드 에디터 |
| Chart.js | 4.5.1 | 차트 |
| Lucide React | 0.546.0 | 아이콘 |
| Axios | 1.12.2 | HTTP 클라이언트 |

### 2.2 개발 환경

| 기술 | 버전 | 용도 |
|------|------|------|
| MSW | 2+ | 목업 API 서버 |
| localStorage | - | 데이터 영속성 |

### 2.3 백엔드 (프로덕션)

| 기술 | 버전 | 용도 |
|------|------|------|
| Express.js | 4+ | 프레임워크 |
| Node.js | 20+ | 런타임 |
| Prisma | 최신 | ORM |
| MariaDB | - | 데이터베이스 |
| Redis | 7+ | 캐시 (세션 관리, 실시간 모니터링, Rate Limiting) |

---

## 3. 개발 환경 설정

### 3.1 의존성 설치

```bash
cd frontend
npm install
```

**설치된 주요 패키지:**
- React 19+ 및 React DOM
- TypeScript 5+
- Vite
- Tailwind CSS 3.x
- MSW 2+
- Monaco Editor, Chart.js, Lucide React, Axios

### 3.2 개발 서버 실행

```bash
npm run dev
```

- 개발 서버: http://localhost:3000 (포트 사용 중이면 자동으로 3001, 3002 등 사용)
- Hot Module Replacement (HMR) 지원
- MSW 자동 활성화

### 3.3 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

---

## 4. MSW (Mock Service Worker) 설정

### 4.1 개요

MSW는 Service Worker를 사용하여 네트워크 요청을 가로채고 목업 응답을 반환하는 라이브러리입니다.

**장점:**
- 실제 백엔드 없이 프론트엔드 개발 가능
- 브라우저 네트워크 탭에서 실제 요청처럼 보임
- 개발/테스트 환경에서만 활성화

### 4.2 초기화 설정

**main.tsx에서 자동 초기화:**

```typescript
// main.tsx
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

### 4.3 API 핸들러 구조

**현재 구현된 API:**

**인증 (auth.ts)**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/send-verification` - 이메일 인증번호 발송
- `POST /api/auth/verify-email` - 이메일 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 4.4 새로운 핸들러 추가

```typescript
// mocks/handlers/class.ts
import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const classHandlers = [
  http.get('/api/classes', () => {
    const classes = db.classes.findAll()
    return HttpResponse.json({
      status: 'success',
      data: { classes },
    })
  }),

  http.post('/api/classes', async ({ request }) => {
    const body = await request.json()
    const newClass = db.classes.create(body)
    return HttpResponse.json({
      status: 'success',
      data: { class: newClass },
    })
  }),
]
```

```typescript
// mocks/handlers/index.ts
import { authHandlers } from './auth'
import { classHandlers } from './class'

export const handlers = [
  ...authHandlers,
  ...classHandlers,
]
```

---

## 5. 데이터 관리 (인메모리 DB + localStorage)

### 5.1 개요

**하이브리드 방식:**
- **인메모리**: 빠른 CRUD 작업
- **localStorage**: 새로고침 후 데이터 유지

### 5.2 데이터 스키마

```typescript
// mocks/db/schema.ts
interface User {
  id: number
  email: string
  name: string
  student_number?: string // 학번 (선택)
  password: string
  role: 'student' | 'professor' | 'admin'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface Class {
  id: number
  professorId: number
  curriculumId: number
  name: string
  // ... 기타 필드
}

// 8개 엔티티 정의됨
```

### 5.3 시드 데이터

```typescript
// mocks/db/seed.ts
export const seedUsers: User[] = [
  {
    id: 1,
    email: 'student@eduverse.com',
    name: '김학생',
    student_number: '20250001',
    password: 'password123',
    role: 'student',
    emailVerified: true,
    // ...
  },
  // 총 4명 (학생 2, 교수 1, 관리자 1)
]

export const seedClasses: Class[] = [
  // 2개의 수업
]

// 4개 커리큘럼, 12주차 세션, 2개 수업 참여
```

### 5.4 CRUD 작업

```typescript
// 조회
const user = db.users.findByEmail('student@eduverse.com')
const classes = db.classes.findAll()

// 생성
const newUser = db.users.create({
  email: 'new@eduverse.com',
  name: '새 사용자',
  student_number: '20259999',
  password: 'password123',
  role: 'student',
  emailVerified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
// → 자동으로 localStorage에 저장됨!

// 수정
db.users.update(1, { name: '변경된 이름' })

// 삭제
db.users.delete(1)
```

### 5.5 localStorage 관리

```typescript
// 데이터 상태 확인
__mockDB.debug()
// 출력:
// [Mock DB] 현재 데이터 상태:
// - Users: 4
// [localStorage] 저장 정보:
// - 저장 여부: O
// - 용량: 12.5 KB

// 데이터 초기화
__mockDB.reset()

// localStorage만 초기화
__mockDB.storage.clear()

// localStorage 정보
__mockDB.storage.info()
```

---

## 6. 테스트 계정 및 데이터

### 6.1 테스트 계정

| 역할 | 이메일 | 비밀번호 | 설명 |
|------|--------|----------|------|
| 학생 | `student@eduverse.com` | `password123` | 김학생 |
| 학생 | `student2@eduverse.com` | `password123` | 이학생 (학번 없음) |
| 학생 | `student2@eduverse.com` | `password123` | 이학생 |
| 교수 | `professor@eduverse.com` | `password123` | 박교수 |
| 관리자 | `admin@eduverse.com` | `password123` | 관리자 |

**참고:** 테스트 계정 정보는 실제 운영 계정으로 관리됩니다. 개발 환경에서 빠른 로그인을 위해 사전 등록됩니다.

### 6.2 테스트 수업

**수업 1:**
- 이름: C 프로그래밍 기초 2025 1학기
- 입장 코드: `ABC123`
- 교수: 박교수 (ID: 3)
- 참여 학생: 김학생, 이학생
- 주차: 12주차 (모두 "시작 전" 상태)

**수업 2:**
- 이름: Java 프로그래밍 기초 2025 1학기
- 입장 코드: `DEF456`
- 교수: 박교수
- 주차: 12주차

### 6.3 이메일 인증

개발 환경에서는 고정 인증번호 사용:
- 인증번호: `123456`
- 어떤 이메일이든 123456 입력 시 인증 성공

---

## 7. 개발 워크플로우

### 7.1 일반적인 개발 흐름

```
1. 기능 스펙 확인
   ↓
2. MSW 핸들러 작성 (필요 시)
   ↓
3. 컴포넌트/페이지 개발
   ↓
4. 브라우저에서 테스트
   ↓
5. 데이터 확인 (__mockDB.debug())
   ↓
6. 문제 발생 시 __mockDB.reset()
```

### 7.2 디버깅 팁

**1. MSW 활성화 확인**
```javascript
// 브라우저 콘솔에 "[MSW] Mocking enabled." 메시지 확인
```

**2. 데이터 상태 확인**
```javascript
__mockDB.debug()
```

**3. 특정 데이터 조회**
```javascript
__mockDB.users.findAll()
__mockDB.classes.findByProfessorId(3)
```

**4. localStorage 확인**
```javascript
// 개발자 도구 → Application → Local Storage
// Key: eduverse-mock-db
```

**5. 데이터 초기화**
```javascript
__mockDB.reset()
location.reload()
```

---

## 8. TypeScript 설정

### 8.1 경로 별칭

```typescript
// tsconfig.json 및 vite.config.ts에 설정됨
import { Button } from '@components/common/Button'
import { LoginPage } from '@pages/auth/LoginPage'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth/authService'
import { User } from '@types/user'
```

### 8.2 사용 가능한 별칭

- `@/*` - src/
- `@components/*` - src/components/
- `@pages/*` - src/pages/
- `@hooks/*` - src/hooks/
- `@services/*` - src/services/
- `@utils/*` - src/utils/
- `@types/*` - src/types/
- `@store/*` - src/store/
- `@assets/*` - src/assets/

---

## 9. Vite 설정

### 9.1 개발 서버

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

**참고:** 현재는 MSW를 사용하므로 프록시가 필요 없지만, Phase 2 (실제 백엔드)에서 활성화됩니다.

---

## 10. 다음 단계

### 10.1 현재 개발 진행도

✅ **완료**

- 랜딩페이지 기본 구현 (LP-01 ~ LP-07)
- 디자인 시스템 통합 (다크 테마)
- 공통 컴포넌트 개발 (Button, Input 등)
- Footer 회사 정보 섹션 추가
- ContactSection 연락처 필드 추가
- 개발 환경 테스트 계정 빠른 로그인 기능

🔄 **진행 중**

1. **인증 페이지** (ST-AUTH-01 ~ ST-AUTH-02, PR-AUTH-01 ~ PR-AUTH-02)
   - 로그인, 회원가입 페이지
   - 이메일 인증 플로우
   - MSW 인증 API 활용

2. **학생 대시보드** (ST-CLASS-01 ~ ST-PROG-04)
   - 수업 목록, 초대 코드 입력
   - 학습 진도 관리

3. **교수자 대시보드** (PR-CLASS-01 ~ PR-CLASS-34)
   - 수업 생성, 주차별 수업 관리
   - 실시간 모니터링

### 10.2 추가 MSW 핸들러 필요

- [ ] 수업 관리 API (`handlers/class.ts`)
- [ ] 학생 학습 API (`handlers/student.ts`)
- [ ] 교수자 모니터링 API (`handlers/professor.ts`)
- [ ] Q&A API (`handlers/qna.ts`)
- [ ] 코드 실행 API (`handlers/code.ts`)

---

## 11. 문서 참고

- [개발자 가이드](./00-developer-guide.md) - 프로젝트 전체 개요
- [시스템 아키텍처](../02-architecture/01-system-architecture.md) - 백엔드 기술 스택 변경 (v1.4)
- [MSW 사용 가이드](../../frontend/src/mocks/README.md) - MSW 상세 가이드
- [Mock DB 가이드](../../frontend/src/mocks/db/README.md) - 데이터베이스 관리

---

## 12. 문제 해결

### 12.1 MSW가 작동하지 않음

**증상:** API 요청이 404 에러
**해결:**
1. 브라우저 콘솔에 "[MSW] Mocking enabled." 확인
2. `public/mockServiceWorker.js` 파일 존재 확인
3. 서버 재시작

### 12.2 localStorage 데이터가 저장 안 됨

**증상:** 새로고침 시 데이터 초기화
**해결:**
```javascript
__mockDB.storage.enabled  // true인지 확인
__mockDB.storage.info()   // 저장 여부 확인
```

### 12.3 Tailwind CSS 클래스가 적용 안 됨

**증상:** 스타일이 안 보임
**해결:**
1. `tailwind.config.js`의 `content` 경로 확인
2. 서버 재시작
3. 브라우저 캐시 삭제

---

## 13. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1 | 2025-10-18 | 랜딩페이지 구현 반영 (테스트 계정 정보 검증, 개발 진행도 업데이트) | Claude AI |
| 1.0 | 2025-10-18 | 초기 문서 작성 (React 프로젝트 초기화, MSW 설정, localStorage 통합) | Development Team |

---

**문서 작성 완료일**: 2025-10-18
**최종 수정일**: 2025-10-18
**현재 개발 서버**: http://localhost:3002 (또는 3000, 3001)
**상태**: 개발 환경 설정 완료 ✅
**개발 진행도**: 랜딩페이지 완료, 인증/대시보드 개발 중
