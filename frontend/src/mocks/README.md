# Mock Service Worker (MSW)

개발 환경에서 백엔드 API를 목업하는 디렉토리입니다.

## 📁 디렉토리 구조

```
mocks/
├── handlers/           # API 핸들러
│   ├── auth.ts        # 인증 관련 API
│   ├── class.ts       # 수업 관련 API (예정)
│   ├── student.ts     # 학생 관련 API (예정)
│   └── index.ts       # 핸들러 통합
└── browser.ts         # Service Worker 설정
```

## 🚀 사용 방법

### 1. 자동 시작

개발 서버를 실행하면 MSW가 자동으로 시작됩니다:

```bash
npm run dev
```

브라우저 콘솔에 `[MSW] Mocking enabled.` 메시지가 표시되면 정상 작동 중입니다.

### 2. 새로운 API 핸들러 추가

```typescript
// mocks/handlers/class.ts
import { http, HttpResponse } from 'msw'

export const classHandlers = [
  // GET /api/classes
  http.get('/api/classes', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        classes: [
          { id: 1, name: 'C 프로그래밍 기초 2025 1학기' },
          { id: 2, name: 'Java 프로그래밍 기초 2025 1학기' },
        ],
      },
    })
  }),

  // POST /api/classes
  http.post('/api/classes', async ({ request }) => {
    const body = await request.json()
    console.log('[MSW] 수업 생성 요청:', body)

    return HttpResponse.json({
      status: 'success',
      message: '수업이 생성되었습니다.',
      data: {
        class: {
          id: 3,
          ...body,
        },
      },
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

### 3. 응답 지연 시뮬레이션

네트워크 지연을 시뮬레이션하려면 `delay()` 사용:

```typescript
import { http, HttpResponse, delay } from 'msw'

http.get('/api/classes', async () => {
  await delay(1000) // 1초 지연
  return HttpResponse.json({ data: [] })
})
```

### 4. 에러 응답 시뮬레이션

```typescript
http.post('/api/auth/login', () => {
  return HttpResponse.json(
    {
      status: 'error',
      message: '이메일 또는 비밀번호가 일치하지 않습니다.',
    },
    { status: 401 }
  )
})
```

## 📝 개발 시 유의사항

### 현재 구현된 API

**인증 (auth.ts)**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/send-verification` - 이메일 인증번호 발송
- `POST /api/auth/verify-email` - 이메일 인증번호 확인
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 테스트 계정

**학생**
- Email: `student@eduverse.com`
- Password: `password123`

**교수자**
- Email: `professor@eduverse.com`
- Password: `password123`

**관리자**
- Email: `admin@eduverse.com`
- Password: `password123`

### 이메일 인증

개발 환경에서는 고정 인증번호 사용:
- 인증번호: `123456`

## 🔧 MSW 설정

### 브라우저 설정 (browser.ts)

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### main.tsx에서 활성화

```typescript
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  // 앱 렌더링
})
```

## 📚 참고 자료

- [MSW 공식 문서](https://mswjs.io/)
- [MSW GitHub](https://github.com/mswjs/msw)
- [MSW 예제](https://mswjs.io/docs/examples/)

## 🎯 다음 작업

구현 예정인 API 핸들러:
- [ ] 수업 관리 API (class.ts)
- [ ] 학생 학습 API (student.ts)
- [ ] 교수자 모니터링 API (professor.ts)
- [ ] Q&A API (qna.ts)
- [ ] 코드 실행 API (code.ts)
