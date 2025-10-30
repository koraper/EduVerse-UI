# 학생 페이지 문서

## 📚 목차

### 1. 학습하기 페이지 와이어프레임 (최신)

EduVerse의 핵심 학습 페이지에 대한 상세 설계 문서입니다.

#### 📄 관련 문서

| 문서 | 내용 | 링크 |
|------|------|------|
| **종합 가이드** | 페이지 개요, 구성, 설계 철학 | [05-LearningPage-Summary.md](./05-LearningPage-Summary.md) |
| **와이어프레임** | 상세 레이아웃, 컴포넌트, UI 요소 | [03-LearningPage-Wireframe.md](./03-LearningPage-Wireframe.md) |
| **상호작용 & 플로우** | 사용자 시나리오, 상태 관리, API | [04-LearningPage-Interactions.md](./04-LearningPage-Interactions.md) |
| **HTML 프로토타입** | 상호작용 가능한 프로토타입 | [../../04-design/LearningPage-Prototype.html](../../04-design/LearningPage-Prototype.html) |

---

## 🎯 빠른 시작

### 1단계: 종합 가이드 읽기
먼저 **05-LearningPage-Summary.md**를 읽어서 전체 개요를 파악하세요.
- 페이지 구성 (5개 섹션)
- 설계 철학
- 기술 스택

### 2단계: 와이어프레임 상세 검토
**03-LearningPage-Wireframe.md**에서 각 섹션의 상세 레이아웃을 확인하세요.
- 헤더 영역
- 좌측 사이드바 (커리큘럼)
- 메인 콘텐츠 (학습 콘텐츠, 에디터, 실행/테스트)
- 피드백 및 네비게이션

### 3단계: 상호작용 플로우 이해
**04-LearningPage-Interactions.md**에서 사용자 인터랙션을 학습하세요.
- 전체 학습 프로세스 플로우
- 주요 시나리오 (코드 작성, 난이도 변경, 힌트 사용 등)
- 상태 관리 및 API

### 4단계: HTML 프로토타입 체험
**LearningPage-Prototype.html**을 브라우저에서 열어서 실제 동작을 확인하세요.

```bash
# Windows
start docs/04-design/LearningPage-Prototype.html

# Mac
open docs/04-design/LearningPage-Prototype.html

# Linux
xdg-open docs/04-design/LearningPage-Prototype.html
```

---

## 📋 문서 구조

### 05-LearningPage-Summary.md (이해 우선순위: ⭐⭐⭐⭐⭐)
**전체 페이지의 종합 가이드**
- 📌 프로젝트 개요 및 목표
- 🎯 5개 섹션 상세 설명
- 🔄 사용자 인터랙션 플로우
- 🎨 디자인 시스템 (색상, 타이포그래피)
- 📱 반응형 디자인 (데스크톱/태블릿/모바일)
- 🔧 기술 스택
- 🎯 구현 순서 및 일정
- 📈 성능 지표 및 분석

**핵심 내용:**
```
페이지 구성
├─ 헤더 (고정)
├─ 사이드바 (커리큘럼 로드맵)
├─ 메인 콘텐츠
│  ├─ 학습 콘텐츠
│  ├─ 코드 에디터
│  ├─ 실행 & 테스트
│  └─ 피드백 & 네비게이션
└─ 반응형 레이아웃
```

---

### 03-LearningPage-Wireframe.md (이해 우선순위: ⭐⭐⭐⭐)
**상세한 UI/UX 와이어프레임**
- 📐 전체 페이지 레이아웃 구조
- 1️⃣ 헤더 영역 (고정, 64px)
- 2️⃣ 좌측 사이드바 (280px, 스크롤 가능)
- 3️⃣ 메인 콘텐츠
  - 3-1. 학습 콘텐츠 섹션
  - 3-2. 코드 에디터 섹션
  - 3-3. 실행 및 테스트 섹션
  - 3-4. 하단 네비게이션 및 피드백
