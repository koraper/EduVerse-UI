# EduVerse MariaDB 데이터베이스 가이드

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | MariaDB 데이터베이스 가이드 |
| 버전 | 1.0 |
| 작성일 | 2025-10-20 |
| 최종 수정일 | 2025-10-20 |
| 작성자 | Database Team |
| 목적 | EduVerse 프로젝트의 MariaDB 데이터베이스 스키마, 설치, 운영 가이드 종합 정리 |
| 관련 문서 | 시스템 아키텍처 v1.4, PRD v2.8 |

---

## 1. 개요

### 1.1 MariaDB 역할

EduVerse 플랫폼에서 MariaDB는 **프로덕션 환경의 핵심 데이터 저장소**로 사용됩니다.

**주요 저장 데이터:**
- 사용자 정보 (학생, 교수자, 관리자)
- 수업 정보 (커리큘럼, 주차별 세션, 상태)
- 학습 데이터 (진도, 제출 기록, 성적)
- Q&A 데이터 (질문, 답변)
- 관리 로그 (관리자 작업 기록)
- Soft Delete 지원 (수업 탈퇴/삭제 시 데이터 보존)

### 1.2 개발 vs 프로덕션

| 환경 | 데이터 저장소 | 설명 |
|------|--------------|------|
| **개발 (현재)** | MSW + localStorage | 프론트엔드 개발을 위한 목업 환경 |
| **프로덕션 (Phase 2+)** | MariaDB + Redis | 실제 운영 환경 |

**참고:** 현재 개발 단계에서는 MariaDB 없이 MSW(Mock Service Worker)를 사용하여 프론트엔드 개발을 진행합니다. Phase 2부터 MariaDB를 도입합니다.

---

## 2. 기술 스택

### 2.1 버전 정보

| 기술 | 버전 | 용도 |
|------|------|------|
| MariaDB | 10.6+ | 관계형 데이터베이스 |
| Node.js | 20+ | 백엔드 런타임 |
| Prisma ORM | Latest | TypeScript 기반 ORM |
| Redis | 7+ | 세션/캐시 관리 |

### 2.2 Cafe24 호스팅

**프로덕션 환경:**
- Cafe24 클라우드 가상서버
- MariaDB 인스턴스 제공
- Docker 지원
- 백업 및 복구 기능

---

## 3. 데이터베이스 스키마

### 3.1 ERD 개요

```
users (사용자)
  ├── classes (수업) ─── curricula (커리큘럼)
  │   ├── weekly_sessions (주차별 수업)
  │   └── class_enrollments (수업 참여)
  ├── submissions (제출 데이터) ─── tasks (과제)
  ├── work_logs (업무일지)
  ├── questions (질문) ─── answers (답변)
  └── admin_logs (관리 로그)

tasks (과제)
  ├── hints (힌트)
  └── mentor_dialogs (가상 멘토 대화)
```

### 3.2 핵심 엔티티 상세

#### 3.2.1 사용자 (users)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  student_number VARCHAR(20) NULL, -- 학번 (학생 역할만 해당)
  password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2
  role ENUM('student', 'professor', 'admin') NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL, -- Soft Delete
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

**필드 설명:**
- `password_hash`: bcrypt 또는 argon2로 해싱된 비밀번호 (평문 저장 금지 🔴)
- `role`: 사용자 역할 (student, professor, admin)
- `status`: 계정 상태 (활성/비활성/정지)
- `deleted_at`: Soft Delete 시간 (NULL = 활성 사용자)

**보안 정책:**
- 비밀번호: 8-20자, 영문+숫자+특수문자 중 2가지 이상
- 연속 문자 3개 이상 불가
- 로그인 실패 5회 → 15분 계정 잠금

#### 3.2.2 수업 (classes)

```sql
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  professor_id INT NOT NULL,
  curriculum_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year INT NOT NULL,
  semester ENUM('1학기', '2학기', '여름학기', '겨울학기') NOT NULL,
  invitation_code CHAR(6) UNIQUE NOT NULL, -- 영대+숫자 6자리
  qr_code_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL, -- Soft Delete (Hiding)
  FOREIGN KEY (professor_id) REFERENCES users(id),
  FOREIGN KEY (curriculum_id) REFERENCES curricula(id),
  INDEX idx_professor (professor_id),
  INDEX idx_invitation_code (invitation_code),
  INDEX idx_deleted_at (deleted_at)
);
```

