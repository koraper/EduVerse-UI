# Mock Database

MSW 개발 환경에서 사용하는 인메모리 데이터베이스입니다.

## 🎯 데이터 관리 전략

MSW 환경에서는 실제 데이터베이스가 없으므로, 3가지 방식으로 데이터를 관리합니다:

### 1. 브라우저 메모리 (In-Memory) ⭐ 추천
- **장점**: 빠르고 간단, 별도 설정 불필요
- **단점**: 새로고침 시 데이터 초기화
- **용도**: 개발 초기, 간단한 테스트

```typescript
// mocks/db/memory.ts
let users = [...]
let classes = [...]

// 데이터 조회
export const getUsers = () => users

// 데이터 추가
export const addUser = (user) => {
  users.push(user)
  return user
}
```

### 2. localStorage/sessionStorage
- **장점**: 새로고침 후에도 데이터 유지
- **단점**: 용량 제한 (5-10MB), 문자열만 저장 가능
- **용도**: 로그인 세션, 사용자 설정

```typescript
// 데이터 저장
localStorage.setItem('users', JSON.stringify(users))

// 데이터 로드
const users = JSON.parse(localStorage.getItem('users') || '[]')
```

### 3. IndexedDB ⭐ 프로덕션급 개발
- **장점**: 대용량 데이터, 복잡한 쿼리, 영구 저장
- **단점**: API가 복잡, 설정 필요
- **용도**: 실제 DB와 유사한 환경 필요 시

```typescript
// Dexie.js 사용 (IndexedDB 래퍼)
import Dexie from 'dexie'

const db = new Dexie('EduVerseDB')
db.version(1).stores({
  users: '++id, email, name, role',
  classes: '++id, professorId, name',
})
```

## 📁 디렉토리 구조

```
mocks/
├── db/
│   ├── memory.ts         # 인메모리 데이터
│   ├── schema.ts         # 데이터 스키마 정의
│   ├── seed.ts           # 초기 데이터 시드
│   └── utils.ts          # 데이터 유틸리티 함수
├── handlers/
│   ├── auth.ts           # 인증 핸들러 (db 사용)
│   └── ...
```

## 🚀 추천 구조 (In-Memory)

### 1. 데이터 스키마 정의

```typescript
// mocks/db/schema.ts
export interface User {
  id: number
  email: string
  name: string
  password: string  // 개발용 평문 저장
  role: 'student' | 'professor' | 'admin'
  emailVerified: boolean
  createdAt: string
}

export interface Class {
  id: number
  professorId: number
  curriculumId: number
  name: string
  description: string
  year: number
  semester: string
  invitationCode: string
  createdAt: string
}

export interface Enrollment {
  id: number
  studentId: number
  classId: number
  enrolledAt: string
  isActive: boolean
}
```

### 2. 초기 데이터 시드

```typescript
// mocks/db/seed.ts
import { User, Class } from './schema'

export const seedUsers: User[] = [
  {
    id: 1,
    email: 'student@eduverse.com',
    name: '김학생',
    password: 'password123',
    role: 'student',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'professor@eduverse.com',
    name: '이교수',
    password: 'password123',
    role: 'professor',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
]

export const seedClasses: Class[] = [
  {
    id: 1,
    professorId: 2,
    curriculumId: 1,
    name: 'C 프로그래밍 기초 2025 1학기',
    description: 'C언어 기본 문법과 포인터',
    year: 2025,
    semester: '1학기',
    invitationCode: 'ABC123',
    createdAt: '2025-01-15T00:00:00Z',
  },
]
```

### 3. 인메모리 데이터베이스

