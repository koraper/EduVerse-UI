# EduVerse 시스템 아키텍처

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 시스템 아키텍처 |
| 버전 | 1.4 |
| 작성일 | 2025-10-17 |
| 최종 수정일 | 2025-10-19 |
| 작성자 | Architecture Team |
| 목적 | EduVerse 플랫폼의 전체 시스템 아키텍처 정의 |
| 기반 문서 | PRD v2.7, 역할별 기능 리스트 v3.6 |

---

## 1. 아키텍처 개요

### 1.1 시스템 특성

EduVerse는 **실시간 강의실 환경**에 최적화된 웹 기반 프로그래밍 교육 플랫폼입니다.

#### 핵심 특성
- **실시간 양방향 통신**: 교수자-학생 간 실시간 모니터링 및 Q&A
- **브라우저 기반 실행**: 별도 설치 없이 Python, JavaScript, C, Java 실행
- **확장 가능한 구조**: 수평 확장 가능한 마이크로서비스 지향 아키텍처
- **오프라인 수업 특화**: 대면 수업 환경에서의 최적 성능

#### 주요 사용 시나리오
```
[컴퓨터실 / 강의실]
교수자 1명 (앞) + 학생 20-100명 (각자 PC)
→ 모두 브라우저로 EduVerse 접속
→ 교수자: 실시간 모니터링 + Code Peek
→ 학생: 코딩 실습 + 즉시 피드백
→ 24시간 자동 종료, 주차별 독립 관리
```

---

## 2. 시스템 아키텍처

### 2.1 전체 시스템 구조

```
┌─────────────────────────────────────────────┐
│           사용자 인터페이스 계층              │
│   ┌─────────┬──────────┬──────────────┐    │
│   │  학생   │   교수   │    관리자      │    │
│   │  웹앱   │ 대시보드 │   대시보드     │    │
│   └─────────┴──────────┴──────────────┘    │
├─────────────────────────────────────────────┤
│          애플리케이션 서비스 계층             │
│   ┌─────────┬──────────┬──────────────┐    │
│   │ 학습    │ 모니터링 │    분석       │    │
│   │ 엔진    │ 서비스   │   서비스      │    │
│   └─────────┴──────────┴──────────────┘    │
├─────────────────────────────────────────────┤
│         코드 실행 엔진 계층                   │
│   ┌─────────┬──────────┬──────────────┐    │
│   │ Pyodide │   Piston │  브라우저     │    │
│   │(Python) │ (C/Java) │(JavaScript)   │    │
│   └─────────┴──────────┴──────────────┘    │
├─────────────────────────────────────────────┤
│              데이터 계층                      │
│   ┌─────────┬──────────┬──────────────┐    │
│   │MariaDB  │  Redis   │ File Storage │    │
│   │   DB    │  캐시    │   (코드)      │    │
│   └─────────┴──────────┴──────────────┘    │
├─────────────────────────────────────────────┤
│           인프라스트럭처 계층                │
│   ┌─────────────────────────────────────┐   │
│   │   Cafe24 클라우드 가상서버           │   │
│   │   - Python Runtime                  │   │
│   │   - MariaDB Instance                │   │
│   │   - Docker Support                  │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2.2 계층별 상세 설명

#### 2.2.1 사용자 인터페이스 계층

**기술 스택**
- React 18+ (TypeScript)
- Tailwind CSS (반응형 디자인)
- Monaco Editor (VS Code 급 에디터)
- Chart.js (학습 분석 시각화)
- Lucide Icons

**역할별 UI**
| 역할 | 주요 화면 | 특징 |
|------|----------|------|
| **학생** | 학습 대시보드, 코딩 공간, 업무일지 | 친근한 UI, 게임형 평가 |
| **교수자** | 실시간 모니터링, Code Peek, 분석 리포트 | 실시간 대시보드, 주차별 관리 |
| **관리자** | 시스템 대시보드, 사용자 관리, 수업 관리, 전역 설정, 관리 로그 | 전체 시스템 모니터링 및 관리 |

**반응형 브레이크포인트**
- Mobile (sm): ≥640px
- Tablet (md): ≥768px
- Desktop (lg): ≥1024px
- Large Desktop (xl): ≥1280px

#### 2.2.2 애플리케이션 서비스 계층

**학습 엔진 서비스**
- 커리큘럼 관리 (4개: C, Java, JavaScript, C#)
- 주차별 시나리오 진행
- 제출 데이터 정책 (첫 번째 제출만 평가 반영)
- 진도 자동 저장

**모니터링 서비스**
- 실시간 학생 상태 추적
- Code Peek (읽기 전용)
- 활동 로그 수집
- WebSocket 기반 실시간 통신

**분석 서비스**
- 학습 패턴 분석
- 성과 리포트 생성
- 어려운 과제 Top 5 도출
- 학생별 상세 분석

#### 2.2.3 코드 실행 엔진 계층

| 언어 | 실행 환경 | 위치 | 특징 |
|------|----------|------|------|
| **Python** | Pyodide (WebAssembly) | 클라이언트 | 브라우저 내 실행, < 1초 응답 |
| **JavaScript** | 브라우저 네이티브 | 클라이언트 | 즉시 실행 |
| **C** | Piston API | 서버 | https://emkc.org/api/v2/piston |
| **Java** | Piston API | 서버 | https://emkc.org/api/v2/piston |

**실행 시간 제한**
- 목표 응답 시간: < 1초
- 최대 실행 시간: 5초 (타임아웃)

#### 2.2.4 데이터 계층

**MariaDB (Cafe24)**
- 사용자 정보 (인증, 역할)
- 수업 정보 (커리큘럼, 주차, 상태)
- 학습 데이터 (진도, 제출 기록)
- Q&A 데이터
- Soft Delete 지원 (수업 탈퇴/삭제)

**Redis (캐시)**
- 세션 관리 (24시간 자동 만료)
- 실시간 모니터링 데이터
- API Rate Limiting

**File Storage**
- 학생 코드 제출 파일
- 강의 자료 (PDF, 영상)
- QR 코드 이미지

---

## 3. 데이터 모델

### 3.1 핵심 엔티티

#### 3.1.1 사용자 (Users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2
  role ENUM('student', 'professor', 'admin') NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL -- Soft Delete
);
```