**필드 설명:**
- `invitation_code`: 영어 대문자 + 숫자 6자리 (예: ABC123)
- `qr_code_url`: 3D QR 코드 이미지 URL
- `deleted_at`: 교수가 수업 삭제 시 기록 (학생은 "교수가 삭제한 수업" 조회 가능)

**비즈니스 로직:**
- 수업 생성 시 12개 주차(weekly_sessions) 자동 생성 (상태: not_started)
- 입장 코드 자동 생성 (중복 불가)
- QR 코드 자동 생성

#### 3.2.3 주차별 수업 (weekly_sessions)

```sql
CREATE TABLE weekly_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  week_number INT NOT NULL, -- 1~12
  status ENUM('not_started', 'in_progress', 'ended') DEFAULT 'not_started',
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  auto_end_at TIMESTAMP NULL, -- 시작 후 24시간
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  UNIQUE KEY unique_class_week (class_id, week_number),
  INDEX idx_class_status (class_id, status),
  INDEX idx_auto_end (auto_end_at)
);
```

**핵심 정책 ⚠️ 중요:**
1. **동시 진행 제한**: 하나의 수업에서 동시에 2개 이상의 주차별 수업을 진행할 수 없음
   - 구현: 애플리케이션 레벨에서 `status = 'in_progress'` 체크
   - 시작 전: 다른 주차가 `in_progress`면 시작 거부
2. **순차 진행 불필요**: 1주차를 건너뛰고 2주차부터 시작 가능
3. **자동 종료**: 시작 후 24시간 경과 시 자동 종료
   - `auto_end_at = started_at + 24시간`
   - 백그라운드 작업(Cron)으로 자동 종료 처리
4. **최소 수업 시간**: 1초 (시작 후 즉시 종료 가능)

**상태 전이:**
```
not_started → in_progress → ended
     ↓            ↓
   [교수 시작]  [수동 종료 or 24시간 자동 종료]
```

#### 3.2.4 학생-수업 연결 (class_enrollments)

```sql
CREATE TABLE class_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at TIMESTAMP NULL, -- 수업 탈퇴 (Soft Delete)
  is_active BOOLEAN DEFAULT TRUE, -- Hiding 플래그
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  UNIQUE KEY unique_student_class (student_id, class_id),
  INDEX idx_student_active (student_id, is_active),
  INDEX idx_class_active (class_id, is_active)
);
```

**Soft Delete 정책:**
- **탈퇴 (withdrawn_at)**: 학생이 수업 탈퇴 시 시간 기록
- **Hiding (is_active: FALSE)**: 학생의 수업 목록에서 숨김
- **재참여**: 동일 입장 코드 입력 시 `withdrawn_at = NULL`, `is_active = TRUE`
- **학습 데이터 보존**: submissions, progress 등 모두 유지

**재참여 플로우:**
```
[탈퇴]
withdrawn_at: 현재 시간
is_active: FALSE
학습 데이터: 유지 (submissions, work_logs 등)
학생 화면: 수업 목록에서 완전히 숨김

[재참여]
withdrawn_at: NULL
is_active: TRUE
학습 데이터: 기존 데이터 연결
학생/교수 대시보드: 이전 제출 기록 조회 가능
```

#### 3.2.5 제출 데이터 (submissions)

```sql
CREATE TABLE submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  task_id INT NOT NULL,
  week_number INT NOT NULL,
  submission_number INT NOT NULL, -- 1, 2, 3... (재도전 횟수)
  is_first_submission BOOLEAN DEFAULT FALSE, -- 첫 번째 제출 플래그
  code TEXT NOT NULL,
  score INT,
  test_passed BOOLEAN,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  INDEX idx_student_task (student_id, task_id),
  INDEX idx_first_submission (student_id, task_id, is_first_submission)
);
```

**제출 데이터 정책 ⚠️ 중요:**
- **첫 번째 제출만 평가 반영**: `is_first_submission = TRUE`인 데이터만 성적 반영
- **재도전 허용**: 자유롭게 가능하지만 `submission_number`만 증가
- **수정 불가**: 첫 번째 제출 후 코드/점수 변경 불가
- **적용 대상**: 퀴즈/테스트, 설문, 코드 제출, 업무일지
- **UI 안내**: "재도전은 가능하지만 평가에는 첫 번째 결과 사용"

