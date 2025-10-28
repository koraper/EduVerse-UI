# Pages

페이지 컴포넌트들을 관리하는 디렉토리입니다. 각 페이지는 라우팅의 단위가 됩니다.

## 디렉토리 구조

```
pages/
├── landing/         # 랜딩 페이지
├── auth/            # 인증 페이지 (로그인, 회원가입)
├── student/         # 학생 페이지
├── professor/       # 교수자 페이지
└── admin/           # 관리자 페이지
```

## 네이밍 규칙

- 페이지 파일: PascalCase + Page 접미사 (예: `LoginPage.tsx`, `DashboardPage.tsx`)
- 각 페이지는 자체 폴더에 관련 컴포넌트와 함께 구성 가능

## 예시

```typescript
// pages/auth/LoginPage.tsx
import { LoginForm } from '@components/auth/LoginForm'

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
```