#### 3.1.2 수업 (Classes)
```sql
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  professor_id INT NOT NULL,
  curriculum_id INT NOT NULL, -- 4개 중 1개
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year INT NOT NULL,
  semester ENUM('1학기', '2학기', '여름학기', '겨울학기') NOT NULL,
  invitation_code CHAR(6) UNIQUE NOT NULL, -- 영대+숫자 6자리
  qr_code_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL, -- Soft Delete (Hiding)
  FOREIGN KEY (professor_id) REFERENCES users(id),
  FOREIGN KEY (curriculum_id) REFERENCES curricula(id)
);
```

#### 3.1.3 주차별 수업 (Weekly Sessions)
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
  FOREIGN KEY (class_id) REFERENCES classes(id),
  UNIQUE KEY unique_class_week (class_id, week_number),
  CONSTRAINT only_one_in_progress CHECK (
    -- 동시 진행 제한: 하나의 class_id에서 1개만 in_progress 가능
  )
);
```

#### 3.1.4 학생-수업 연결 (Class Enrollments)
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
  UNIQUE KEY unique_student_class (student_id, class_id)
);
```

#### 3.1.5 제출 데이터 (Submissions)
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
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  -- 첫 번째 제출만 is_first_submission = TRUE
  CONSTRAINT unique_first_submission UNIQUE (student_id, task_id, is_first_submission)
);
```

#### 3.1.6 힌트 (Hints)
```sql
CREATE TABLE hints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL, -- 힌트 제목 (예: "변수 선언 방법")
  content TEXT NOT NULL, -- 힌트 내용 (Markdown 지원)
  video_url VARCHAR(255), -- 교수 요약 강의 영상 URL (옵션)
  order_index INT DEFAULT 0, -- 힌트 표시 순서
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  INDEX idx_task_order (task_id, order_index)
);
```

**힌트 기능 정책**
- 각 과제(task)별로 여러 개의 힌트 제공 가능
- 힌트는 텍스트(Markdown) + 선택적 영상 강의로 구성
- 학생은 언제든지 힌트를 조회 가능 (제출 횟수에 영향 없음)
- 교수자는 커리큘럼 설계 시 또는 수업 진행 중 힌트 등록/수정 가능 (MVP 범위 밖)
- MVP에서는 관리자가 커리큘럼 등록 시 힌트를 사전 입력

#### 3.1.7 업무일지 (Work Logs)
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

**업무일지 기능 정책**
- 주차별로 1개의 업무일지 작성 가능 (week_number 단위)
- 학생은 주차별 수업 진행 중 또는 종료 후 작성 가능
- 작성 후 수정 가능 (submitted_at은 최초 작성 시간, updated_at은 최종 수정 시간)
- 자기평가 점수, 완료 작업, 어려운 점, 개선 계획 포함
- 교수자는 모든 학생의 업무일지 조회 가능

#### 3.1.8 가상 멘토 대화 (Mentor Dialogs)
```sql
CREATE TABLE mentor_dialogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  mentor_type ENUM('alex', 'sena', 'kim_professor') NOT NULL,
  dialog_order INT NOT NULL, -- 대화 표시 순서
  content TEXT NOT NULL, -- 대화 내용 (Markdown 지원)
  dialog_type ENUM('greeting', 'guidance', 'encouragement', 'hint') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  INDEX idx_task_mentor (task_id, mentor_type, dialog_order)
);
```

**가상 멘토 시스템 정책**
- **Alex (친근한 팀장)**: 학습 동기 부여, 전반적인 가이드
- **Sena (도움 주는 선임)**: 구체적인 기술 조언, 힌트 제공
- **김교수 (전문가)**: 이론적 설명, 심화 학습 가이드
- 각 과제(task)별로 멘토별 대화 내용 사전 정의
- 대화는 정적 콘텐츠로 관리 (AI 대화 아님)
- 학생이 특정 과제를 열면 해당 과제의 멘토 대화가 순차적으로 표시
- MVP에서는 관리자가 커리큘럼 등록 시 멘토 대화 사전 입력
- Phase 2: AI 기반 실시간 대화 기능 검토 가능

#### 3.1.9 관리 로그 (Admin Logs)
```sql
CREATE TABLE admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action_type ENUM('create', 'update', 'delete', 'status_change', 'login', 'logout') NOT NULL,
  target_type ENUM('user', 'class', 'setting', 'system') NOT NULL,
  target_id INT NULL, -- 대상 엔티티 ID (사용자, 수업 등)
  description TEXT NOT NULL, -- 작업 설명 (예: "사용자 hong@example.com의 상태를 '정지'로 변경")
  ip_address VARCHAR(45), -- IPv4/IPv6
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_admin_created (admin_id, created_at),
  INDEX idx_action_type (action_type, created_at)
);
```

**관리 로그 정책**
- 모든 관리자 작업(CRUD)을 자동으로 기록
- 로그는 읽기 전용 (수정/삭제 불가)
- 최소 1년 이상 보관 (규정 준수)
- IP 주소 및 User Agent 기록으로 보안 추적 가능

### 3.2 데이터 흐름

#### 3.2.1 수업 생성 흐름
```
교수자 → 커리큘럼 선택 (4개 중 1개)
       → 수업 정보 입력 (이름, 연도, 학기)
       → [시스템] 입장 코드 자동 생성 (6자리)
       → [시스템] QR 코드 자동 생성
       → [시스템] 12개 주차 생성 (status: not_started)
       → 수업 생성 완료
