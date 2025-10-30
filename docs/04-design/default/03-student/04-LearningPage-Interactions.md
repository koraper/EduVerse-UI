# 학습하기 페이지 - 상호작용 및 플로우

## 🔄 사용자 플로우 다이어그램

### 전체 학습 프로세스

```
┌─────────────────┐
│ 과목 상세 페이지 │
│  (CourseDetail) │
└────────┬────────┘
         │ "학습하기" 클릭
         ↓
┌─────────────────────────────────────┐
│   LearningPage 로드                 │
│  (이전 학습 진행도 복원)            │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  난이도 선택 (기초/중급/심화)       │
│  - 시작 코드 로드                   │
│  - 테스트 케이스 결정               │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  학습 콘텐츠 표시                   │
│  - 학습 목표                        │
│  - 개념 설명                        │
│  - 코드 에디터                      │
│  - 테스트 영역                      │
└────────┬────────────────────────────┘
         │
    ┌────┴────┬────────────┬──────────┐
    │          │            │          │
    ↓          ↓            ↓          ↓
  [실행]    [테스트]     [힌트]     [질문]
    │          │            │          │
    └────┬─────┴────────┬───┴──────┬───┘
         │              │          │
         ↓              ↓          ↓
   [콘솔출력]  [테스트결과] [도움말/질문창]
         │              │          │
         └──────┬───────┴────┬─────┘
                │            │
        테스트 통과?      사용자 선택
                │            │
    ┌───────────┴──┐    ┌────┴────┐
    │ YES          │    │ NO       │
    ↓              ↓    ↓
┌──────────────┐  │  [계속 작성]
│ 완료 표시    │  │    │
│ 다음 차시 활성화 │  └──→ [루프]
└────┬─────────┘
     │
     ↓
┌──────────────────────┐
│ "완료 및 다음" 클릭   │
└────┬─────────────────┘
     │
     ↓
┌──────────────────────┐
│ 다음 차시로 이동     │
│ (또는 과목 상세로)   │
└──────────────────────┘
```

---

## 🔌 컴포넌트 계층 구조

```
LearningPage
├── Header
│   ├── BackButton
│   ├── CourseInfo
│   ├── ProgressBar
│   ├── ThemeToggle
│   └── ProfileMenu
├── Container (3-column layout)
│   ├── Sidebar
│   │   ├── CurriculumRoadmap
│   │   │   ├── LessonItem (map over lessons)
│   │   │   │   ├── Icon (✅, 🔵, ⭕, ❌)
│   │   │   │   ├── LessonTitle
│   │   │   │   └── Duration
│   │   │   └── LearningStats
│   │   │       ├── CompletionRate
│   │   │       ├── TotalTime
│   │   │       └── LastLearned
│   │
│   └── MainContent
│       ├── LearningContent
│       │   ├── LessonTitle
│       │   ├── LearningObjectives
│       │   ├── ConceptExplanation
│       │   └── DifficultySelector
│       │       ├── BasicLevel
│       │       ├── IntermediateLevel
│       │       └── AdvancedLevel
│       │
│       ├── CodeEditor
│       │   ├── EditorToolbar
│       │   │   ├── LanguageSelector
│       │   │   ├── FontSizeSelector
│       │   │   ├── FormatButton
│       │   │   └── ResetButton
│       │   ├── MonacoEditor
│       │   └── LineNumbers
│       │
│       ├── ExecutionPanel (탭형)
│       │   ├── ConsoleTab
│       │   │   ├── ConsoleOutput
│       │   │   ├── ErrorMessages
│       │   │   └── ExecutionTime
│       │   └── TestResultsTab
│       │       ├── TestCaseItem (map)
│       │       │   ├── TestName
│       │       │   ├── Status (PASS/FAIL)
│       │       │   ├── Expected
│       │       │   └── Actual
│       │       └── OverallStats
│       │           ├── PassCount
│       │           ├── FailCount
│       │           └── PassRate
│       │
│       ├── Controls
│       │   ├── ExecuteButton
│       │   └── TestButton
│       │
│       ├── Feedback
│       │   ├── ProgressBar
│       │   ├── AutoSaveStatus
│       │   ├── HintButton
│       │   └── AskQuestionButton
│       │
│       └── Navigation
│           ├── PreviousButton
│           ├── CompleteButton
│           └── NextButton
```

---

## 📊 상태 관리 다이어그램

