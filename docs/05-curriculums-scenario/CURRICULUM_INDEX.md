# EduVerse 커리큘럼 목록

## 📚 개요

EduVerse 플랫폼에서 제공하는 모든 커리큘럼은 **표준 구조 가이드** ([scenario-structure-guide.md](scenario-structure-guide.md))를 따릅니다.

각 커리큘럼은 다음과 같은 구조를 가집니다:
- **3단계 계층**: Course → Week → Cycle
- **3-멘토 시스템**: Alex(팀장) → Sena(선임) → Prof. Kim(교수)
- **학습 흐름**: Task → Briefing → Lecture → 코딩 → 테스트 → 피드백

---

## 🎓 등록된 커리큘럼

### 1️⃣ Python 기초 프로그래밍 (4주 과정)

**파일**: `original-scenario.json`

**학습 목표**:
- Python 개발 환경 설정
- 기본 문법 습득
- 객체 지향 프로그래밍 기초

**커리큘럼 구성**:
- **1주**: 신입사원 온보딩 및 개발 환경 구축
  - Python 설치 및 버전 확인
  - VS Code 설정
- **2주**: Python 기본 문법
  - 변수와 데이터 타입
  - 연산자와 표현식
- **3주**: 제어문과 반복문
  - if/else 조건문
  - for/while 반복문
- **4주**: 함수와 모듈
  - 함수 정의와 호출
  - 내장 모듈 활용

**기술 스택**: Python 3.10+

---

### 2️⃣ JavaScript 기초 프로그래밍 (4주 과정)

**파일**: `javascript-scenario.json`

**학습 목표**:
- Node.js 개발 환경 설정
- JavaScript 기본 문법 습득
- 함수형 프로그래밍 기초

**커리큘럼 구성**:
- **1주**: Node.js 개발 환경 구축
  - Node.js 및 npm 설치
  - npm을 이용한 프로젝트 초기화 (package.json)
- **2주**: JavaScript 기본 문법
  - 변수 선언 (const, let, var)
  - 기본 데이터 타입 (String, Number, Boolean)
- **3주**: 제어문과 조건부 실행
  - if/else 조건문
  - 점수 판정 프로그램 예제
- **4주**: 함수와 배열
  - 함수 정의와 호출
  - 화살표 함수 (Arrow Function)

**기술 스택**: Node.js 14+, npm

---

### 3️⃣ HTML/CSS 웹 기초 (2주 과정)

**파일**: `html-css-scenario.json`

**학습 목표**:
- HTML 구조 이해
- CSS로 웹 페이지 스타일링
- 웹 표준 준수

**커리큘럼 구성**:
- **1주**: HTML 기초
  - 첫 HTML 페이지 작성
  - 기본 HTML 태그 (h1, p, div, etc.)
  - 페이지 구조 이해
- **2주**: CSS 스타일링
  - CSS 선택자 (요소, 클래스, ID)
  - 기본 스타일 속성 (color, font-size, margin, padding)
  - 배경색과 텍스트 스타일

**기술 스택**: HTML5, CSS3, VS Code + Live Server

---

## 📋 커리큘럼 구조 상세 설명

### 각 Cycle의 구성 요소

#### 1. **Task (팀장 Alex)**
- 실무 중심의 과제 제시
- "무엇을(What)" 해야 하는지 명확한 목표 제시
- 실제 회사 업무와 유사한 상황 설정

#### 2. **Briefing (선임 Sena)**
- 실무 팁과 best practices 공유
- "어떻게(How)" 효율적으로 해결하는지 제시
- 초보자가 놓치기 쉬운 부분 강조

#### 3. **Lecture (교수 Prof. Kim)**
- 이론적 배경과 원리 설명
- "왜(Why)" 그렇게 동작하는지 깊이 있게 설명
- 추가 학습 자료와 심화 개념 제시

#### 4. **실습 코드**
- `starterCode`: 학생에게 제공되는 초기 템플릿
- `testCode`: 자동 검증 테스트 로직
- `expectedPrintOutput`: 예상 출력값

#### 5. **Feedback**
- **성공(Success)**: 학습자를 격려하고 다음 단계 안내
- **실패(Failure_logical)**: 논리 오류 분석 및 해결 팁
- **실패(Failure_runtime)**: 런타임 에러 처리 방법

---

## 🔄 학습 흐름도

```
[과제 확인]
    ↓
  Alex의 Task 제시
    ↓
[힌트 습득]
    ↓
  Sena의 Briefing 제공
    ↓
[이론 학습]
    ↓
  Prof. Kim의 Lecture 수강
    ↓
[코드 작성]
    ↓
  Starter Code 기반 구현
    ↓
[실행 & 테스트]
    ↓
  Test Code 자동 실행
    ↓
  ╔════════════════╗
  ║ 성공? ← 테스트 ║
  ╚════════════════╝
    ↙       ↖
   ✅        ❌
  성공     실패 피드백
    ↓         ↓
  다음    오류 수정
  사이클   후 재시도
```

