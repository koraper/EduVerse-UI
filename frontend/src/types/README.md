# Types

TypeScript 타입 정의를 관리하는 디렉토리입니다.

## 네이밍 규칙

- 타입 파일: camelCase.ts (예: `user.ts`, `class.ts`)
- 인터페이스/타입: PascalCase (예: `User`, `ClassInfo`)

## 예시

```typescript
// types/user.ts
export type UserRole = 'student' | 'professor' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  role: UserRole
}

// types/class.ts
export interface ClassInfo {
  id: number
  professorId: number
  curriculumId: number
  name: string
  description: string
  year: number
  semester: '1학기' | '2학기' | '여름학기' | '겨울학기'
  invitationCode: string
  qrCodeUrl: string
  createdAt: string
}

export interface WeeklySession {
  id: number
  classId: number
  weekNumber: number
  status: 'not_started' | 'in_progress' | 'ended'
  startedAt: string | null
  endedAt: string | null
  autoEndAt: string | null
}
```