```

#### 3.2.2 주차별 수업 시작/종료 흐름
```
교수자 → 특정 주차 선택 (예: 2주차)
       → "주차별 수업 시작" 버튼 클릭
       → [시스템] 동시 진행 제한 확인
          - 다른 주차가 in_progress면 거부
          - 없으면 허용 (순차 진행 불필요: 1주차를 건너뛰고 2주차 시작 가능)
       → 해당 주차 status: in_progress
       → started_at: 현재 시간
       → auto_end_at: started_at + 24시간
       → 학생 입장 허용

[24시간 후 또는 수동 종료]
       → 해당 주차 status: ended
       → ended_at: 현재 시간
       → 신규 학생 입장 차단
       → 읽기 전용 모드 전환

[순차 진행 정책]
       → 이전 주차가 완료되지 않아도 다음 주차 시작 가능
       → 예: 1주차를 진행하지 않고 2주차부터 시작 가능
       → 교수자가 필요에 따라 주차 순서를 자유롭게 조정 가능
```

#### 3.2.3 학생 학습 데이터 흐름
```
학생 → 코드 작성 (Monaco Editor)
    → 코드 실행 (Pyodide/Piston)
    → 결과 확인
    → 테스트 실행
    → 제출 (submission_number: 1)
       → [시스템] is_first_submission: TRUE
    → 재도전 (submission_number: 2, 3, ...)
       → [시스템] is_first_submission: FALSE

