# EduVerse 와이어프레임 - 공통화면 (인증)

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 와이어프레임 - 공통 (인증) |
| 버전 | 1.1 |
| 최종 수정일 | 2025-10-19 |
| 상태 | 개발 중 |
| 관련 문서 | PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 |

## 📝 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1 | 2025-10-19 | 버전 통일 업데이트: PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 반영 | Claude AI |
| 1.0 | 2025-10-16 | 초기 버전 작성 | Claude AI |

---

## 📖 목차

1. [개요](#1-개요)
2. [AUTH-01 회원가입 화면](#2-auth-01-회원가입-화면)
3. [AUTH-02 로그인 화면](#3-auth-02-로그인-화면)
4. [반응형 레이아웃](#4-반응형-레이아웃)
5. [폼 검증 및 에러 처리](#5-폼-검증-및-에러-처리)
6. [컴포넌트 명세](#6-컴포넌트-명세)

---

## 1. 개요

### 1.1 목적
- 사용자 인증 및 계정 생성을 위한 직관적이고 안전한 UI 제공
- 학생과 교수자 역할을 명확히 구분하여 회원가입 프로세스 간소화

### 1.2 핵심 원칙
- **간결함**: 필수 정보만 수집 (이메일, 비밀번호, 이름, 역할)
- **명확한 피드백**: 실시간 폼 검증 및 즉각적인 에러 메시지
- **보안**: 비밀번호 강도 표시, 약관 동의 필수

### 1.3 관련 문서
- [기능 명세서 Part 1](../../03-specs/01-overview-and-auth.md)
- [디자인 시스템](../01-eduverse-design-system.md)
- [랜딩페이지 와이어프레임](./01-landing-wireframes.md)

---

## 2. AUTH-01 회원가입 화면

### 2.1 전체 레이아웃 (Desktop 1920px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                       ┌───────────────────────────────┐                      │
│                       │                               │                      │
│                       │     [Logo] EduVerse           │                      │
│                       │                               │                      │
│                       │     ┌─────────────────────┐   │                      │
│                       │     │  회원가입            │   │                      │
│                       │     └─────────────────────┘   │                      │
│                       │                               │                      │
│                       │  ┌────────┐  ┌────────┐      │                      │
│                       │  │ 학생   │  │ 교수자 │      │                      │
│                       │  │ (Active)│  │        │      │                      │
│                       │  └────────┘  └────────┘      │                      │
│                       │                               │                      │
│                       │  이메일 *                     │                      │
│                       │  [_______________________]    │                      │
│                       │                               │                      │
│                       │  이름 *                       │                      │
│                       │  [_______________________]    │                      │
│                       │                               │                      │
│                       │  비밀번호 * (최소 8자, 영문+숫자)│                      │
│                       │  [_______________________] 👁️ │                      │
│                       │  [████████░░░░] 보통          │                      │
│                       │                               │                      │
│                       │  비밀번호 확인 *               │                      │
│                       │  [_______________________] 👁️ │                      │
│                       │  ✅ 비밀번호가 일치합니다      │                      │
│                       │                               │                      │
│                       │  ☑️ 이용약관에 동의합니다 [보기]│                      │
│                       │                               │                      │
│                       │  [    회원가입하기    ]       │                      │
│                       │                               │                      │
│                       │  이미 계정이 있으신가요?       │                      │
│                       │  [로그인]                     │                      │
│                       │                               │                      │
│                       └───────────────────────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 상세 와이어프레임

```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────┐                                                 │
│  │ Logo │  EduVerse                                       │
│  └──────┘                                                 │
│                                                            │
│          회원가입                                          │
│          (font-size: 32px, font-weight: 700)             │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  역할 선택 *                                               │
│                                                            │
│  ┌───────────────────────┐  ┌──────────────────────────┐ │
│  │       📚 학생          │  │      🎓 교수자            │ │
│  │                       │  │                          │ │
│  │  초대코드를 받으셨나요?│  │  수업을 만들고 관리하기   │ │
│  │                       │  │                          │ │
│  │  (bg-indigo-600)      │  │  (bg-gray-800)          │ │
│  │  (border-2 indigo-500)│  │  (border gray-700)      │ │
│  └───────────────────────┘  └──────────────────────────┘ │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  이메일 *                                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │ student@example.com                                  ││
│  └──────────────────────────────────────────────────────┘│
│  (placeholder: "이메일 주소를 입력하세요")                  │
│  (type: email, autocomplete: email)                      │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  이름 *                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 김철수                                               ││
│  └──────────────────────────────────────────────────────┘│
│  (placeholder: "실명을 입력하세요")                        │
│  (autocomplete: name)                                    │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  비밀번호 * (최소 8자, 영문+숫자 포함)                      │
│  ┌──────────────────────────────────────────────────┐ 👁️ │
│  │ ••••••••                                         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  비밀번호 강도:                                            │
│  ████████████░░░░░░░░  강함                              │
│  (bg-green-600)                                          │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  비밀번호 확인 *                                           │
│  ┌──────────────────────────────────────────────────┐ 👁️ │
│  │ ••••••••                                         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ✅ 비밀번호가 일치합니다                                  │
│  (text-green-500)                                        │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ☑️ [이용약관](링크)에 동의합니다 (필수)                    │
│  (checkbox, required)                                    │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐│
│  │               회원가입하기                            ││
│  │  (bg-indigo-600, hover:bg-indigo-700, py-3, full)   ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│           이미 계정이 있으신가요? [로그인]                  │
│           (text-gray-400, link: text-indigo-500)         │
│                                                            │
└───────────────────────────────────────────────────────────┘

**크기**:
- Container: max-w-md (448px)
- Padding: p-8
- Border radius: rounded-xl
- Background: bg-gray-800
- Border: border border-gray-700
```

### 2.3 역할 선택 토글 상세

```
┌─────────────────────────────────────────────────────────────┐
│  역할 선택 *                                                 │
│  (font-size: 14px, text-gray-400, mb-2)                    │
│                                                              │
│  ┌─────────────────────────┐  ┌────────────────────────────┐│
│  │    📚 (icon, 24px)      │  │    🎓 (icon, 24px)         ││
│  │                         │  │                            ││
│  │    학생                  │  │    교수자                   ││
│  │    (font-size: 18px)    │  │    (font-size: 18px)       ││
│  │                         │  │                            ││
│  │  초대코드를 받으셨나요?  │  │  수업을 만들고 관리하기      ││
│  │  (font-size: 12px)      │  │  (font-size: 12px)         ││
│  │  (text-gray-400)        │  │  (text-gray-400)           ││
│  │                         │  │                            ││
│  │  [Active State]         │  │  [Inactive State]          ││
│  │  bg-indigo-600          │  │  bg-gray-800               ││
│  │  border-2 border-indigo │  │  border border-gray-700    ││
│  │  text-white             │  │  text-gray-300             ││
│  │                         │  │                            ││
│  └─────────────────────────┘  └────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘

**상호작용**:
- 클릭 시 Active 상태로 전환
- 애니메이션: transform scale(1.02) + border glow
- 한 번에 하나만 선택 가능 (Radio button 역할)
```

### 2.4 실시간 폼 검증 상태

#### 이메일 필드

**초기 상태**:
```
이메일 *
┌──────────────────────────────────────────┐
│                                          │
└──────────────────────────────────────────┘
(border: border-gray-700)
```

**입력 중 (유효)**:
```
이메일 *
┌──────────────────────────────────────────┐
│ student@example.com                      │
└──────────────────────────────────────────┘
✅ 사용 가능한 이메일입니다
(border: border-green-500, text-green-500)
```

**입력 중 (중복)**:
```
이메일 *
┌──────────────────────────────────────────┐
│ existing@example.com                     │
└──────────────────────────────────────────┘
❌ 이미 사용 중인 이메일입니다
(border: border-red-500, text-red-500)
```

**입력 중 (형식 오류)**:
```
이메일 *
┌──────────────────────────────────────────┐
│ notanemail                               │
└──────────────────────────────────────────┘
❌ 올바른 이메일 형식이 아닙니다
(border: border-red-500, text-red-500)
```

#### 비밀번호 강도 표시

**약함 (< 8자)**:
```
비밀번호 *
┌──────────────────────────────────────────┐
│ ••••••                                   │
└──────────────────────────────────────────┘

비밀번호 강도:
████░░░░░░░░░░░░░░░░  약함
(bg-red-600)
⚠️ 최소 8자 이상 입력하세요
```

**보통 (8자 이상, 영문 or 숫자만)**:
```
비밀번호 *
┌──────────────────────────────────────────┐
│ ••••••••                                 │
└──────────────────────────────────────────┘

비밀번호 강도:
████████████░░░░░░░░  보통
(bg-yellow-600)
💡 영문과 숫자를 함께 사용하면 더 안전합니다
```

**강함 (8자 이상, 영문+숫자)**:
```
비밀번호 *
┌──────────────────────────────────────────┐
│ ••••••••                                 │
└──────────────────────────────────────────┘

비밀번호 강도:
████████████████████  강함
(bg-green-600)
✅ 안전한 비밀번호입니다
```

#### 비밀번호 확인

**일치**:
```
비밀번호 확인 *
┌──────────────────────────────────────────┐
│ ••••••••                                 │
└──────────────────────────────────────────┘
✅ 비밀번호가 일치합니다
(border: border-green-500, text-green-500)
```

**불일치**:
```
비밀번호 확인 *
┌──────────────────────────────────────────┐
│ •••••••                                  │
└──────────────────────────────────────────┘
❌ 비밀번호가 일치하지 않습니다
(border: border-red-500, text-red-500)
```

---

## 3. AUTH-02 로그인 화면

### 3.1 전체 레이아웃 (Desktop)

```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────┐                                                 │
│  │ Logo │  EduVerse                                       │
│  └──────┘                                                 │
│                                                            │
│          로그인                                            │
│          (font-size: 32px, font-weight: 700)             │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  이메일                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │                                                       ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  비밀번호                                                  │
│  ┌──────────────────────────────────────────────────┐ 👁️ │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ☐ 로그인 상태 유지 (30일)                                │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐│
│  │                로그인                                 ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  [비밀번호를 잊으셨나요?]                                   │
│  (text-indigo-500, hover:text-indigo-400)                │
│                                                            │
│  ────────────  또는  ────────────                         │
│                                                            │
│  계정이 없으신가요? [회원가입]                              │
│  (text-gray-400, link: text-indigo-500)                  │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 3.2 로그인 오류 상태

#### 인증 실패
```
┌───────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ❌ 이메일 또는 비밀번호가 올바르지 않습니다           │ │
│  │ (bg-red-900/50, text-red-500, border-red-500)       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  이메일                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ student@example.com                                  ││
│  └──────────────────────────────────────────────────────┘│
│  (border: border-red-500)                                │
│                                                            │
│  비밀번호                                                  │
│  ┌──────────────────────────────────────────────────┐ 👁️ │
│  │ ••••••••                                         │    │
│  └──────────────────────────────────────────────────┘    │
│  (border: border-red-500)                                │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

#### 계정 잠금 (5회 이상 실패)
```
┌───────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🔒 로그인 시도 횟수를 초과했습니다                    │ │
│  │ 15분 후 다시 시도해주세요                            │ │
│  │                                                       │ │
│  │ 남은 시간: 14:35                                     │ │
│  │ (bg-yellow-900/50, text-yellow-500)                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  이메일                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ (disabled, opacity-50)                               ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  비밀번호                                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │ (disabled, opacity-50)                               ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐│
│  │            로그인 (disabled)                          ││
│  │  (opacity-50, cursor-not-allowed)                    ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 3.3 로그인 성공 플로우

```
1. 사용자가 이메일/비밀번호 입력
2. "로그인" 버튼 클릭
   ↓
3. 버튼 상태 변경:
   [로그인] → [⏳ 로그인 중...] (disabled, loading spinner)
   ↓
4. POST /api/auth/login 호출
   ↓
5a. 성공:
   - ✅ 토스트: "로그인되었습니다"
   - 역할별 대시보드로 리다이렉트:
     • Student → /student/dashboard
     • Professor → /professor/dashboard
     • Admin → /admin/dashboard

5b. 실패:
   - ❌ 에러 배너 표시
   - 필드 border-red-500
   - 버튼 다시 활성화
```

---

## 4. 반응형 레이아웃

### 4.1 Desktop (1024px+)

```
┌─────────────────────────────────────────────┐
│  Container: max-w-md (448px)                │
│  Center: mx-auto, mt-20                     │
│  Padding: p-8                               │
│  Background: bg-gray-800                    │
│  Border: rounded-xl                         │
└─────────────────────────────────────────────┘
```

### 4.2 Tablet (768px ~ 1023px)

```
┌──────────────────────────────────────┐
│  Container: max-w-sm (384px)         │
│  Center: mx-auto, mt-16              │
│  Padding: p-6                        │
└──────────────────────────────────────┘
```

### 4.3 Mobile (< 768px)

```
┌───────────────────────────────┐
│  Container: w-full            │
│  Margin: m-4                  │
│  Padding: p-4                 │
│  Font-size: 감소 (제목 24px)  │
│  역할 선택: Stacked (세로)    │
└───────────────────────────────┘
```

---

## 5. 폼 검증 및 에러 처리

### 5.1 클라이언트 사이드 검증

```typescript
// 이메일 검증
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// 비밀번호 강도 계산
const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
};

// 비밀번호 일치 확인
const validatePasswordMatch = (password: string, confirm: string) => {
  return password === confirm && password.length > 0;
};
```

### 5.2 에러 메시지 매핑

| 에러 코드 | 메시지 | 위치 |
|-----------|--------|------|
| 400 | "모든 필수 항목을 입력해주세요" | 상단 배너 |
| 400 | "올바른 이메일 형식이 아닙니다" | 이메일 필드 하단 |
| 400 | "비밀번호는 최소 8자, 영문과 숫자를 포함해야 합니다" | 비밀번호 필드 하단 |
| 400 | "비밀번호가 일치하지 않습니다" | 비밀번호 확인 하단 |
| 409 | "이미 사용 중인 이메일입니다" | 이메일 필드 하단 + "로그인" 링크 |
| 401 | "이메일 또는 비밀번호가 올바르지 않습니다" | 상단 배너 |
| 403 | "로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요" | 상단 배너 + 타이머 |
| 500 | "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요" | 상단 배너 + 재시도 버튼 |

### 5.3 실시간 검증 타이밍

```typescript
// 이메일 검증: blur 이벤트 + 1초 debounce
<input
  type="email"
  onBlur={checkEmailAvailability}
  onChange={debounce(validateEmailFormat, 1000)}
/>

// 비밀번호 강도: 실시간 (onChange)
<input
  type="password"
  onChange={e => setPasswordStrength(calculatePasswordStrength(e.target.value))}
/>

// 비밀번호 확인: 실시간 (onChange)
<input
  type="password"
  onChange={e => setPasswordMatch(e.target.value === password)}
/>
```

---

## 6. 컴포넌트 명세

### 6.1 SignupForm Component

```tsx
// Component: SignupForm.tsx
interface SignupFormProps {
  onSuccess: (user: User) => void;
  onError: (error: Error) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onError }) => {
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordMatch, setPasswordMatch] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, agreeTerms })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const user = await response.json();
      onSuccess(user);

      // Redirect based on role
      if (role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/professor/dashboard');
      }

    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 rounded-xl p-8">
      {/* Role Selection */}
      <RoleSelector value={role} onChange={setRole} />

      {/* Email Field */}
      <InputField
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        error={emailError}
        onBlur={checkEmailAvailability}
        required
      />

      {/* Name Field */}
      <InputField
        label="이름"
        type="text"
        value={name}
        onChange={setName}
        required
      />

      {/* Password Field with Strength Indicator */}
      <PasswordField
        label="비밀번호"
        value={password}
        onChange={(value) => {
          setPassword(value);
          setPasswordStrength(calculatePasswordStrength(value));
        }}
        strength={passwordStrength}
        required
      />

      {/* Password Confirm Field */}
      <PasswordField
        label="비밀번호 확인"
        value={passwordConfirm}
        onChange={(value) => {
          setPasswordConfirm(value);
          setPasswordMatch(value === password);
        }}
        match={passwordMatch}
        required
      />

      {/* Terms Checkbox */}
      <Checkbox
        label={<>
          <a href="/terms" target="_blank" className="text-indigo-500 hover:underline">
            이용약관
          </a>에 동의합니다
        </>}
        checked={agreeTerms}
        onChange={setAgreeTerms}
        required
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!isFormValid() || isSubmitting}
        loading={isSubmitting}
      >
        회원가입하기
      </Button>

      {/* Login Link */}
      <div className="mt-4 text-center text-sm text-gray-400">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-indigo-500 hover:underline">
          로그인
        </Link>
      </div>
    </form>
  );
};
```

### 6.2 PasswordField with Strength Indicator

```tsx
// Component: PasswordField.tsx
interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  strength?: 'weak' | 'medium' | 'strong';
  match?: boolean;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  strength,
  match,
  required
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const strengthConfig = {
    weak: { color: 'bg-red-600', text: '약함', width: 'w-1/3' },
    medium: { color: 'bg-yellow-600', text: '보통', width: 'w-2/3' },
    strong: { color: 'bg-green-600', text: '강함', width: 'w-full' }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                     text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                     pr-12"
          required={required}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {/* Strength Indicator */}
      {strength && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">비밀번호 강도:</span>
            <span className={`text-xs font-medium ${
              strength === 'weak' ? 'text-red-500' :
              strength === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {strengthConfig[strength].text}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthConfig[strength].color} ${strengthConfig[strength].width} transition-all duration-300`}
            />
          </div>
        </div>
      )}

      {/* Match Indicator */}
      {match !== undefined && value.length > 0 && (
        <div className={`mt-2 text-sm ${match ? 'text-green-500' : 'text-red-500'}`}>
          {match ? '✅ 비밀번호가 일치합니다' : '❌ 비밀번호가 일치하지 않습니다'}
        </div>
      )}
    </div>
  );
};
```

### 6.3 RoleSelector Component

```tsx
// Component: RoleSelector.tsx
interface RoleSelectorProps {
  value: 'student' | 'professor';
  onChange: (role: 'student' | 'professor') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  const roles = [
    {
      type: 'student' as const,
      icon: '📚',
      title: '학생',
      description: '초대코드를 받으셨나요?'
    },
    {
      type: 'professor' as const,
      icon: '🎓',
      title: '교수자',
      description: '수업을 만들고 관리하기'
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-3">
        역할 선택 <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <button
            key={role.type}
            type="button"
            onClick={() => onChange(role.type)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${value === role.type
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }
            `}
          >
            <div className="text-3xl mb-2">{role.icon}</div>
            <div className="text-lg font-semibold mb-1">{role.title}</div>
            <div className="text-xs opacity-80">{role.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## 7. 접근성 (a11y)

### 7.1 폼 접근성

```html
<!-- 명확한 레이블 연결 -->
<label for="email-input">이메일 *</label>
<input
  id="email-input"
  type="email"
  aria-describedby="email-hint email-error"
  aria-required="true"
  aria-invalid="false"
/>
<p id="email-hint" className="sr-only">이메일 주소를 입력하세요</p>
<p id="email-error" role="alert" aria-live="polite">
  올바른 이메일 형식이 아닙니다
</p>

<!-- 비밀번호 보기/숨기기 버튼 -->
<button
  type="button"
  aria-label="비밀번호 보기"
  aria-pressed="false"
  onClick={togglePasswordVisibility}
>
  <EyeIcon aria-hidden="true" />
</button>

<!-- 에러 상태 안내 -->
<div role="alert" aria-live="assertive" className="error-banner">
  이메일 또는 비밀번호가 올바르지 않습니다
</div>
```

### 7.2 키보드 네비게이션 순서

```
1. 역할 선택 (학생/교수자) - Tab
2. 이메일 필드 - Tab
3. 이름 필드 - Tab
4. 비밀번호 필드 - Tab
5. 비밀번호 보기 버튼 - Tab
6. 비밀번호 확인 필드 - Tab
7. 비밀번호 보기 버튼 - Tab
8. 약관 동의 체크박스 - Tab
9. 약관 보기 링크 - Tab
10. 회원가입 버튼 - Tab + Enter
11. 로그인 링크 - Tab
```

---

## 8. 보안 고려사항

### 8.1 클라이언트 사이드
- **비밀번호 마스킹**: `type="password"`
- **자동완성 제어**: `autocomplete="email"`, `autocomplete="new-password"`
- **CSRF 토큰**: 폼 제출 시 포함
- **Rate Limiting**: 클라이언트에서 1초 debounce

### 8.2 서버 사이드 (참고)
- 비밀번호 해싱 (bcrypt, 10 rounds)
- Rate Limiting (1분에 10회)
- 이메일 중복 확인
- SQL Injection 방지 (Prepared Statements)

---

## 9. 디버깅 체크리스트

- [ ] 모든 필드가 Tab으로 접근 가능한가?
- [ ] 에러 메시지가 명확하고 도움이 되는가?
- [ ] 비밀번호 강도가 실시간으로 업데이트되는가?
- [ ] 비밀번호 일치 여부가 즉시 표시되는가?
- [ ] 이메일 중복 확인이 작동하는가?
- [ ] 역할 선택이 명확한가?
- [ ] 로그인 실패 시 적절한 오류가 표시되는가?
- [ ] 계정 잠금 시 타이머가 표시되는가?
- [ ] 모바일에서 레이아웃이 깨지지 않는가?
- [ ] "로그인 상태 유지"가 작동하는가?

---

**문서 버전**: 1.0
**최종 수정**: 2025-10-16
**다음 문서**: [03-student-wireframes.md](./03-student-wireframes.md)