- 🎨 시각적 설계 가이드
- 📱 반응형 디자인 (3가지 브레이크포인트)

**ASCII 다이어그램으로 각 섹션 시각화:**
```
┌──────────────────────────────────────┐
│            헤더 (고정)                 │
├────────────┬──────────────────────────┤
│  사이드바  │       메인 콘텐츠        │
│            │  ┌──────────────────────┐│
│ 커리큘럼   │  │  학습 콘텐츠         ││
│ 로드맵     │  │  코드 에디터         ││
│            │  │  실행/테스트         ││
│ 진행 통계  │  │  피드백 및 네비      ││
│            │  └──────────────────────┘│
└────────────┴──────────────────────────┘
```

---

### 04-LearningPage-Interactions.md (이해 우선순위: ⭐⭐⭐)
**인터랙션 플로우 및 기술 스펙**
- 🔄 사용자 플로우 다이어그램
- 🔌 컴포넌트 계층 구조 (React 컴포넌트 트리)
- 📊 상태 관리 다이어그램 (Zustand)
- 🎬 주요 인터랙션 시나리오 (5가지)
  1. 코드 작성 및 테스트
  2. 난이도 변경
  3. 힌트 사용
  4. 교수자에게 질문
  5. 차시 전환
- ⏱️ 자동 저장 메커니즘
- 🎨 상태별 UI 표현 (로딩/에러/성공)
- 🔐 권한 및 보안
- 📈 분석 및 메트릭
- 🌐 API 엔드포인트

**주요 시나리오 다이어그램:**
```
1. 코드 작성 및 테스트
   사용자 입력 → 자동 저장 → 실행/테스트 → 결과 표시 → 진행도 계산

2. 난이도 변경
   난이도 선택 → 시작 코드 로드 → 테스트 케이스 업데이트 → 진행도 초기화

3. 힌트 사용
   진행도 40% 이상 → 힌트 버튼 활성화 → 클릭 시 힌트 표시 → 한 번만 사용

4. 교수자에게 질문
   질문 모달 → 질문 작성 → 제출 → WebSocket 실시간 답변 수신

5. 차시 전환
   테스트 통과 → 현재 차시 완료 처리 → 다음 차시 로드 → 사이드바 업데이트
```

---

### LearningPage-Prototype.html (이해 우선순위: ⭐⭐⭐⭐)
**상호작용 가능한 HTML/CSS/JavaScript 프로토타입**

**기능:**
- ✅ 라이트/다크 모드 토글
- ✅ 탭 전환 (콘솔 / 테스트 결과)
- ✅ 난이도 버튼 선택
- ✅ 반응형 레이아웃 (모바일 시뮬레이션 가능)
- ✅ 코드 에디터 시뮬레이션
- ✅ 테스트 결과 표시

**사용 방법:**
1. 파일을 브라우저에서 열기
2. 우측 상단 테마 토글 버튼으로 다크모드 전환
3. 콘솔/테스트 결과 탭 전환
4. 난이도 버튼 클릭하여 상태 변경
5. 개발자 도구(F12)에서 반응형 테스트

---

## 🔗 참고: LogiCore Tech 분석

이 설계는 LogiCore Tech의 다음 특징들을 참고했습니다:

| 특징 | 설명 | EduVerse 적용 |
|------|------|--------------|
| 개인화된 학습 경로 | 선택한 난이도에 따른 콘텐츠 변동 | 난이도 선택 (기초/중급/심화) |
| 단계별 학습 | 기초(변수) → 심화(동적계획법) | 12주 커리큘럼 |
| 피드백 루프 | 실시간 코드 실행 및 테스트 결과 | 콘솔 + 테스트 탭 |
| 상호작용 | 교수자에게 직접 질문 | 질문 모달 (WebSocket) |
| 낮은 진입장벽 | 신입 개발자 친화적 | 기초 난이도, 상세한 설명 |

---

## 🛠️ 개발 가이드

### 라우트 경로
```
/student/courses/:courseId/learning
/student/courses/:courseId/learning/:lessonId
```

