# Store

전역 상태 관리를 위한 디렉토리입니다.

## 상태 관리 전략

EduVerse는 Context API를 사용하여 전역 상태를 관리합니다.

## 디렉토리 구조

```
store/
├── AuthContext.tsx      # 인증 상태
├── ClassContext.tsx     # 수업 상태
└── MonitoringContext.tsx # 모니터링 상태
```

## 예시

```typescript
// store/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '@types/user'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```