---

## 📝 JSON 파일 구조

### 최상위 구조
```json
{
  "courseTitle": "커리큘럼 제목",
  "language": "사용 언어",
  "languageVersion": "버전",
  "installationGuide": {
    "windows": "Windows 설치 가이드",
    "macos": "macOS 설치 가이드",
    "linux": "Linux 설치 가이드"
  },
  "weeks": [
    // 주차별 데이터
  ]
}
```

### Week 구조
```json
{
  "week": 1,
  "title": "주차 제목",
  "cycles": [
    // 학습 사이클
  ]
}
```

### Cycle 구조
```json
{
  "title": "학습 소주제",
  "syntax_key": "분류키",
  "filename": "파일명",
  "starterCode": "초기 코드",
  "testCode": "테스트 로직",
  "expectedPrintOutput": "예상 출력",
  "task": { "character": "alex", ... },
  "briefing": { "character": "sena", ... },
  "lecture": { "character": "profKim", ... },
  "feedback": { "success": {...}, "failure_logical": {...}, ... }
}
```

---

## 🚀 향후 계획

### Phase 2 (현재)
- ✅ Python 커리큘럼
- ✅ JavaScript 커리큘럼
- ✅ HTML/CSS 커리큘럼
- 🔄 웹 개발 심화 (React, Express) - 작업 중

### Phase 3
- 📌 Java 프로그래밍
- 📌 C# / .NET
- 📌 알고리즘과 자료구조

### Phase 4
- 📌 클라우드 및 DevOps
- 📌 AI/ML 기초
- 📌 모바일 앱 개발

---

## 📖 참고 자료

- [표준 구조 가이드](scenario-structure-guide.md)
- [구조 분석](original-structure-analysis.md)
- Python 커리큘럼: [original-scenario.json](original-scenario.json)
- JavaScript 커리큘럼: [javascript-scenario.json](javascript-scenario.json)
- HTML/CSS 커리큘럼: [html-css-scenario.json](html-css-scenario.json)

---

## 🔐 커리큘럼 관리 정책

### 권한 및 제약사항

EduVerse 플랫폼에서는 커리큘럼을 체계적으로 관리하기 위해 다음과 같은 정책을 적용합니다:

#### 1. 생성 권한
- **관리자만** 커리큘럼을 등록할 수 있습니다
- 교수자와 학생은 커리큘럼을 생성할 수 없으며, 조회 및 활용만 가능합니다

#### 2. 삭제 제약
- **연결된 수업이 있는 커리큘럼은 삭제할 수 없습니다**
- 삭제 시도 시 연결된 수업 개수를 표시하고 삭제를 차단합니다
- 삭제하려면:
  1. 관리자 비밀번호 재확인 필수
  2. 커리큘럼명 정확히 재입력 필수
  3. 연결된 수업이 0개여야 함

#### 3. 상태 관리 시스템

커리큘럼은 두 가지 상태를 가집니다:

**활성(Active)**:
- 수업 생성 시 선택 가능
- 현재 사용 중인 커리큘럼
- 교수자가 새 수업을 만들 때 목록에 표시됨

**보관(Archived)**:
- 더 이상 사용하지 않는 커리큘럼
- 수업 생성 시 선택 불가 (숨김 처리)
- 기존에 연결된 수업에는 영향 없음
- 필요 시 다시 활성 상태로 전환 가능

#### 4. 상태 전환
- 활성 ↔ 보관 **양방향 전환 가능**
- 일괄 상태 변경 기능 지원
- 상태 변경은 관리자만 수행 가능

#### 5. 삭제 대안
연결된 수업이 있어 삭제할 수 없는 경우:
1. **권장**: 상태를 '보관'으로 변경
2. 새 수업 생성 시 선택 불가 처리
3. 기존 수업은 정상 운영 가능
4. 향후 필요 시 다시 활성화 가능

### 관리 워크플로우

```
[커리큘럼 생성 (관리자)]
    ↓
[활성 상태 → 교수자가 수업 생성 가능]
    ↓
  사용 안 함?
    ↓
[보관 상태로 변경 → 새 수업 생성 불가]
    ↓
  다시 사용?
    ↓
[활성 상태로 복원]
```

---

## 📞 피드백

각 커리큘럼에 대한 피드백이나 개선 사항은 해당 JSON 파일의 feedback 섹션을 참고해주세요.

커리큘럼 관리 정책에 대한 문의사항은 관리자에게 문의하세요.