[교수자 대시보드]
    → 학생별 제출 기록 조회
    → is_first_submission = TRUE 인 데이터만 평가 반영
```

#### 3.2.4 수업 탈퇴/재참여 흐름
```
[탈퇴]
학생 → 수업 탈퇴 버튼 클릭
    → 비밀번호 입력
    → [시스템] 비밀번호 검증
    → withdrawn_at: 현재 시간
    → is_active: FALSE (Hiding)
    → [학습 데이터 보존: submissions, progress 등]

[재참여]
학생 → 동일한 입장 코드 입력
    → [시스템] 이전 탈퇴 기록 확인
    → "이전에 탈퇴한 수업입니다. 다시 참여하시겠습니까?"
    → 확인
    → withdrawn_at: NULL
    → is_active: TRUE
    → [학습 데이터 연결: 이전 submissions, progress 조회 가능]
```

---

## 4. API 설계

### 4.1 API 구조

#### 4.1.1 인증 API
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/auth/register | 회원가입 (이메일 인증 포함) | Public |
| POST | /api/auth/verify-email | 이메일 인증번호 검증 | Public |
| POST | /api/auth/resend-code | 인증번호 재전송 (30초 쿨다운) | Public |
| POST | /api/auth/login | 로그인 | Public |
| POST | /api/auth/logout | 로그아웃 | Authenticated |
| POST | /api/auth/reset-password | 비밀번호 재설정 | Public |

#### 4.1.2 수업 관리 API (교수자)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/classes | 수업 생성 | Professor |
| GET | /api/classes | 본인 수업 목록 조회 | Professor |
| GET | /api/classes/:id | 수업 상세 조회 | Professor |
| PUT | /api/classes/:id | 수업 정보 수정 | Professor |
| DELETE | /api/classes/:id | 수업 삭제 (Soft Delete) | Professor |
| POST | /api/classes/:id/weeks/:week/start | 주차별 수업 시작 | Professor |
| POST | /api/classes/:id/weeks/:week/end | 주차별 수업 종료 | Professor |
| GET | /api/classes/:id/weeks | 주차 목록 및 상태 조회 | Professor |

#### 4.1.3 수업 참여 API (학생)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/enrollments/join | 입장 코드로 수업 참여 | Student |
| GET | /api/enrollments | 참여 중인 수업 목록 | Student |
| DELETE | /api/enrollments/:id | 수업 탈퇴 (비밀번호 검증) | Student |

#### 4.1.4 학습 활동 API (학생)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/code/execute | 코드 실행 (Pyodide/Piston) | Student |
| POST | /api/submissions | 코드 제출 | Student |
| GET | /api/submissions/:taskId | 제출 기록 조회 | Student |
| GET | /api/progress | 진도 조회 | Student |
| GET | /api/tasks/:taskId/hints | 과제별 힌트 조회 (강의보기) | Student |
| GET | /api/tasks/:taskId/mentors | 과제별 가상 멘토 대화 조회 | Student |
| POST | /api/work-logs | 업무일지 작성 | Student |
| PUT | /api/work-logs/:id | 업무일지 수정 | Student |
| GET | /api/work-logs | 본인 업무일지 목록 조회 | Student |
| GET | /api/students/:id/dashboard | 성과 대시보드 (학습 통계) | Student |
| POST | /api/questions | 질문 작성 | Student |

#### 4.1.5 모니터링 API (교수자)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/classes/:id/monitoring | 실시간 학생 상태 | Professor |
| GET | /api/classes/:id/students/:studentId/code | Code Peek (읽기 전용) | Professor |
| GET | /api/classes/:id/analytics | 학습 분석 리포트 | Professor |
| GET | /api/classes/:id/work-logs | 수업별 전체 학생 업무일지 조회 | Professor |
| GET | /api/classes/:id/students/:studentId/work-logs | 특정 학생 업무일지 조회 | Professor |
| GET | /api/classes/:id/questions | Q&A 목록 | Professor |
| POST | /api/questions/:id/answer | 답변 작성 | Professor |

#### 4.1.6 사용자 관리 API
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/users/profile | 본인 프로필 조회 | Authenticated |
| PUT | /api/users/profile | 프로필 수정 (이름, 비밀번호) | Authenticated |

#### 4.1.7 관리자 API (Admin)

##### 사용자 관리
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/admin/users | 전체 사용자 조회 (페이지네이션, 검색, 필터) | Admin |
| GET | /api/admin/users?search={query} | 사용자 검색 (이메일/이름) | Admin |
| PATCH | /api/admin/users/:id/status | 사용자 상태 변경 (활성/비활성/정지) | Admin |
| PUT | /api/admin/users/:id | 사용자 정보 수정 (이름, 이메일, 역할) | Admin |
| DELETE | /api/admin/users/:id | 사용자 영구 삭제 (비밀번호 인증 필요) | Admin |

##### 수업 관리
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/admin/classes | 전체 수업 조회 (페이지네이션, 필터) | Admin |
| GET | /api/admin/classes/:id | 수업 상세 조회 (학생 목록, 진도 포함) | Admin |

##### 시스템 설정
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/admin/settings | 전역 설정 조회 | Admin |
| PUT | /api/admin/settings | 전역 설정 수정 | Admin |

##### 관리 로그
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/admin/logs | 관리 로그 조회 (페이지네이션, 필터: 날짜/작업/대상) | Admin |
| GET | /api/admin/logs/:id | 특정 로그 상세 조회 | Admin |

### 4.2 실시간 통신 (WebSocket)

#### 4.2.1 WebSocket 엔드포인트
```
ws://domain.com/ws/monitoring?classId={classId}&role={role}
```

#### 4.2.2 실시간 이벤트
| 이벤트 | 방향 | 데이터 | 설명 |
|--------|------|--------|------|
| `student:progress` | Student → Server | { taskId, progress } | 학생 진도 업데이트 |
| `student:code_change` | Student → Server | { code } | 코드 변경 (Code Peek용) |
| `professor:monitoring` | Server → Professor | { students: [...] } | 실시간 학생 상태 |
| `professor:code_peek` | Server → Professor | { studentId, code } | 특정 학생 코드 |
| `question:new` | Student → Server | { question } | 새 질문 |
| `answer:new` | Server → Student | { answer } | 새 답변 |

---

## 5. 보안 아키텍처

### 5.1 인증 및 권한

#### 5.1.1 이메일 인증 시스템
```
회원가입 → 이메일 입력
        → [시스템] 숫자 6자리 인증번호 생성
        → [시스템] 이메일 발송 (SMTP)
        → [시스템] Redis 저장 (TTL: 10분)
        → 사용자 인증번호 입력
        → [시스템] Redis에서 검증
        → 성공 시 회원가입 완료

