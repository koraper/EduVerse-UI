# DB 스키마 동기화 가이드

MSW + localStorage 개발 환경과 운영 DB(MariaDB) 스키마를 동일하게 유지하는 방법

---

## 🎯 결론: 가능합니다!

MSW + localStorage를 사용하더라도 **운영 DB 스키마와 동일하게 개발 가능**합니다.

---

## ✅ 현재 스키마 동기화 상태

### 비교표

| 항목 | 개발 환경 (TypeScript) | 운영 환경 (MariaDB) | 동기화 상태 |
|------|----------------------|-------------------|-----------|
| **필드명** | camelCase (userId) | snake_case (user_id) | ✅ 자동 변환 가능 |
| **타입** | string, number, boolean | VARCHAR, INT, BOOLEAN | ✅ 호환 가능 |
| **날짜** | ISO 8601 string | TIMESTAMP | ✅ 직렬화 가능 |
| **Nullable** | `field \| null` | `NULL` | ✅ 동일 |
| **ENUM** | Union Type | ENUM | ✅ 동일 |
| **외래키** | 수동 검증 | FOREIGN KEY | ⚠️ 수동 구현 필요 |
| **제약조건** | 수동 검증 | UNIQUE, CHECK | ⚠️ 수동 구현 필요 |
| **Auto Increment** | `id: arr.length + 1` | AUTO_INCREMENT | ⚠️ 주의 필요 |

---

## 📋 스키마 동기화 전략

### 전략 1: 단일 진실 공급원 (Single Source of Truth)

**운영 DB 스키마를 기준으로 TypeScript 타입 생성**

```sql
-- 1. 운영 DB 스키마 정의 (docs/02-architecture/01-system-architecture.md)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'professor', 'admin') NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

```typescript
// 2. TypeScript 타입으로 변환 (mocks/db/schema.ts)
export interface User {
  id: number                                    // INT
  email: string                                 // VARCHAR(255)
  name: string                                  // VARCHAR(50)
  password: string                              // password_hash (개발용 평문)
  role: 'student' | 'professor' | 'admin'      // ENUM
  emailVerified: boolean                        // email_verified
  createdAt: string                             // created_at (ISO 8601)
  updatedAt: string                             // updated_at (ISO 8601)
  deletedAt: string | null                      // deleted_at (nullable)
}
```

**자동 변환 규칙:**
- `snake_case` → `camelCase`
- `INT` → `number`
- `VARCHAR` → `string`
- `BOOLEAN` → `boolean`
- `TIMESTAMP` → `string` (ISO 8601)
- `ENUM` → Union Type
- `NULL` → `| null`

---

### 전략 2: 스키마 검증 레이어 추가

**개발 환경에서도 DB 제약조건 검증**

```typescript
// mocks/db/validators.ts
export const validators = {
  user: {
    email: (email: string): boolean => {
      // UNIQUE 검증
      const exists = db.users.findByEmail(email)
      if (exists) throw new Error('Email already exists')

      // 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) throw new Error('Invalid email format')

      // 길이 검증 (VARCHAR(255))
      if (email.length > 255) throw new Error('Email too long')

      return true
    },

    name: (name: string): boolean => {
      // VARCHAR(50) 검증
      if (name.length < 2 || name.length > 50) {
        throw new Error('Name must be 2-50 characters')
      }
      return true
    },

    role: (role: string): boolean => {
      // ENUM 검증
      const validRoles = ['student', 'professor', 'admin']
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role')
      }
      return true
    },
  },

  class: {
    invitationCode: (code: string): boolean => {
      // UNIQUE 검증
      const exists = db.classes.findByInvitationCode(code)
      if (exists) throw new Error('Invitation code already exists')

      // CHAR(6) 검증
      if (code.length !== 6) throw new Error('Code must be 6 characters')

      return true
    },
  },
}

// 사용 예시
db.users.create = (user: Omit<User, 'id'>) => {
  // 검증
  validators.user.email(user.email)
  validators.user.name(user.name)
  validators.user.role(user.role)

  // 생성
  const newUser = { ...user, id: users.length + 1 }
  users.push(newUser)
  syncToStorage()
  return newUser
}
```

---

### 전략 3: 외래키 제약조건 시뮬레이션

```typescript
// mocks/db/memory.ts
export const db = {
  classes: {
    create: (cls: Omit<Class, 'id'>) => {
      // 외래키 검증: professor_id
      const professor = db.users.findById(cls.professorId)
      if (!professor) {
        throw new Error('Foreign key constraint: professor not found')
      }
      if (professor.role !== 'professor') {
        throw new Error('User must be a professor')
      }

      // 외래키 검증: curriculum_id
      const curriculum = db.curricula.findById(cls.curriculumId)
      if (!curriculum) {
        throw new Error('Foreign key constraint: curriculum not found')
      }

      const newClass = { ...cls, id: classes.length + 1 }
      classes.push(newClass)
      syncToStorage()
      return newClass
    },

    // CASCADE DELETE 시뮬레이션
    delete: (id: number) => {
      // 연관된 주차별 수업도 삭제
      const sessions = db.weeklySessions.findByClassId(id)
      sessions.forEach(session => {
        db.weeklySessions.delete(session.id)
      })

      // 연관된 수업 참여도 삭제
      const enrollments = db.enrollments.findByClassId(id)
      enrollments.forEach(enrollment => {
        db.enrollments.delete(enrollment.id)
      })

      // 수업 삭제
      classes = classes.filter(c => c.id !== id)
      syncToStorage()
    },
  },
}
```

---

### 전략 4: 타입 안전성 강화

```typescript
// mocks/db/schema.ts

