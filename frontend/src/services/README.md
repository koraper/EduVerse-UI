# Services

API 통신 및 비즈니스 로직을 관리하는 디렉토리입니다.

## 디렉토리 구조

```
services/
├── api/             # API 클라이언트 설정
├── auth/            # 인증 서비스
├── class/           # 수업 관리 서비스
├── student/         # 학생 관련 서비스
└── professor/       # 교수자 관련 서비스
```

## 네이밍 규칙

- 서비스 파일: camelCase + Service 접미사 (예: `authService.ts`, `classService.ts`)

## 예시

```typescript
// services/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// services/auth/authService.ts
import { apiClient } from '@services/api/client'

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: RegisterData) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}
```