```typescript
// mocks/db/memory.ts
import { seedUsers, seedClasses } from './seed'
import { User, Class, Enrollment } from './schema'

// 데이터 저장소
let users: User[] = [...seedUsers]
let classes: Class[] = [...seedClasses]
let enrollments: Enrollment[] = []

// CRUD 함수
export const db = {
  users: {
    findAll: () => users,
    findById: (id: number) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (user: Omit<User, 'id'>) => {
      const newUser = { ...user, id: users.length + 1 }
      users.push(newUser)
      return newUser
    },
    update: (id: number, data: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...data }
        return users[index]
      }
      return null
    },
    delete: (id: number) => {
      users = users.filter((u) => u.id !== id)
    },
  },
  classes: {
    findAll: () => classes,
    findById: (id: number) => classes.find((c) => c.id === id),
    findByProfessorId: (professorId: number) =>
      classes.filter((c) => c.professorId === professorId),
    create: (cls: Omit<Class, 'id'>) => {
      const newClass = { ...cls, id: classes.length + 1 }
      classes.push(newClass)
      return newClass
    },
    update: (id: number, data: Partial<Class>) => {
      const index = classes.findIndex((c) => c.id === id)
      if (index !== -1) {
        classes[index] = { ...classes[index], ...data }
        return classes[index]
      }
      return null
    },
    delete: (id: number) => {
      classes = classes.filter((c) => c.id !== id)
    },
  },
  enrollments: {
    findAll: () => enrollments,
    findByStudentId: (studentId: number) =>
      enrollments.filter((e) => e.studentId === studentId),
    findByClassId: (classId: number) =>
      enrollments.filter((e) => e.classId === classId),
    create: (enrollment: Omit<Enrollment, 'id'>) => {
      const newEnrollment = { ...enrollment, id: enrollments.length + 1 }
      enrollments.push(newEnrollment)
      return newEnrollment
    },
  },
  // 데이터 초기화 (개발 중 유용)
  reset: () => {
    users = [...seedUsers]
    classes = [...seedClasses]
    enrollments = []
  },
}
```

### 4. 핸들러에서 사용

```typescript
// mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()

    // 인메모리 DB에서 사용자 찾기
    const user = db.users.findByEmail(email)

    if (!user || user.password !== password) {
      return HttpResponse.json(
        { status: 'error', message: '로그인 실패' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      status: 'success',
      data: { user },
    })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json()

    // 이메일 중복 체크
    const existing = db.users.findByEmail(body.email)
    if (existing) {
      return HttpResponse.json(
        { status: 'error', message: '이미 존재하는 이메일' },
        { status: 409 }
      )
    }

    // 새 사용자 생성
    const newUser = db.users.create({
      ...body,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      status: 'success',
      data: { user: newUser },
    })
  }),
]
```

## 🔄 데이터 초기화

개발 중 데이터를 초기화하고 싶을 때:

```typescript
// 브라우저 콘솔에서
window.__resetMockDB = () => {
  const { db } = require('./mocks/db/memory')
  db.reset()
  location.reload()
}

// 사용: 콘솔에서
__resetMockDB()
```

## 📊 데이터 영속성 (localStorage 사용)

새로고침 후에도 데이터를 유지하려면:

```typescript
// mocks/db/memory.ts
const STORAGE_KEY = 'eduverse-mock-db'

// 로드
const loadFromStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

// 저장
const saveToStorage = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 초기화 시 localStorage에서 로드
let users = loadFromStorage()?.users || [...seedUsers]
let classes = loadFromStorage()?.classes || [...seedClasses]

// 데이터 변경 시 자동 저장
const syncStorage = () => {
  saveToStorage({ users, classes, enrollments })
}

export const db = {
  users: {
    create: (user) => {
      // ... 생성 로직
      syncStorage()  // 저장
      return newUser
    },
    // ... 다른 메서드도 syncStorage() 호출
  },
}
```

## 🎯 추천 방식

**Phase 1 (현재)**: In-Memory
- 빠른 개발
- 간단한 테스트

**Phase 2 (프론트엔드 완성)**: localStorage + In-Memory
- 세션 유지
- 테스트 데이터 보존

**Phase 3 (백엔드 개발)**: 실제 백엔드 API
- MSW 비활성화
- 실제 MariaDB 연결

## 📚 참고 자료

- [MSW Data Modeling](https://mswjs.io/docs/best-practices/data-modeling)
- [Dexie.js (IndexedDB)](https://dexie.org/)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