**제출 흐름:**
```
1차 제출: submission_number=1, is_first_submission=TRUE  → 평가 반영
2차 제출: submission_number=2, is_first_submission=FALSE → 연습용
3차 제출: submission_number=3, is_first_submission=FALSE → 연습용
```

#### 3.2.6 업무일지 (work_logs)

```sql
CREATE TABLE work_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  week_number INT NOT NULL,
  content TEXT NOT NULL, -- 업무일지 내용 (Markdown 지원)
  self_evaluation INT, -- 자기평가 점수 (1-5)
  completed_tasks TEXT, -- 완료한 작업 목록 (JSON)
  difficulties TEXT, -- 어려웠던 점
  improvements TEXT, -- 개선 계획
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  UNIQUE KEY unique_student_week_log (student_id, class_id, week_number),
  INDEX idx_class_week (class_id, week_number)
);
```

**업무일지 정책:**
- 주차별로 1개의 업무일지 작성 (week_number 단위)
- 작성 후 수정 가능 (submitted_at: 최초 작성, updated_at: 최종 수정)
- 교수자는 모든 학생의 업무일지 조회 가능
- Markdown 지원

#### 3.2.7 힌트 (hints)

```sql
CREATE TABLE hints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL, -- 힌트 제목
  content TEXT NOT NULL, -- 힌트 내용 (Markdown)
  video_url VARCHAR(255), -- 교수 요약 강의 영상 URL
  order_index INT DEFAULT 0, -- 힌트 표시 순서
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  INDEX idx_task_order (task_id, order_index)
);
```

**힌트 기능 정책:**
- 각 과제별로 여러 개의 힌트 제공 가능
- 텍스트(Markdown) + 선택적 영상 강의
- 학생은 언제든지 힌트 조회 가능 (제출 횟수 영향 없음)
- MVP: 관리자가 커리큘럼 등록 시 힌트 사전 입력

#### 3.2.8 가상 멘토 대화 (mentor_dialogs)

```sql
CREATE TABLE mentor_dialogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  mentor_type ENUM('alex', 'sena', 'kim_professor') NOT NULL,
  dialog_order INT NOT NULL, -- 대화 표시 순서
  content TEXT NOT NULL, -- 대화 내용 (Markdown)
  dialog_type ENUM('greeting', 'guidance', 'encouragement', 'hint') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  INDEX idx_task_mentor (task_id, mentor_type, dialog_order)
);
```

**가상 멘토 시스템:**
- **Alex (친근한 팀장)**: 학습 동기 부여, 전반적 가이드
- **Sena (도움 주는 선임)**: 구체적 기술 조언, 힌트
- **김교수 (전문가)**: 이론 설명, 심화 학습
- 정적 콘텐츠 (AI 대화 아님)
- Phase 2: AI 기반 실시간 대화 검토 가능

#### 3.2.9 관리 로그 (admin_logs)

```sql
CREATE TABLE admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action_type ENUM('create', 'update', 'delete', 'status_change', 'login', 'logout') NOT NULL,
  target_type ENUM('user', 'class', 'setting', 'system') NOT NULL,
  target_id INT NULL, -- 대상 엔티티 ID
  description TEXT NOT NULL, -- 작업 설명
  ip_address VARCHAR(45), -- IPv4/IPv6
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_admin_created (admin_id, created_at),
  INDEX idx_action_type (action_type, created_at),
  INDEX idx_target (target_type, target_id)
);
```

**관리 로그 정책:**
- 모든 관리자 작업(CRUD) 자동 기록
- 읽기 전용 (수정/삭제 불가)
- 최소 1년 이상 보관
- IP 주소 및 User Agent 기록

---

## 4. 데이터 흐름

### 4.1 수업 생성 흐름

```
교수자: 커리큘럼 선택 (4개 중 1개)
     → 수업 정보 입력 (이름, 연도, 학기)
     → [DB] classes 테이블 INSERT
     → [시스템] 입장 코드 자동 생성 (6자리, 중복 체크)
     → [시스템] QR 코드 자동 생성
     → [DB] 12개 weekly_sessions INSERT (status: not_started)
     → 수업 생성 완료
```

### 4.2 주차별 수업 시작/종료 흐름