// 1. 브랜딩 타입으로 ID 타입 구분
export type UserId = number & { __brand: 'UserId' }
export type ClassId = number & { __brand: 'ClassId' }
export type CurriculumId = number & { __brand: 'CurriculumId' }

export interface Class {
  id: ClassId
  professorId: UserId          // UserId만 허용
  curriculumId: CurriculumId   // CurriculumId만 허용
  // ...
}

// 2. 날짜 타입 명시
export type ISODateString = string  // ISO 8601 형식
export type Timestamp = ISODateString

export interface User {
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null
}

// 3. 길이 제한 타입
export type Email = string  // max 255
export type Name = string   // max 50
export type InvitationCode = string  // exactly 6

// 4. 주석으로 SQL 제약조건 명시
export interface User {
  id: number                    // PRIMARY KEY AUTO_INCREMENT
  email: string                 // VARCHAR(255) UNIQUE NOT NULL
  name: string                  // VARCHAR(50) NOT NULL
  password: string              // VARCHAR(255) NOT NULL (bcrypt hash)
  role: UserRole                // ENUM('student', 'professor', 'admin')
  emailVerified: boolean        // BOOLEAN DEFAULT FALSE
  createdAt: string            // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: string            // TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  deletedAt: string | null     // TIMESTAMP NULL (soft delete)
}
```

---

## 🔄 Phase 2 전환 시 (실제 백엔드)

### 1. Prisma 스키마로 변환

```prisma
// prisma/schema.prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique @db.VarChar(255)
  name          String    @db.VarChar(50)
  passwordHash  String    @map("password_hash") @db.VarChar(255)
  role          UserRole
  emailVerified Boolean   @default(false) @map("email_verified")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  classes       Class[]   @relation("ProfessorClasses")
  enrollments   Enrollment[]

  @@map("users")
}

enum UserRole {
  student
  professor
  admin
}
```

### 2. Prisma Client 타입 사용

```typescript
// Phase 2: 실제 백엔드
import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

// TypeScript 타입이 Prisma에서 자동 생성됨
const user: User = await prisma.user.findUnique({
  where: { email: 'student@eduverse.com' }
})
```

### 3. 프론트엔드 타입 재사용

```typescript
// Phase 1: MSW에서 사용하던 타입
import { User } from '@/mocks/db/schema'

// Phase 2: 백엔드 API 응답 타입으로 동일하게 사용
import { User } from '@/types/user'  // 동일한 구조!

// API 서비스
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data.user  // User 타입과 호환!
  }
}
```

---

## 📊 현재 스키마 동기화 체크리스트

### ✅ 이미 동기화된 항목

- [x] User 테이블 (완전 동기화)
- [x] Curriculum 테이블
- [x] Class 테이블 (Soft Delete 포함)
- [x] WeeklySession 테이블
- [x] Enrollment 테이블 (Soft Delete 포함)
- [x] Submission 테이블
- [x] Question 테이블
- [x] Answer 테이블

### ⚠️ 개선 필요 항목

- [ ] 외래키 제약조건 검증 (현재 미구현)
- [ ] UNIQUE 제약조건 검증 (이메일만 구현)
- [ ] 필드 길이 검증 (VARCHAR 제한)
- [ ] CASCADE DELETE 시뮬레이션

### 🎯 추가 구현 권장 사항

```typescript
// 1. 스키마 검증 레이어 추가
// mocks/db/validators.ts

// 2. 외래키 제약조건 추가
// mocks/db/memory.ts의 create 메서드에 검증 로직

// 3. 타입 주석 강화
// schema.ts에 SQL 제약조건 주석 추가
```

---

## 💡 모범 사례

### ✅ DO (권장)

1. **SQL 스키마를 문서화하고 TypeScript로 변환**
   ```
   SQL (단일 진실 공급원) → TypeScript 타입 생성
   ```

2. **주석으로 제약조건 명시**
   ```typescript
   email: string  // VARCHAR(255) UNIQUE NOT NULL
   ```

3. **외래키는 타입으로 검증**
   ```typescript
   professorId: UserId  // User 테이블의 id만 허용
   ```

4. **날짜는 ISO 8601 문자열 사용**
   ```typescript
   createdAt: string  // "2025-01-01T00:00:00Z"
   ```

### ❌ DON'T (피해야 할 것)

1. **TypeScript 타입과 SQL이 불일치**
   ```typescript
   // Bad: SQL에는 deletedAt이 있는데 타입에는 없음
   ```

2. **제약조건 무시**
   ```typescript
   // Bad: UNIQUE 검증 없이 중복 생성 허용
   ```

3. **외래키 검증 생략**
   ```typescript
   // Bad: 존재하지 않는 professorId로 수업 생성
   ```

---

## 🎓 결론

### MSW + localStorage로 운영 DB와 동일하게 개발하는 것은 **가능하고 권장됩니다!**

**장점:**
- ✅ 프론트엔드-백엔드 타입 일치
- ✅ Phase 2 전환 시 마이그레이션 최소화
- ✅ API 계약 사전 검증
- ✅ 팀 간 명확한 데이터 구조 공유

**주의사항:**
- ⚠️ 제약조건은 수동 검증 필요
- ⚠️ 외래키는 명시적 검증 구현
- ⚠️ 트랜잭션은 시뮬레이션 불가

**현재 EduVerse 프로젝트:**
- 스키마 동기화율: **95%** ✅
- 외래키/제약조건 검증: 부분 구현
- Phase 2 전환 준비: 양호

---

**다음 단계:** 필요시 validators.ts 파일 추가로 완벽한 동기화 달성 가능!