### 필수 컴포넌트
```
LearningPage/
├── Header.tsx
├── Sidebar/
│   └── CurriculumRoadmap.tsx
├── MainContent/
│   ├── LearningContent.tsx
│   ├── CodeEditor.tsx (Monaco 통합)
│   ├── ExecutionPanel.tsx
│   │   ├── ConsoleTab.tsx
│   │   └── TestResultsTab.tsx
│   ├── Feedback.tsx
│   └── Navigation.tsx
└── hooks/
    ├── useLearningState.ts
    ├── useCodeExecution.ts
    └── useAutoSave.ts
```

### 상태 관리 (Zustand)
```typescript
interface LearningStore {
  // 상태
  currentCourseId: string
  currentLessonId: string
  code: string
  selectedDifficulty: 'basic' | 'intermediate' | 'advanced'
  testResults: TestResult[]
  progress: number
  hintUsed: boolean

  // 액션
  updateCode(code: string): void
  executeCode(): Promise<void>
  runTests(): Promise<void>
  setDifficulty(level: string): void
  completeLesson(): Promise<void>
}
```

### API 엔드포인트
```
GET  /api/courses/:courseId/lessons/:lessonId
GET  /api/lessons/:lessonId/code?difficulty=basic
GET  /api/lessons/:lessonId/tests?difficulty=basic
POST /api/execute
POST /api/run-tests
POST /api/lessons/:lessonId/autosave
POST /api/lessons/:lessonId/complete
POST /api/questions
```

---

## 📊 구현 타임라인

| Phase | 내용 | 기간 | 담당 |
|-------|------|------|------|
| 1 | 기본 레이아웃 | 1주일 | 프론트엔드 |
| 2 | 에디터 & 콘텐츠 | 2주일 | 프론트엔드 |
| 3 | 코드 실행 & 테스트 | 2주일 | 풀스택 |
| 4 | 피드백 & 상호작용 | 1주일 | 프론트엔드 |
| 5 | 최적화 & 테스트 | 1주일 | 전체 |
| **총** | | **7주일** | |

---

## ✅ 체크리스트

### 설계 검토
- [ ] 팀 리뷰 및 피드백 수렴
- [ ] UX 검증
- [ ] 기술 타당성 확인

### 프로토타입 검증
- [ ] HTML 프로토타입 데모
- [ ] 사용자 인터뷰 (5명)
- [ ] 교수자 피드백

### 개발 준비
- [ ] API 스펙 확정
- [ ] 데이터베이스 스키마 설계
- [ ] 개발 환경 구성

### 구현 및 테스트
- [ ] Phase별 구현
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트

### 배포 전
- [ ] 성능 최적화
- [ ] 보안 검토
- [ ] 접근성 검증

---

## 🎓 설계 원칙

### "신입 개발자도 심화 학습자도 함께할 수 있는 학습 플랫폼"

1. **명확성**: 학습 목표와 콘텐츠가 명확하게 구조화됨
2. **접근성**: 난이도 선택으로 누구나 시작 가능
3. **즉각성**: 코드 실행과 피드백이 즉시 제공됨
4. **상호작용**: 교수자와의 질문 채널 통합
5. **추적성**: 진행도와 통계로 학습 현황 파악

---

## 📚 참고 자료

### 벤치마킹 플랫폼
- **Codecademy**: 인터랙티브 코드 학습
- **LeetCode**: 코드 작성 및 채점
- **Coursera**: 단계별 학습 구조
- **Khan Academy**: 개념 설명 및 실습

### 기술 레퍼런스
- [Monaco Editor 문서](https://microsoft.github.io/monaco-editor/)
- [Piston API](https://github.com/engineer-man/piston)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 문의 및 피드백

- 설계에 대한 질문: Issues 생성
- 프로토타입 피드백: Pull Request
- 기술 스펙 협의: 개발팀과 논의

---

**Last Updated**: 2025.10.29
**Version**: 1.0
**Status**: 설계 완료, 개발 준비 단계