```
[시작]
교수자: 특정 주차 선택 (예: 2주차)
     → "주차별 수업 시작" 버튼 클릭
     → [애플리케이션] 동시 진행 제한 확인
        SELECT COUNT(*) FROM weekly_sessions
        WHERE class_id = ? AND status = 'in_progress'
        - 결과 > 0 → 시작 거부 ("N주차 진행 중입니다")
        - 결과 = 0 → 시작 허용
     → [DB] UPDATE weekly_sessions SET
        status = 'in_progress',
        started_at = NOW(),
        auto_end_at = NOW() + INTERVAL 24 HOUR
     → 학생 입장 허용

[종료 - 수동]
교수자: "주차별 수업 종료" 버튼 클릭
     → [DB] UPDATE weekly_sessions SET
        status = 'ended',
        ended_at = NOW()

[종료 - 자동]
백그라운드 Cron (매 1분 실행):
     → [DB] UPDATE weekly_sessions SET
        status = 'ended',
        ended_at = NOW()
        WHERE status = 'in_progress'
        AND auto_end_at <= NOW()
```

### 4.3 학생 학습 데이터 흐름

```
학생: 코드 작성 (Monaco Editor)
   → 코드 실행 (Pyodide/Piston)
   → 결과 확인
   → 테스트 실행
   → 제출

[1차 제출]
   → [DB] INSERT INTO submissions
        (student_id, task_id, submission_number=1,
         is_first_submission=TRUE, code, score)
   → 평가 반영

[재도전]
   → [DB] INSERT INTO submissions
        (student_id, task_id, submission_number=2,
         is_first_submission=FALSE, code, score)
   → 연습용 (평가 미반영)

[교수자 대시보드]
   → SELECT * FROM submissions
     WHERE is_first_submission = TRUE
   → 첫 번째 제출만 조회/평가
```

### 4.4 수업 탈퇴/재참여 흐름

```
[탈퇴]
학생: "수업 탈퇴" 버튼 클릭
   → 비밀번호 입력/검증
   → [DB] UPDATE class_enrollments SET
        withdrawn_at = NOW(),
        is_active = FALSE
   → [학습 데이터 보존]
        submissions, work_logs, questions 등 유지
   → 학생 화면: 수업 목록에서 완전히 숨김

[재참여]
학생: 동일 입장 코드 입력
   → [DB] SELECT FROM class_enrollments
        WHERE student_id = ? AND class_id = ?
   → 이전 탈퇴 기록 확인 (withdrawn_at IS NOT NULL)
   → 재참여 확인 메시지
   → [DB] UPDATE class_enrollments SET
        withdrawn_at = NULL,
        is_active = TRUE
   → [학습 데이터 연결]
        이전 submissions, work_logs 자동 조회 가능
```

---

## 5. 인덱스 전략

### 5.1 성능 최적화 인덱스

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| users | `idx_email` | 로그인, 중복 체크 |
| users | `idx_role` | 역할별 사용자 조회 |
| classes | `idx_professor` | 교수별 수업 조회 |
| classes | `idx_invitation_code` | 입장 코드 검증 |
| weekly_sessions | `idx_class_status` | 진행 중인 주차 확인 |
| class_enrollments | `idx_student_active` | 학생 수업 목록 |
| submissions | `idx_student_task` | 학생별 제출 기록 |
| submissions | `idx_first_submission` | 첫 번째 제출 조회 |
| admin_logs | `idx_admin_created` | 관리자별 로그 조회 |

### 5.2 파티셔닝 (Phase 3)

**제출 데이터 파티셔닝:**
```sql
ALTER TABLE submissions
PARTITION BY RANGE (YEAR(submitted_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**목적:** 학기별로 데이터를 분리하여 조회 성능 향상

---

## 6. 보안 및 데이터 보호

### 6.1 비밀번호 해싱

**🔴 긴급 조치 필요:**
- **현재 상태**: 평문 저장 (보안 취약)
- **개선 필요**: bcrypt 또는 argon2 해싱

**마이그레이션 스크립트:**
```typescript
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migratePasswords() {
  const users = await prisma.user.findMany({
    where: {
      passwordHash: null // 평문 비밀번호 사용자
    }
  })

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    })
  }

  console.log(`${users.length}개 계정 비밀번호 해싱 완료`)
}