```
Global State (Zustand/Redux)
│
├── LearningState
│   ├── currentCourseId: string
│   ├── currentLessonId: string
│   ├── code: string
│   ├── selectedDifficulty: 'basic' | 'intermediate' | 'advanced'
│   ├── executionResult: ExecutionResult
│   ├── testResults: TestResult[]
│   ├── isLoading: boolean
│   ├── progress: number (0-100)
│   ├── hintUsed: boolean
│   └── lastSaved: timestamp
│
├── UIState
│   ├── activeTab: 'console' | 'tests'
│   ├── isSidebarOpen: boolean
│   ├── currentTheme: 'light' | 'dark'
│   └── tooltips: Map<string, boolean>
│
└── UserState
    ├── userId: string
    ├── completedLessons: Set<string>
    ├── learningTime: Map<string, number>
    └── lastVisitedLesson: string
```

---

## 🎬 주요 인터랙션 시나리오

### 시나리오 1: 코드 작성 및 테스트

```
1. 사용자가 에디터에 코드 입력
   └─ 이벤트: onChange
   └─ 액션: updateCode()
   └─ 상태: code 변수 업데이트
   └─ 자동 저장: 2초 디바운스 후 로컬 저장

2. "코드 실행" 버튼 클릭
   └─ 이벤트: onClick
   └─ 액션: executeCode()
   └─ 요청: API POST /api/execute
   └─ 응답: ConsoleOutput, ExecutionTime
   └─ UI 업데이트: ConsoleTab 표시, 아웃풋 렌더링

3. "테스트 실행" 버튼 클릭
   └─ 이벤트: onClick
   └─ 액션: runTests()
   └─ 요청: API POST /api/run-tests
   └─ 응답: TestResults[]
   └─ UI 업데이트: TestResultsTab 표시, 통과/실패 표시
   └─ 진행도 계산: (통과한 테스트 / 전체 테스트) * 100

4. 모든 테스트 통과 (100%)
   └─ 이벤트: 자동 감지
   └─ 액션: markLessonComplete()
   └─ UI 업데이트:
       - 완료 배지 표시 (✅)
       - "완료 및 다음" 버튼 활성화
       - 진행도 바 채우기
       - 애니메이션 재생
```

### 시나리오 2: 난이도 변경

```
1. 사용자가 "심화" 난이도 선택
   └─ 이벤트: onClick
   └─ 액션: setDifficulty('advanced')
   └─ 상태 업데이트: selectedDifficulty = 'advanced'

2. 시작 코드 로드
   └─ 요청: API GET /api/lessons/{lessonId}/code?difficulty=advanced
   └─ 응답: 심화 수준의 시작 코드
   └─ UI: 에디터에 새 코드 로드

3. 테스트 케이스 업데이트
   └─ 요청: API GET /api/lessons/{lessonId}/tests?difficulty=advanced
   └─ 응답: 심화 수준의 테스트 케이스
   └─ UI: 테스트 영역 업데이트

4. 진행도 초기화
   └─ 액션: resetProgress()
   └─ 상태: progress = 0, testResults = []
   └─ UI: 진행도 바 초기화
```

### 시나리오 3: 힌트 사용

```
1. 사용자가 진행도 40% 이상 달성
   └─ 조건: progress >= 40
   └─ UI: HintButton 활성화

2. "힌트 보기" 버튼 클릭
   └─ 이벤트: onClick
   └─ 액션: getHint()
   └─ 요청: API GET /api/lessons/{lessonId}/hint?difficulty={difficulty}
   └─ 응답: Hint 텍스트
   └─ UI: Hint 섹션 표시
   └─ 제약: 한 번만 사용 가능 (hintUsed = true)

3. 사용자가 힌트 읽음
   └─ UI: 힌트 섹션 색상 변경 (노란색)
   └─ 버튼 상태: 비활성화 (클릭 불가)
```

### 시나리오 4: 교수자에게 질문

```
1. "교수님께 질문하기" 버튼 클릭
   └─ 이벤트: onClick
   └─ 액션: openQuestionModal()
   └─ UI: 질문 작성 모달 표시

2. 질문 작성
   └─ 폼 필드:
       - 제목
       - 내용
       - 관련 코드 (선택사항)
       - 첨부 파일 (선택사항)

3. 질문 제출
   └─ 이벤트: onClick
   └─ 액션: submitQuestion()
   └─ 요청: API POST /api/questions
   └─ 응답: 질문이 저장됨
   └─ UI: 성공 메시지 표시, 모달 닫음

4. 교수자 답변
   └─ WebSocket: 실시간 답변 수신
   └─ 알림: 사용자에게 알림
   └─ UI: 답변 표시
```

### 시나리오 5: 차시 전환

