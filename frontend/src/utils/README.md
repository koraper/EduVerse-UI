# Utils

유틸리티 함수들을 관리하는 디렉토리입니다.

## 네이밍 규칙

- 유틸 파일: camelCase.ts (예: `formatDate.ts`, `validation.ts`)

## 예시

```typescript
// utils/formatDate.ts
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8 || password.length > 20) {
    errors.push('비밀번호는 8-20자 사이여야 합니다.')
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)

  const complexity = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
  if (complexity < 2) {
    errors.push('영문, 숫자, 특수문자 중 2가지 이상 포함해야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
```
