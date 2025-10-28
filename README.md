# EduVerse

> 코딩 교육을 위한 통합 학습 관리 시스템 (LMS)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hyperwise98/EduVerse)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen.svg)](https://github.com/hyperwise98/EduVerse)

## 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [개발 현황](#개발-현황)
- [문서](#문서)
- [라이선스](#라이선스)

## 개요

EduVerse는 코딩 교육에 특화된 학습 관리 시스템(LMS)입니다. 학생, 교수, 관리자를 위한 통합 플랫폼을 제공하며, 커리큘럼 관리, 수업 진행, 과제 제출, 성적 관리 등 교육 전반을 지원합니다.

### 핵심 가치

- **효율적인 학습 관리**: 체계적인 커리큘럼과 수업 관리
- **실시간 피드백**: 즉각적인 학습 진행 상황 확인
- **데이터 기반 분석**: 학습 데이터를 활용한 인사이트 제공
- **사용자 친화적**: 직관적인 UI/UX로 쉬운 접근성

## 주요 기능

### 학생 기능
- 수업 등록 및 관리
- 과제 제출 및 확인
- 학습 진도 추적
- 성적 조회
- 질문 및 토론 게시판

### 교수 기능
- 수업 생성 및 관리
- 커리큘럼 설계
- 과제 출제 및 채점
- 학생 성적 관리
- 학습 분석 대시보드

### 관리자 기능 ⭐
- **사용자 관리** (100% 완료)
  - 사용자 생성/수정/삭제
  - 역할 및 권한 관리
  - 상태 변경 및 이력 추적
  - CSV/XLSX 데이터 내보내기

- **수업 관리** (100% 완료)
  - 수업 CRUD 전체 구현
  - 고급 필터링 (날짜 범위, 학점 범위)
  - 대량 작업 (일괄 상태변경, 일괄 삭제)
  - CSV/XLSX 내보내기

- **커리큘럼 관리** (95% 완료)
  - 커리큘럼 생성/수정/삭제
  - 주차별 커리큘럼 관리
  - 수업 연계 확인
  - CSV/XLSX 내보내기

- **시스템 설정** (100% 완료)
  - 기본 설정 관리
  - 이메일 설정
  - 보안 설정

- **로그 관리** (95% 완료)
  - 관리자 활동 로그
  - 검색 및 필터링
  - CSV/XLSX 내보내기

- **통계 및 분석** (85% 완료)
  - 사용자 통계
  - 수업 통계
  - 학습 분석

**관리자 페이지 전체 완성도**: **93%**

## 기술 스택

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.1
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Tailwind CSS 3.4.17
- **HTTP Client**: Fetch API
- **Mock API**: MSW (Mock Service Worker) 2.6.8
- **Code Quality**: ESLint, TypeScript

### Backend (계획 중)
- Node.js + Express
- PostgreSQL
- JWT Authentication
- RESTful API

### Development Tools
- Git & GitHub
- VSCode
- Claude Code AI Assistant

## 프로젝트 구조

```
EduVerse/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── common/      # 공통 컴포넌트 (Button, Card, Badge 등)
│   │   │   └── layout/      # 레이아웃 컴포넌트
│   │   ├── contexts/        # React Context (Auth, Toast)
│   │   ├── hooks/           # Custom Hooks
│   │   ├── mocks/           # MSW Mock 핸들러
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── admin/       # 관리자 페이지
│   │   │   ├── auth/        # 인증 페이지
│   │   │   └── ...
│   │   ├── services/        # API 서비스
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 유틸리티 함수
│   ├── public/              # 정적 파일
│   └── package.json
├── backend/                  # 백엔드 (예정)
├── docs/                     # 프로젝트 문서
│   ├── 00-summary/          # 프로젝트 요약 및 현황
│   ├── 01-requirements/     # 요구사항 명세
│   ├── 02-api/              # API 명세
│   ├── 03-database/         # 데이터베이스 설계
│   └── 04-design/           # UI/UX 디자인
└── README.md

```

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/hyperwise98/EduVerse.git
cd EduVerse
```

2. Frontend 의존성 설치
```bash
cd frontend
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 접속
```
http://localhost:5173
```

### 빌드

프로덕션 빌드 생성:
```bash
npm run build
```

### 테스트 계정

개발 환경에서 사용 가능한 테스트 계정:

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@eduverse.com | admin123 |
| 교수 | professor@eduverse.com | prof123 |
| 학생 | student@eduverse.com | student123 |

## 개발 현황

### 최근 업데이트 (v6.0 - 2025-10-19)

**Priority 4 고급 기능 완료**

1. **고급 필터링** (+130 lines)
   - 날짜 범위 필터 (생성일 기준)
   - 학점 범위 필터 (최소~최대)
   - 필터 조합 기능 (AND 조건)
   - 활성 필터 배지 표시
   - 필터 초기화 기능

2. **대량 작업** (+173 lines)
   - 체크박스 전체/개별 선택
   - 일괄 상태 변경 (active/draft/archived)
   - 일괄 삭제 (확인 모달 포함)

3. **데이터 내보내기** (+138 lines)
   - CSV/XLSX 내보내기 (수업/커리큘럼)
   - 타임스탬프 자동 포함
   - 한글 컬럼명 지원

### 완성도

```
전체 구현율: 93%
├─ 관리자 대시보드:       75% ⭐
├─ 사용자 관리:          100% ⭐⭐⭐
├─ 수업 관리:           100% ⭐⭐⭐
├─ 커리큘럼 관리:         95% ⭐⭐⭐
├─ 시스템 설정:         100% ⭐⭐⭐
├─ 로그 관리:            95% ⭐⭐
└─ 통계 및 분석:          85% ⭐⭐
```

### 구현된 기능

- ✅ 사용자 인증 및 권한 관리
- ✅ 관리자 페이지 (7개 페이지, 93% 완료)
- ✅ 학생 대시보드
- ✅ 교수 대시보드
- ✅ 수업 관리 시스템
- ✅ 커리큘럼 관리
- ✅ 데이터 내보내기 (CSV/XLSX)
- ✅ 고급 필터링
- ✅ 대량 작업
- ✅ 로그 시스템
- ✅ Toast 알림
- ✅ 반응형 디자인

### 진행 중

- ⏳ 백엔드 API 개발
- ⏳ 데이터베이스 설계 및 구현
- ⏳ 실시간 알림 (WebSocket)
- ⏳ 과제 제출 시스템 고도화

### 계획 중 (MVP v2)

- 📋 학생 추가/제거 기능
- 📋 커리큘럼 버전 관리
- 📋 검색 자동완성
- 📋 실시간 협업 기능

## 문서

자세한 문서는 [`docs/`](./docs/) 디렉토리를 참조하세요:

- [프로젝트 요약](./docs/00-summary/)
  - [관리자 페이지 구현 상태](./docs/00-summary/admin-implementation-status.md)
  - [Phase 3 로드맵](./docs/00-summary/PHASE_3_ROADMAP.md)
  - [세션 요약](./docs/00-summary/SESSION_SUMMARY_2025_10_19.md)

- [요구사항 명세](./docs/01-requirements/)
- [API 명세](./docs/02-api/)
- [데이터베이스 설계](./docs/03-database/)
- [UI/UX 디자인](./docs/04-design/)

## 기여하기

기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

프로젝트 관리자: [@hyperwise98](https://github.com/hyperwise98)

프로젝트 링크: [https://github.com/hyperwise98/EduVerse](https://github.com/hyperwise98/EduVerse)

---

**Made with ❤️ by the EduVerse Team**

**Powered by Claude Code AI Assistant**