재전송:
        → "인증번호 재전송" 버튼 (30초 쿨다운)
        → Rate Limiting (1분당 최대 3회)
```

#### 5.1.2 비밀번호 정책
- **해싱**: bcrypt 또는 argon2
- **정책**: 8-20자, 영문+숫자+특수문자 중 2가지 이상
- **연속 문자 제한**: 3개 이상 불가
- **평문 저장 금지**: 현재 평문 저장 → bcrypt로 마이그레이션 필요 🔴

#### 5.1.3 세션 관리
- **저장소**: Redis
- **만료 시간**: 24시간 (무활동 시)
- **로그인 상태 유지**: 옵션 제공 (30일)
- **동시 세션**: 허용 (멀티 디바이스)

### 5.2 보안 조치

| 위협 | 방어 메커니즘 | 상태 |
|------|--------------|------|
| **XSS** | 입력 새니타이제이션, CSP 헤더 | 🔄 구현 필요 |
| **CSRF** | CSRF 토큰, SameSite 쿠키 | 🔄 구현 필요 |
| **SQL Injection** | Prepared Statements, ORM | ✅ 적용됨 |
| **DoS** | Rate Limiting (API, 이메일) | 🔄 구현 필요 |
| **Brute Force** | 로그인 시도 제한 (5회/10분) | 🔄 구현 필요 |
| **중간자 공격** | HTTPS 강제, HSTS | 🔄 구현 필요 |

### 5.3 데이터 보호

#### 5.3.1 개인정보 보호
- 이메일: 암호화 저장 권장
- 비밀번호: bcrypt/argon2 해싱 (평문 저장 금지 🔴)
- 로그: 개인정보 마스킹 (이메일 일부 *처리)

#### 5.3.2 Soft Delete 정책
- **수업 삭제**: deleted_at 기록, 학생은 "교수가 삭제한 수업" 라벨로 조회 가능 (참여 주차만)
- **수업 탈퇴**: withdrawn_at 기록, is_active: FALSE, 학습 데이터 보존
- **재참여**: withdrawn_at NULL로 업데이트, is_active: TRUE, 학습 데이터 연결

---

## 6. 성능 및 확장성

### 6.1 성능 요구사항

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| **페이지 로드** | < 2초 | Lighthouse, WebPageTest |
| **API 응답** | < 200ms (p95) | APM 모니터링 |
| **코드 실행** | < 1초 | 실행 시간 로그 |
| **동시 접속** | 1,000명 이상 | 부하 테스트 (JMeter, k6) |
| **가용성** | 99.5% 이상 | Uptime 모니터링 |

### 6.2 확장성 전략

#### 6.2.1 수평 확장 (Horizontal Scaling)
```
로드 밸런서 (Nginx)
    ├─ 웹 서버 인스턴스 1
    ├─ 웹 서버 인스턴스 2
    └─ 웹 서버 인스턴스 3
         ↓
    MariaDB (Master-Slave)
    Redis Cluster