```
1. "완료 및 다음" 버튼 클릭
   └─ 조건: 모든 테스트 통과
   └─ 이벤트: onClick
   └─ 액션: completeLessonAndNavigateNext()

2. 현재 차시 완료 처리
   └─ 요청: API POST /api/lessons/{lessonId}/complete
   └─ 데이터 저장:
       - completedAt: timestamp
       - totalTime: 소요 시간
       - difficulty: 선택한 난이도
       - code: 최종 코드

3. 다음 차시 로드
   └─ 요청: API GET /api/lessons/{nextLessonId}
   └─ 응답: 다음 차시 정보 및 콘텐츠
   └─ UI: LearningPage 업데이트
       - 차시 제목 변경
       - 콘텐츠 업데이트
       - 에디터 초기화
       - 진행도 바 업데이트

4. 사이드바 업데이트
   └─ 현재 차시 마크: 🔵 → ✅
   └─ 다음 차시 마크: ⭕ → 🔵
   └─ 학습 통계 업데이트
```

---

## ⏱️ 자동 저장 메커니즘

```
사용자 입력 (onChange)
    ↓
    └─→ [2초 디바운스]
            ↓
        [로컬 스토리지 저장]
            ↓
        [5초마다 체크]
            ↓
        [변경사항 감지?]
            ├─ YES: [백엔드 API 호출]
            │        └─→ API POST /api/lessons/{id}/autosave
            │        └─→ [저장 완료 UI 표시]
            │        └─→ [타임스탐프 업데이트]
            │
            └─ NO: [무시]

네트워크 오류 발생
    ├─ [재시도 큐에 추가]
    ├─ [사용자에게 알림]
    └─ [온라인 복귀 시 재전송]

사용자 이탈 (beforeunload)
    ├─ [저장되지 않은 변경사항?]
    ├─ YES: [경고 대화상자]
    └─ NO: [정상 종료]
```

---

## 🎨 상태별 UI 표현

### 로딩 상태

```
┌────────────────────────────────────┐
│         로딩 중...                  │
│                                    │
│   ███████░░░░░░░░░░░░░░░░░░░░ 40% │
│                                    │
│   • 콘텐츠 로드 중                  │
│   • 코드 에디터 초기화 중           │
│   • 테스트 케이스 로드 중           │
└────────────────────────────────────┘
```

### 에러 상태

```
┌────────────────────────────────────┐
│ ⚠️  오류 발생                       │
├────────────────────────────────────┤
│                                    │
│ 코드 실행 중 에러가 발생했습니다.  │
│                                    │
│ SyntaxError: invalid syntax        │
│ Line 12: expected ':'              │
│                                    │
│  [코드 초기화]  [재시도]            │
│                                    │
└────────────────────────────────────┘
```

### 성공 상태 (완료)

```
┌────────────────────────────────────┐
│ 🎉 축하합니다!                      │
├────────────────────────────────────┤
│                                    │
│ ✅ 모든 테스트 통과!               │
│                                    │
│ 완료 시간: 25분 30초                │
│ 난이도: 심화                       │
│                                    │
│ 📊 통계                            │
│ • 작성 라인: 45 라인               │
│ • 실행 횟수: 12회                  │
│ • 테스트 시도: 5회                 │
│                                    │
│ [완료 및 다음 ➡️]                  │
│                                    │
└────────────────────────────────────┘
```

---

## 🔐 권한 및 보안

### 접근 제어

```
LearningPage 접근 조건:
├─ 로그인한 학생
├─ 현재 수강 중인 과목
├─ 선행 차시 완료 (선택사항)
└─ 차시 시작 전에 공개됨
```

### 코드 실행 보안

```
사용자 코드 실행 (샌드박스)
    ↓
[리소스 제한]
├─ 최대 CPU 시간: 5초
├─ 최대 메모리: 256MB
├─ 파일 시스템: 읽기 전용
└─ 네트워크: 제한됨 (API만)

[코드 검증]
├─ 금지 명령어 필터 (rm, os.system 등)
├─ 악성 라이브러리 블록
└─ 샌드박스 탈출 시도 감지

[실행]
└─ Docker 컨테이너에서 격리 실행
```

---

## 📈 분석 및 메트릭

### 수집하는 데이터

```
학습 세션 데이터:
├─ 차시 ID
├─ 사용자 ID
├─ 시작 시간 / 종료 시간
├─ 선택한 난이도
├─ 코드 실행 횟수
├─ 테스트 시도 횟수
├─ 힌트 사용 여부
├─ 질문 작성 여부
└─ 최종 완료 여부

코드 분석:
├─ 최종 코드 라인 수
├─ 코드 변경 이력
├─ 실행 시간
└─ 테스트 커버리지
```

### 분석 용도

