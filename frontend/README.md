# EduVerse Frontend

EduVerse 교육 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **프레임워크**: React 18+ with TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS 3.x
- **라우팅**: React Router DOM
- **코드 에디터**: Monaco Editor
- **차트**: Chart.js + react-chartjs-2
- **아이콘**: Lucide React
- **HTTP 클라이언트**: Axios

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/      # 재사용 가능한 React 컴포넌트
│   │   ├── common/     # 공통 컴포넌트 (Button, Input, Modal 등)
│   │   ├── auth/       # 인증 관련 컴포넌트
│   │   ├── student/    # 학생 전용 컴포넌트
│   │   ├── professor/  # 교수자 전용 컴포넌트
│   │   ├── admin/      # 관리자 전용 컴포넌트
│   │   └── layout/     # 레이아웃 컴포넌트
│   ├── pages/          # 페이지 컴포넌트 (라우팅 단위)
│   │   ├── landing/    # 랜딩 페이지
│   │   ├── auth/       # 인증 페이지
│   │   ├── student/    # 학생 페이지
│   │   ├── professor/  # 교수자 페이지
│   │   └── admin/      # 관리자 페이지
│   ├── hooks/          # Custom React Hooks
│   ├── services/       # API 통신 및 비즈니스 로직
│   ├── store/          # 전역 상태 관리 (Context API)
│   ├── types/          # TypeScript 타입 정의
│   ├── utils/          # 유틸리티 함수
│   ├── assets/         # 정적 자원 (이미지, 아이콘)
│   └── styles/         # 전역 스타일
├── public/             # 정적 파일
├── tailwind.config.js  # Tailwind CSS 설정
├── vite.config.ts      # Vite 설정
└── tsconfig.json       # TypeScript 설정
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 4. 프로덕션 미리보기

```bash
npm run preview
```

## 📝 코딩 컨벤션

### 네이밍 규칙

- **컴포넌트**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **페이지**: PascalCase + Page 접미사 (`LoginPage.tsx`)
- **Hooks**: `use` 접두사 + camelCase (`useAuth.ts`)
- **서비스**: camelCase + Service 접미사 (`authService.ts`)
- **유틸**: camelCase (`formatDate.ts`)
- **타입/인터페이스**: PascalCase (`User`, `ClassInfo`)

### Import 순서

```typescript
// 1. 외부 라이브러리
import React from 'react'
import { useNavigate } from 'react-router-dom'

// 2. 내부 모듈 (경로 별칭 사용)
import { Button } from '@components/common/Button'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth/authService'
import { User } from '@types/user'

// 3. 스타일
import './styles.css'
```

### 경로 별칭

TypeScript와 Vite 설정에 경로 별칭이 설정되어 있습니다:

```typescript
import { Button } from '@components/common/Button'
import { LoginPage } from '@pages/auth/LoginPage'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth/authService'
import { User } from '@types/user'
```

## 🎨 스타일링

### Tailwind CSS

프로젝트는 Tailwind CSS 3.x를 사용합니다. 커스텀 색상과 테마는 `tailwind.config.js`에 정의되어 있습니다.

```typescript
// 예시
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
  클릭
</button>
```

### 디자인 시스템

디자인 시스템 문서는 `/docs/04-design/01-eduverse-design-system.md`를 참고하세요.

## 🔌 API 연동

API 요청은 `services/` 디렉토리에서 관리됩니다.

```typescript
// services/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
})
```

개발 환경에서는 Vite의 프록시 설정을 통해 백엔드 서버(`http://localhost:5000`)로 요청이 전달됩니다.

## 🧪 테스트

(추후 추가 예정)

## 📚 관련 문서

- [PRD v2.6](../docs/01-product/01-eduverse-product-requirements.md)
- [시스템 아키텍처 v1.2](../docs/02-architecture/01-system-architecture.md)
- [디자인 시스템 v1.0](../docs/04-design/01-eduverse-design-system.md)
- [개발자 가이드](../docs/00-summary/00-developer-guide.md)

## 📄 라이선스

(추후 추가 예정)