```

#### 6.2.2 캐싱 전략
- **Redis 캐시**: 세션, 실시간 모니터링 데이터
- **브라우저 캐시**: 정적 리소스 (CDN)
- **API 캐시**: 자주 조회되는 데이터 (커리큘럼, 주차 정보)

#### 6.2.3 데이터베이스 최적화
- **인덱스**: 자주 조회되는 컬럼 (email, invitation_code, class_id)
- **파티셔닝**: submissions 테이블 (학기별 파티션)
- **커넥션 풀**: 최대 100개 커넥션

---

## 7. 배포 아키텍처

### 7.1 개발 환경 (현재)

```
┌─────────────────────────────────────┐
│     개발자 로컬 환경                │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Vite Dev Server (3000)     │  │
│  │   - React + TypeScript       │  │
│  │   - Hot Module Replacement   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   MSW (Mock Service Worker)  │  │
│  │   - 목업 API 응답            │  │
│  │   - 브라우저 Service Worker  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   외부 서비스                │  │
│  │   - Piston API (C/Java 실행) │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 7.2 프로덕션 환경 (Phase 2)

```
┌─────────────────────────────────────┐
│     Cafe24 클라우드 가상서버         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   웹 애플리케이션             │  │
│  │   - Express.js (Node.js)     │  │
│  │   - TypeScript               │  │
│  │   - React (정적 파일 서빙)   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   MariaDB                    │  │
│  │   - Prisma ORM               │  │
│  │   - 사용자, 수업, 제출 데이터│  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Redis                      │  │
│  │   - 세션, 캐시               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Docker                     │  │
│  │   - 컨테이너 기반 배포       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 7.3 스케일 아웃 인프라 (Phase 3)

```
                [사용자]
                   ↓
            [CDN (Cloudflare)]
                   ↓
         [로드 밸런서 (Nginx)]
              ↙         ↘
     [웹 서버 1]     [웹 서버 2]
      (Node.js)       (Node.js)
              ↘         ↙
            [Redis Cluster]
                   ↓
    [MariaDB Master-Slave Replication]
                   ↓
          [백업 (S3/Object Storage)]