migratePasswords()
```

### 6.2 개인정보 보호

| 데이터 | 보호 방법 |
|--------|----------|
| 비밀번호 | bcrypt/argon2 해싱 (평문 저장 금지) |
| 이메일 | 암호화 저장 권장 |
| 로그 | 개인정보 마스킹 (이메일 일부 *처리) |
| IP 주소 | 관리 로그에만 기록, 1년 후 삭제 |

### 6.3 SQL Injection 방어

**Prisma ORM 사용:**
- Prepared Statements 자동 적용
- 사용자 입력 자동 이스케이프

**예시:**
```typescript
// 안전 (Prisma)
const user = await prisma.user.findUnique({
  where: { email: userInput } // 자동 이스케이프
})

// 위험 (Raw SQL)
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${userInput}'
` // SQL Injection 취약
```

---

## 7. 성능 최적화

### 7.1 커넥션 풀 설정

```typescript
// Prisma 커넥션 풀
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")

  // 커넥션 풀 설정
  pool_size = 20
  pool_timeout = 30
}
```

**권장 설정:**
- 개발 환경: 5-10 커넥션
- 프로덕션: 20-50 커넥션
- 최대: 100 커넥션 (MariaDB 기본 제한)

### 7.2 쿼리 최적화

**N+1 문제 방지:**
```typescript
// 나쁜 예 (N+1)
const classes = await prisma.class.findMany()
for (const cls of classes) {
  const professor = await prisma.user.findUnique({
    where: { id: cls.professorId }
  })
}

// 좋은 예 (JOIN)
const classes = await prisma.class.findMany({
  include: {
    professor: true,
    curriculum: true
  }
})
```

### 7.3 캐싱 전략

**Redis 캐싱:**
- **세션 데이터**: 24시간 TTL
- **실시간 모니터링**: 5분 TTL
- **커리큘럼 정보**: 1시간 TTL (자주 변경되지 않음)

**예시:**
```typescript
// 커리큘럼 캐싱
async function getCurriculum(id: number) {
  const cacheKey = `curriculum:${id}`

  // 캐시 확인
  let curriculum = await redis.get(cacheKey)
  if (curriculum) {
    return JSON.parse(curriculum)
  }

  // DB 조회
  curriculum = await prisma.curriculum.findUnique({
    where: { id }
  })

  // 캐시 저장 (1시간 TTL)
  await redis.setex(cacheKey, 3600, JSON.stringify(curriculum))

  return curriculum
}
```

---

## 8. 백업 및 복구

### 8.1 백업 전략

**자동 백업 (Cron):**
```bash
# 매일 새벽 3시 전체 백업
0 3 * * * /usr/bin/mysqldump -u root -p'password' \
  eduverse > /backup/eduverse_$(date +\%Y\%m\%d).sql
```

**백업 종류:**
- **전체 백업**: 매일 1회
- **증분 백업**: 매 6시간
- **보관 기간**: 30일

### 8.2 복구 절차

**전체 복구:**
```bash
mysql -u root -p eduverse < /backup/eduverse_20251020.sql
```

**특정 테이블 복구:**
```bash
mysql -u root -p eduverse < /backup/eduverse_20251020.sql \
  --tables users classes
```

---

## 9. 모니터링

### 9.1 모니터링 항목

| 항목 | 임계값 | 알림 |
|------|--------|------|
| CPU 사용률 | > 80% | Slack/Email |
| 메모리 사용률 | > 85% | Slack/Email |
| 커넥션 수 | > 90개 | Slack |
| 슬로우 쿼리 | > 1초 | 로그 |
| 데이터베이스 용량 | > 80% | Email |

### 9.2 슬로우 쿼리 로그

```sql
-- MariaDB 설정
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- 1초 이상 쿼리

-- 슬로우 쿼리 확인
SELECT * FROM mysql.slow_log
ORDER BY query_time DESC
LIMIT 10;
```

---

## 10. 초기 데이터

### 10.1 커리큘럼 시드 데이터

```sql
INSERT INTO curricula (name, description, weeks, language, created_at) VALUES
('C 프로그래밍 기초', 'C언어 기본 문법, 포인터, 구조체 학습', 12, 'C', NOW()),
('Java 프로그래밍 기초', 'Java 객체지향 프로그래밍 입문', 12, 'Java', NOW()),
('JavaScript 프로그래밍 기초', '웹 개발을 위한 JavaScript 기초', 12, 'JavaScript', NOW()),
('C# 프로그래밍 기초', 'C# 언어 기본 및 .NET 환경', 12, 'C#', NOW());
```

### 10.2 관리자 계정

