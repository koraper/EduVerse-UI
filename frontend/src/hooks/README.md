# Hooks

커스텀 React Hooks를 관리하는 디렉토리입니다.

## 네이밍 규칙

- Hook 파일: `use` 접두사 + camelCase (예: `useAuth.ts`, `useMonitoring.ts`)

## 예시

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { User } from '@types/user'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 확인 로직
    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    // 로그인 로직
  }

  const logout = async () => {
    // 로그아웃 로직
  }

  return { user, loading, login, logout }
}
```

## 주요 Hooks 목록

- `useAuth` - 인증 상태 관리
- `useMonitoring` - 실시간 모니터링
- `useCodeEditor` - Monaco Editor 관리
- `useWebSocket` - WebSocket 연결 관리