```

### 7.4 CI/CD 파이프라인 (Phase 2)

```
GitHub Push
    ↓
[GitHub Actions]
    ├─ 코드 린트 (ESLint)
    ├─ 타입 체크 (TypeScript)
    ├─ 유닛 테스트 (Jest/Vitest)
    ├─ 빌드 (React + Express)
    └─ 배포 (Cafe24 또는 Docker Registry)
```

---

## 8. 모니터링 및 로깅

### 8.1 모니터링 항목

| 레벨 | 항목 | 도구 (예시) |
|------|------|------------|
| **인프라** | CPU, 메모리, 디스크, 네트워크 | Prometheus, Grafana |
| **애플리케이션** | API 응답 시간, 에러율, 트래픽 | APM (New Relic, DataDog) |
| **비즈니스** | 동시 접속자, 수업 생성 수, 제출 건수 | 커스텀 대시보드 |
| **보안** | 로그인 실패, Rate Limit 초과 | SIEM |

### 8.2 로깅 전략

```
애플리케이션 로그
    ├─ INFO: 일반 요청 (API 호출, 페이지 로드)
    ├─ WARN: 비정상적 동작 (재시도, 타임아웃)
    ├─ ERROR: 에러 발생 (Exception, 500 에러)
    └─ DEBUG: 개발 디버깅 (로컬 환경만)

보안 로그
    ├─ 로그인 성공/실패
    ├─ 비밀번호 변경
    ├─ 수업 생성/삭제
    └─ Rate Limit 초과

감사 로그 (Audit Log)
    ├─ 수업 생성/수정/삭제 (교수자)
    ├─ 학생 제출 기록
    ├─ 관리자 권한 사용
    └─ 수업 탈퇴/재참여