```sql
INSERT INTO users (email, name, password_hash, role, email_verified, status, created_at) VALUES
('admin@eduverse.com', 'Admin', '$2b$12$...', 'admin', TRUE, 'active', NOW());
```

**참고:** `password_hash`는 bcrypt로 해싱된 값 사용

---

## 11. Prisma ORM 설정

### 11.1 schema.prisma

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique @db.VarChar(255)
  name          String    @db.VarChar(50)
  passwordHash  String    @db.VarChar(255)
  role          Role
  emailVerified Boolean   @default(false)
  status        UserStatus @default(active)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  classes       Class[]
  enrollments   ClassEnrollment[]
  submissions   Submission[]
  workLogs      WorkLog[]
  questions     Question[]
  adminLogs     AdminLog[]

  @@index([email])
  @@index([role])
  @@index([status])
  @@map("users")
}

enum Role {
  student
  professor
  admin
}

enum UserStatus {
  active
  inactive
  suspended
}

// 기타 모델 정의...
```

### 11.2 마이그레이션

```bash
# 마이그레이션 파일 생성
npx prisma migrate dev --name init

# 프로덕션 적용
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

---

## 12. 문제 해결

### 12.1 커넥션 풀 고갈

**증상:** "Too many connections" 에러

**해결:**
```sql
-- 현재 커넥션 수 확인
SHOW STATUS LIKE 'Threads_connected';

-- 최대 커넥션 수 확인
SHOW VARIABLES LIKE 'max_connections';

-- 최대 커넥션 수 증가
SET GLOBAL max_connections = 200;
```

### 12.2 슬로우 쿼리

**증상:** 특정 API 응답 시간 > 2초

**해결:**
1. 슬로우 쿼리 로그 확인
2. `EXPLAIN` 명령으로 쿼리 분석
3. 인덱스 추가 또는 쿼리 최적화

```sql
-- 쿼리 분석
EXPLAIN SELECT * FROM submissions
WHERE student_id = 1 AND is_first_submission = TRUE;

-- 인덱스 추가 (필요 시)
CREATE INDEX idx_student_first ON submissions(student_id, is_first_submission);
```

### 12.3 디스크 용량 부족

**증상:** "No space left on device"

**해결:**
```bash
# 데이터베이스 용량 확인
SELECT
  table_schema AS "Database",
  SUM(data_length + index_length) / 1024 / 1024 AS "Size (MB)"
FROM information_schema.tables
GROUP BY table_schema;

# 오래된 로그 삭제 (1년 이상)
DELETE FROM admin_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

# 테이블 최적화
OPTIMIZE TABLE submissions;
```

---

## 13. Phase별 로드맵

### Phase 1: MVP (현재 - 개발 환경)
- MSW + localStorage 사용
- MariaDB 스키마 설계 완료
- Prisma 스키마 작성

### Phase 2: 프로덕션 전환
- [ ] Cafe24 MariaDB 인스턴스 생성
- [ ] Prisma 마이그레이션 실행
- [ ] 초기 데이터 시드
- [ ] 백엔드 API 구현 (Express.js)
- [ ] Redis 캐싱 적용
- [ ] 비밀번호 해싱 적용 (bcrypt)

### Phase 3: 최적화 및 스케일링
- [ ] Master-Slave Replication
- [ ] 읽기 전용 복제본 (Read Replica)
- [ ] 파티셔닝 (submissions 테이블)
- [ ] 백업 자동화 (S3/Object Storage)
- [ ] 모니터링 대시보드 (Grafana)

---

## 14. 관련 문서

- [시스템 아키텍처 v1.4](../02-architecture/01-system-architecture.md) - 전체 시스템 구조
- [개발자 가이드 v1.3](./00-developer-guide.md) - 프로젝트 개요
- [개발 환경 설정 가이드 v1.2](./01-development-setup-guide.md) - MSW 설정

---

## 15. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-10-20 | • 초기 문서 작성<br>• 전체 데이터베이스 스키마 정리 (9개 핵심 테이블)<br>• 데이터 흐름 및 비즈니스 로직 설명<br>• 인덱스 전략 및 성능 최적화<br>• 보안 및 백업 전략<br>• Prisma ORM 설정 가이드 | Database Team |

---

**문서 작성 완료일**: 2025-10-20
**현재 상태**: MariaDB 스키마 설계 완료, Phase 2 대기 중
**다음 작업**: Cafe24 MariaDB 인스턴스 생성 및 Prisma 마이그레이션
