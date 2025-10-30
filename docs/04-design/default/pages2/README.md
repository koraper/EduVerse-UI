# EduVerse 목업 페이지 (pages2)

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 목업 페이지 모음 |
| 버전 | 2.1 |
| 작성일 | 2025-10-17 |
| 최종 수정일 | 2025-10-19 |
| 작성자 | Design Team |
| 목적 | EduVerse 전체 페이지 HTML 프로토타입 제공 |
| 기반 문서 | PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 |

---

## 📄 전체 페이지 목록 (25개)

### 🌐 공통 페이지 (Public) - 5개

| 번호 | 파일명 | 페이지명 | 설명 | 상태 |
|------|--------|----------|------|------|
| 1 | `index.html` | 랜딩 페이지 | 제품 소개, 핵심 기능, 회원가입 유도 | ✅ 완료 |
| 2 | `signup.html` | 회원가입 | 역할 선택 (학생/교수자), 이메일/비밀번호 입력 | ✅ 완료 |
| 3 | `verify-email.html` | 이메일 인증 | 숫자 6자리 인증번호 입력, 재전송 (30초 쿨다운) | ✅ 완료 |
| 4 | `login.html` | 로그인 | 이메일/비밀번호 로그인, 로그인 상태 유지 옵션 | ✅ 완료 |
| 5 | `reset-password.html` | 비밀번호 찾기 | 이메일 인증 기반 비밀번호 재설정 | ✅ 완료 |

### 🎓 학생 페이지 (Student) - 6개

| 번호 | 파일명 | 페이지명 | 설명 | 상태 |
|------|--------|----------|------|------|
| 6 | `student-dashboard.html` | 학생 대시보드 | 참여 중인 수업 목록, 진도율, 최근 활동 | ✅ 완료 |
| 7 | `join-class.html` | 수업 참여 | 6자리 초대 코드 입력 또는 QR 코드 스캔 | ✅ 완료 |
| 8 | `student-learning.html` | 학습 화면 | 시나리오, Monaco Editor, 코드 실행, 테스트 | ✅ 완료 |
| 9 | `student-journal.html` | 업무일지 | 주차별 자기평가 및 회고 작성 | ✅ 완료 |
| 10 | `student-progress.html` | 성과 대시보드 | 개인 학습 통계, 진도율, 성장 그래프 | ✅ 완료 |
| 11 | `student-qna.html` | Q&A | 질문 작성, 답변 확인, 알림 | ✅ 완료 |

### 👨‍🏫 교수자 페이지 (Professor) - 9개

| 번호 | 파일명 | 페이지명 | 설명 | 상태 |
|------|--------|----------|------|------|
| 12 | `professor-dashboard.html` | 교수자 대시보드 | 생성한 수업 목록, 통계, 빠른 액션 | ✅ 완료 |
| 13 | `create-class.html` | 수업 생성 | 커리큘럼 선택 (4개), 수업 정보 입력 | ✅ 완료 |
| 14 | `class-detail.html` | 수업 상세 | 수업 정보, 입장 코드/QR, 주차 목록 | ✅ 완료 |
| 15 | `week-management.html` | 주차별 수업 관리 | 주차별 시작/종료, 상태 표시, 경과 시간 | ✅ 완료 |
| 16 | `professor-monitoring.html` | 실시간 모니터링 | 학생별 진도, 활동 상태, 실시간 업데이트 | ✅ 완료 |
| 17 | `code-peek.html` | Code Peek | 특정 학생 코드 실시간 조회 (읽기 전용) | ✅ 완료 |
| 18 | `analytics-report.html` | 학습 분석 리포트 | 주차별 성공률, 어려운 과제 Top 5 | ✅ 완료 |
| 19 | `professor-qna.html` | Q&A 관리 | 질문 목록, 답변 작성, 긴급도 순 정렬 | ✅ 완료 |
| 20 | `student-management.html` | 학생 관리 | 학생 목록, 상세 정보, 제거 | ✅ 완료 |

### 🔧 관리자 페이지 (Admin) - 5개

| 번호 | 파일명 | 페이지명 | 설명 | 상태 |
|------|--------|----------|------|------|
| 21 | `admin-dashboard.html` | 관리자 대시보드 | 시스템 전체 통계, 사용자/수업 현황 | ✅ 완료 |
| 22 | `user-management.html` | 사용자 관리 | 전체 사용자 조회, 검색, 상태 변경 | ✅ 완료 |
| 23 | `admin-class-management.html` | 수업 관리 | 전체 수업 조회, 강제 종료 | ✅ 완료 |
| 24 | `system-monitoring.html` | 시스템 모니터링 | 서버 상태, 에러 로그, 성능 지표 | ✅ 완료 |
| 25 | `admin-activity-log.html` | 관리 로그 조회 | 관리자 활동 로그, 필터링, 검색, 내보내기 | ✅ 완료 |

---

## 🎨 디자인 시스템

### 색상 팔레트 (Tailwind CSS)
- **Primary**: `indigo-600` (메인 브랜드 컬러)
- **Secondary**: `green-600` (교수자 액션)
- **Success**: `green-500`
- **Warning**: `yellow-500`
- **Error**: `red-600`
- **Gray Scale**: `gray-50` ~ `gray-900`

### 타이포그래피
- **Heading 1**: `text-5xl font-bold` (랜딩 페이지)
- **Heading 2**: `text-3xl font-bold`
- **Heading 3**: `text-2xl font-bold`
- **Heading 4**: `text-xl font-bold`
- **Body**: `text-base`
- **Small**: `text-sm`

### 버튼
- **Primary Button**: `bg-indigo-600 text-white hover:bg-indigo-700`
- **Secondary Button**: `bg-green-600 text-white hover:bg-green-700`
- **Outline Button**: `border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50`

### 폼 컴포넌트
- **Input**: `border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500`
- **Label**: `block text-sm font-medium text-gray-700`

### 레이아웃
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Card**: `bg-white p-6 rounded-lg shadow`

---

## 🚀 사용 방법

### 로컬에서 실행
1. 파일 탐색기에서 해당 HTML 파일을 더블클릭
2. 또는 브라우저에서 `file:///path/to/file.html` 열기

### 라이브 서버 (권장)
```bash
# Python 간단 서버
cd docs/04-design/pages2
python -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

---

## 📊 개발 진행 상황

| 구분 | 완료 | 전체 | 진행률 |
|------|------|------|--------|
| 공통 페이지 | 5 | 5 | 100% ✅ |
| 학생 페이지 | 6 | 6 | 100% ✅ |
| 교수자 페이지 | 9 | 9 | 100% ✅ |
| 관리자 페이지 | 4 | 4 | 100% ✅ |
| **전체** | **24** | **24** | **100% 🎉** |

---

## 🔗 관련 문서

- [제품 요구사항 문서 (PRD)](../../01-product/01-eduverse-product-requirements.md)
- [역할별 기능 리스트](../../01-product/02-eduverse-role-based-feature-list.md)
- [시스템 아키텍처](../../02-architecture/01-system-architecture.md)
- [디자인 시스템](../01-eduverse-design-system.md)

---

## 📝 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-10-17 | 초기 버전 생성, 공통 페이지 5개 완료 | Design Team |
| 2.0 | 2025-10-17 | 전체 24개 페이지 완성 (학생 6 + 교수자 9 + 관리자 4) | Design Team |

---

*이 목업 페이지들은 프로토타입이며, 실제 개발 과정에서 디자인과 기능이 변경될 수 있습니다.*