```

---

## 9. 기술 스택 요약

### 9.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18+ | UI 프레임워크 |
| TypeScript | 5+ | 타입 안전성 |
| Tailwind CSS | 3+ | 스타일링 (반응형) |
| Monaco Editor | Latest | 코드 에디터 (VS Code 급) |
| Pyodide | Latest | Python 브라우저 실행 |
| Chart.js | 4+ | 차트/그래프 |
| Lucide Icons | Latest | 아이콘 |

### 9.2 백엔드

**개발 환경**
| 기술 | 버전 | 용도 |
|------|------|------|
| MSW (Mock Service Worker) | 2+ | 목업 API 서버 |
| JSON Server | Latest | REST API 목업 (대안) |
| - | - | 실제 백엔드 없이 프론트엔드 개발 진행 |

**프로덕션 환경 (Phase 2)**
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 20+ | 런타임 환경 |
| Express.js | 4+ | 웹 프레임워크 |
| TypeScript | 5+ | 타입 안전성 |
| MariaDB | 10.6+ | 관계형 DB |
| Prisma ORM | Latest | 데이터베이스 ORM |
| Redis | 7+ | 세션, 캐시 |
| Docker | Latest | 컨테이너화 |

### 9.3 외부 서비스

| 서비스 | 용도 |
|--------|------|
| Cafe24 클라우드 | 호스팅 (Node.js, MariaDB) |
| Piston API | C/Java 코드 실행 (https://emkc.org/api/v2/piston) |
| SMTP 서버 | 이메일 인증번호 발송 |

---

## 10. 마이그레이션 및 데이터 초기화

### 10.1 초기 데이터

#### 10.1.1 커리큘럼 데이터 (4개)
```sql
INSERT INTO curricula (name, description, weeks, language) VALUES
('C 프로그래밍 기초', 'C언어 기본 문법, 포인터, 구조체', 12, 'C'),
('Java 프로그래밍 기초', 'Java 객체지향 프로그래밍 입문', 12, 'Java'),
('JavaScript 프로그래밍 기초', '웹 개발을 위한 JavaScript 기초', 12, 'JavaScript'),
('C# 프로그래밍 기초', 'C# 언어 기본 및 .NET 환경', 12, 'C#');
```

#### 10.1.2 관리자 계정
```sql
INSERT INTO users (email, name, password_hash, role, email_verified) VALUES
('admin@eduverse.com', 'Admin', '$2b$12$...', 'admin', TRUE);
```

### 10.2 데이터 마이그레이션

**평문 비밀번호 → 해싱 마이그레이션 🔴**
```typescript
// 기존 평문 비밀번호를 bcrypt로 마이그레이션
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migratePasswords() {
  const users = await prisma.user.findMany({
    where: {
      passwordHash: null
    }
  })

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    })
  }
}
```

---

## 11. 문서 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.4 | 2025-10-19 | • **제품 문서 정합성 개선 (PRD v2.7, 역할별 기능 리스트 v3.6 반영)**<br>&nbsp;&nbsp;- 관리 로그 DB 테이블(admin_logs) 신규 추가<br>&nbsp;&nbsp;- 관리자 API 엔드포인트 신규 추가 (§4.1.7)<br>&nbsp;&nbsp;  - 사용자 관리: 조회/검색/상태변경/수정/삭제 (5개)<br>&nbsp;&nbsp;  - 수업 관리: 조회/상세조회 (2개)<br>&nbsp;&nbsp;  - 시스템 설정: 조회/수정 (2개)<br>&nbsp;&nbsp;  - 관리 로그: 조회/상세조회 (2개)<br>&nbsp;&nbsp;- 관리자 UI 설명 상세화<br>&nbsp;&nbsp;- 기반 문서 버전 업데이트 (PRD v2.6→v2.7, 역할별 기능 리스트 v3.4→v3.6) | Architecture Team |
| 1.3 | 2025-10-18 | • **백엔드 기술 스택 변경 (Python → Node.js)**<br>&nbsp;&nbsp;- 개발 환경: MSW (Mock Service Worker) 사용으로 변경<br>&nbsp;&nbsp;- 프로덕션 환경: Flask/Gunicorn → Express.js/Node.js + Prisma ORM<br>&nbsp;&nbsp;- 배포 아키텍처: 개발/프로덕션/스케일아웃 단계별 구성<br>&nbsp;&nbsp;- CI/CD 파이프라인: TypeScript 기반으로 업데이트<br>&nbsp;&nbsp;- 마이그레이션 코드: Python → TypeScript로 변경 | Architecture Team |
| 1.2 | 2025-10-17 | • **문서 정합성 강화 (PRD v2.6 반영)**: 누락된 기능 구현 및 정책 명시<br>&nbsp;&nbsp;- 업무일지 DB 테이블(work_logs) 추가<br>&nbsp;&nbsp;- 가상 멘토 대화 DB 테이블(mentor_dialogs) 및 구현 방법 명시<br>&nbsp;&nbsp;- API 엔드포인트 추가: 업무일지, 가상 멘토, 성과 대시보드, 프로필 관리<br>&nbsp;&nbsp;- 주차별 수업 "순차 진행 불필요" 정책 명시 | Architecture Team |
| 1.1 | 2025-10-17 | • **PRD 정합성 개선**: PRD v2.4, 역할별 기능 리스트 v3.4와 일치성 향상<br>&nbsp;&nbsp;- 힌트(강의보기) 기능 확인: hints 테이블 및 API 엔드포인트 이미 포함 확인<br>&nbsp;&nbsp;- 변경이력 형식을 PRD/역할별 기능 리스트와 통일 | Architecture Team |
| 1.0 | 2025-10-17 | • 초기 문서 작성 (PRD v2.4, 역할별 기능 리스트 v3.4 기반) | Architecture Team |

---

*이 문서는 PRD와 역할별 기능 리스트를 기반으로 작성되었으며, 실제 구현 과정에서 세부사항이 조정될 수 있습니다.*

**관련 문서**:
- [제품 요구사항 문서 (PRD)](../01-product/01-eduverse-product-requirements.md)
- [역할별 기능 리스트](../01-product/02-eduverse-role-based-feature-list.md)