```
학생 입장:
├─ 개인 학습 통계 대시보드
├─ 약점 분석 및 추천
└─ 성장 기록 시각화

교수자 입장:
├─ 학급별 학습 진도 현황
├─ 개별 학생 분석
├─ 차시 난이도 피드백
└─ 자주 하는 질문 파악

관리자 입장:
├─ 플랫폼 사용 통계
├─ 학습 효과 분석
└─ 콘텐츠 개선 제안
```

---

## 🌐 API 엔드포인트

### 학습 콘텐츠

```
GET  /api/courses/{courseId}/lessons/{lessonId}
     └─ 차시 정보, 학습 목표, 개념 설명

GET  /api/lessons/{lessonId}/code?difficulty=basic
     └─ 시작 코드 (난이도별)

GET  /api/lessons/{lessonId}/tests?difficulty=basic
     └─ 테스트 케이스 (난이도별)

GET  /api/lessons/{lessonId}/hint?difficulty=basic
     └─ 힌트 텍스트
```

### 코드 실행

```
POST /api/execute
     Body: { code, language }
     Response: { output, executionTime, error }

POST /api/run-tests
     Body: { code, language, lessonId, difficulty }
     Response: { results[], passRate, totalTime }
```

### 진행 상황

```
POST /api/lessons/{lessonId}/autosave
     Body: { code, difficulty, timestamp }

POST /api/lessons/{lessonId}/complete
     Body: { code, difficulty, totalTime, timestamp }

GET  /api/lessons/{lessonId}/progress
     Response: { completedAt, code, totalTime, difficulty }
```

### 상호작용

```
POST /api/questions
     Body: { title, content, code, attachments, lessonId }
     Response: { questionId, createdAt }

GET  /api/questions/{questionId}/answer
     Response: { answer, answeredAt, byUser }
```

---

## 📱 반응형 구현 세부사항

### 데스크톱 (1200px+)
```
[Header]
[Sidebar | Main Content]
- 사이드바 너비: 280px (고정)
- 콘텐츠 너비: calc(100% - 280px)
- 2개 컬럼 에디터/테스트 영역 (필요시)
```

### 태블릿 (768px - 1199px)
```
[Header with Sidebar Toggle]
[Sidebar (toggle) | Main Content]
- 사이드바 너비: 240px 또는 드로어
- 콘텐츠 너비: 100% (사이드바 닫을 때)
- 1개 컬럼 에디터/테스트 영역 (탭전환)
```

### 모바일 (< 768px)
```
[Header with Sidebar Toggle]
[Sidebar (모달 드로어)]
[Main Content (전체 너비)]
- 사이드바: 드로어 패널 (좌측에서 슬라이드)
- 콘텐츠: 전체 너비
- 에디터: 세로 스택 (더보기 버튼)
- 테스트: 별도 탭
```

---

## 🎯 성능 최적화 전략

```
번들 크기:
├─ 모나코 에디터 지연 로드
├─ Piston API 무거운 라이브러리 제외
└─ 트리 쉐이킹 적용

렌더링:
├─ 가상화 (큰 차시 목록)
├─ 메모이제이션 (React.memo)
├─ 코드 스플리팅 (라우트별)
└─ 이미지 최적화 (WebP)

네트워크:
├─ 자동 저장 디바운싱
├─ API 응답 캐싱
├─ 예측적 프리페칭
└─ gzip 압축
```

---

## ✅ 구현 체크리스트

- [ ] UI 컴포넌트 개발
  - [ ] Header
  - [ ] Sidebar (CurriculumRoadmap)
  - [ ] LearningContent
  - [ ] CodeEditor (Monaco 통합)
  - [ ] ExecutionPanel
  - [ ] Feedback & Navigation

- [ ] 상태 관리 (Zustand)
  - [ ] LearningState
  - [ ] UIState
  - [ ] Actions

- [ ] API 연동
  - [ ] 콘텐츠 로드
  - [ ] 코드 실행
  - [ ] 테스트 실행
  - [ ] 자동 저장
  - [ ] 질문 기능

- [ ] 기능 구현
  - [ ] 난이도 선택
  - [ ] 코드 작성 및 실행
  - [ ] 테스트 결과 처리
  - [ ] 힌트 시스템
  - [ ] 자동 저장
  - [ ] 질문 기능
  - [ ] 차시 완료 및 전환

- [ ] 디자인 & UX
  - [ ] 다크모드 테마
  - [ ] 반응형 레이아웃
  - [ ] 애니메이션
  - [ ] 접근성

- [ ] 테스트
  - [ ] 단위 테스트
  - [ ] 통합 테스트
  - [ ] E2E 테스트
  - [ ] 성능 테스트

- [ ] 배포
  - [ ] 스테이징 환경 테스트
  - [ ] 성능 최적화
  - [ ] 보안 검토
  - [ ] 프로덕션 배포
