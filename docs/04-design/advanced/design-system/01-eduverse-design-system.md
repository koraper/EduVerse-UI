# EduVerse 디자인 시스템

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 디자인 시스템 |
| 버전 | 2.0 |
| 최종 수정일 | 2025-10-29 |
| 상태 | 운영 중 |
| 관련 문서 | PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 |

## 📝 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2.0 | 2025-10-29 | 실제 구현 내용 반영: 테마 시스템, 반응형 디자인, 컴포넌트 업데이트 | Claude AI |
| 1.1 | 2025-10-19 | 버전 통일 업데이트: PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 반영 | Claude AI |
| 1.0 | 2025-01-14 | 초기 버전 작성 | Claude AI |

---

## 📖 목차

1. [개요](#1-개요)
2. [테마 시스템](#2-테마-시스템)
3. [컬러 시스템](#3-컬러-시스템)
4. [타이포그래피](#4-타이포그래피)
5. [간격 시스템](#5-간격-시스템)
6. [컴포넌트 스타일](#6-컴포넌트-스타일)
7. [레이아웃 가이드](#7-레이아웃-가이드)
8. [애니메이션](#8-애니메이션)
9. [반응형 디자인](#9-반응형-디자인)
10. [아이콘 시스템](#10-아이콘-시스템)
11. [접근성](#11-접근성)

---

## 1. 개요

### 1.1 디자인 철학

EduVerse는 **오프라인 강의실 환경에 최적화된 프로그래밍 교육 플랫폼**입니다. 디자인 시스템은 다음 원칙을 따릅니다:

**핵심 원칙**:
1. **다중 테마 지원**: 다크/라이트/시스템 테마로 다양한 환경에서 최적의 가독성 제공
2. **직관적 인터페이스**: 교육 현장에서 즉시 사용 가능한 단순하고 명확한 UI
3. **실시간 피드백**: 학생 상태를 한눈에 파악할 수 있는 시각적 표현
4. **몰입형 학습**: 게임화된 경험과 성장 추적 시스템
5. **접근성 우선**: 모든 사용자가 편안하게 사용할 수 있는 인클루시브 디자인

### 1.2 기술 스택

**Frontend (디자인 구현)**:
- **CSS 프레임워크**: TailwindCSS v3.4
- **컴포넌트 라이브러리**: 커스텀 React 컴포넌트
- **차트 라이브러리**: Recharts
- **아이콘**: Lucide React Icons
- **폰트**:
  - Noto Sans KR (기본)
  - Poppins (영문)
  - Nanum Pen Script (플래너)
  - Fira Code (코드)
- **테마 관리**: React Context API + localStorage

---

## 2. 테마 시스템

### 2.1 테마 모드

EduVerse는 **3가지 테마 모드**를 지원합니다:

| 모드 | 설명 | 사용 시나리오 |
|------|------|--------------|
| **Dark** | 어두운 배경에 밝은 텍스트 | 저조도 환경, 장시간 코딩 |
| **Light** | 밝은 배경에 어두운 텍스트 | 밝은 환경, 문서 작업 |
| **System** | OS 설정 자동 따름 (기본값) | 사용자 선호 설정 존중 |

### 2.2 테마 구현

#### ThemeContext 구조

```typescript
interface ThemeContextType {
  currentTheme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  actualTheme: 'light' | 'dark'; // 실제 적용된 테마
}
```

#### 테마 저장 및 적용

```typescript
// localStorage에 저장
localStorage.setItem('selectedTheme', theme);

// DOM 클래스 조작
if (actualTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

### 2.3 테마별 스타일 패턴

```jsx
// 컴포넌트에서 테마 사용
const { currentTheme } = useTheme();

<div className={`
  ${currentTheme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900'}
`}>

// Tailwind 다크 모드 클래스 사용 (권장)
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

---

## 3. 컬러 시스템

### 3.1 시맨틱 컬러 팔레트

#### Primary (Cyan)
주요 액션 및 브랜드 색상

| 톤 | Hex | TailwindCSS | Light Mode | Dark Mode |
|----|-----|-------------|------------|-----------|
| 50 | #ecfeff | primary-50 | 배경 | - |
| 100 | #cffafe | primary-100 | 호버 배경 | - |
| 500 | #0ea5e9 | primary-500 | 기본 | 기본 |
| 600 | #0284c7 | primary-600 | 호버 | 호버 |
| 700 | #0369a1 | primary-700 | 액티브 | 액티브 |

#### Secondary (Slate)
중립 색상 및 표면

| 톤 | Hex | TailwindCSS | 용도 |
|----|-----|-------------|------|
| 50 | #f8fafc | gray-50 | 라이트 배경 |
| 200 | #e2e8f0 | gray-200 | 라이트 테두리 |
| 300 | #cbd5e1 | gray-300 | 다크 보조 텍스트 |
| 400 | #94a3b8 | gray-400 | 비활성 텍스트 |
| 600 | #475569 | gray-600 | 라이트 보조 텍스트 |
| 700 | #334155 | gray-700 | 다크 테두리 |
| 800 | #1e293b | gray-800 | 다크 카드 배경 |
| 900 | #0f172a | gray-900 | 다크 페이지 배경 |

#### 상태 색상

| 상태 | 색상 | TailwindCSS | 용도 |
|------|------|-------------|------|
| **Success** | Emerald | `success-500` (#10b981) | 완료, 성공 메시지 |
| **Warning** | Amber | `warning-500` (#f59e0b) | 경고, 주의 필요 |
| **Error** | Red | `error-500` (#ef4444) | 오류, 실패 |
| **Info** | Blue | `info-500` (#3b82f6) | 정보, 일반 알림 |

### 3.2 테마별 색상 매핑

#### 배경 색상

| 요소 | Light Mode | Dark Mode |
|------|------------|-----------|
| **Page** | `bg-gray-50` | `bg-gray-900` |
| **Card** | `bg-white` | `bg-gray-800` |
| **Modal** | `bg-white` | `bg-gray-800` |
| **Input** | `bg-white` | `bg-gray-700` |
| **Hover** | `bg-gray-100` | `bg-gray-700` |

#### 텍스트 색상

| 레벨 | Light Mode | Dark Mode |
|------|------------|-----------|
| **Primary** | `text-gray-900` | `text-white` |
| **Secondary** | `text-gray-600` | `text-gray-300` |
| **Tertiary** | `text-gray-500` | `text-gray-400` |
| **Disabled** | `text-gray-400` | `text-gray-500` |

#### 테두리 색상

| 상태 | Light Mode | Dark Mode |
|------|------------|-----------|
| **Default** | `border-gray-200` | `border-gray-700` |
| **Focus** | `border-primary-500` | `border-primary-500` |
| **Error** | `border-red-500` | `border-red-500` |

---

## 4. 타이포그래피

### 4.1 폰트 시스템

#### 폰트 패밀리

```javascript
// tailwind.config.js
fontFamily: {
  'noto': ['Noto Sans KR', 'sans-serif'],
  'poppins': ['Poppins', 'sans-serif'],
  'nanum-pen': ['Nanum Pen Script', 'cursive'],
  'mono': ['Fira Code', 'monospace']
}
```

#### 폰트 컨텍스트

```typescript
type FontType = 'noto' | 'poppins' | 'nanum-pen' | 'mono';

interface FontContextType {
  currentFont: FontType;
  setFont: (font: FontType) => void;
}
```

### 4.2 텍스트 크기 스케일

| 크기 | 픽셀 | TailwindCSS | 용도 |
|------|------|-------------|------|
| **xs** | 12px | `text-xs` | 캡션, 도움말 |
| **sm** | 14px | `text-sm` | 보조 텍스트, 레이블 |
| **base** | 16px | `text-base` | 본문 (기본값) |
| **lg** | 18px | `text-lg` | 강조 본문 |
| **xl** | 20px | `text-xl` | 소제목 |
| **2xl** | 24px | `text-2xl` | 제목 |
| **3xl** | 30px | `text-3xl` | 페이지 제목 |
| **4xl** | 36px | `text-4xl` | 대제목 |

### 4.3 반응형 텍스트

```html
<!-- 모바일 우선 반응형 텍스트 -->
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  반응형 제목
</h1>

<p className="text-sm sm:text-base md:text-lg">
  반응형 본문
</p>
```

### 4.4 폰트 굵기

| 굵기 | Weight | TailwindCSS | 용도 |
|------|--------|-------------|------|
| **Normal** | 400 | `font-normal` | 본문 |
| **Medium** | 500 | `font-medium` | 강조 |
| **Semibold** | 600 | `font-semibold` | 부제목 |
| **Bold** | 700 | `font-bold` | 제목 |

---

## 5. 간격 시스템

### 5.1 기본 단위

4px 기반 시스템 (rem 단위)

| 크기 | 픽셀 | Tailwind | 용도 |
|------|------|----------|------|
| 0 | 0px | `p-0` | 여백 없음 |
| 1 | 4px | `p-1` | 최소 여백 |
| 2 | 8px | `p-2` | 작은 여백 |
| 3 | 12px | `p-3` | 중간 여백 |
| 4 | 16px | `p-4` | 기본 여백 |
| 6 | 24px | `p-6` | 큰 여백 |
| 8 | 32px | `p-8` | 매우 큰 여백 |

### 5.2 컴포넌트 간격 패턴

#### 카드 패딩
```html
<div className="p-4 sm:p-6">
  <!-- 모바일: 16px, 태블릿 이상: 24px -->
</div>
```

#### 섹션 간격
```html
<div className="space-y-4 sm:space-y-6">
  <!-- 수직 간격: 모바일 16px, 태블릿 이상 24px -->
</div>
```

#### 그리드 갭
```html
<div className="grid gap-4 sm:gap-6">
  <!-- 그리드 갭: 모바일 16px, 태블릿 이상 24px -->
</div>
```

---

## 6. 컴포넌트 스타일

### 6.1 Button 컴포넌트

#### 변형 (Variants)

```typescript
type ButtonVariant =
  | 'primary'   // 주요 액션
  | 'secondary' // 보조 액션
  | 'success'   // 긍정적 액션
  | 'warning'   // 주의 필요
  | 'error'     // 위험/삭제
  | 'ghost'     // 배경 없음
  | 'outline';  // 테두리만

type ButtonSize = 'sm' | 'md' | 'lg';
```

#### 스타일 예시

```jsx
// Primary Button
<Button variant="primary" size="md">
  시작하기
</Button>
// 클래스: bg-primary-500 hover:bg-primary-600 text-white

// Ghost Button (다크모드 대응)
<Button variant="ghost">
  취소
</Button>
// 클래스: hover:bg-gray-100 dark:hover:bg-gray-700
```

### 6.2 Input 컴포넌트

#### 기본 스타일

```jsx
<Input
  type="text"
  placeholder="이메일을 입력하세요"
  icon={<Mail className="w-4 h-4" />}
  showCharCount
  maxLength={100}
/>
```

#### 테마별 스타일

```css
/* Light Mode */
bg-white border-gray-200 text-gray-900
placeholder-gray-400 focus:border-primary-500

/* Dark Mode */
dark:bg-gray-700 dark:border-gray-600 dark:text-white
dark:placeholder-gray-400 dark:focus:border-primary-500
```

### 6.3 Card 컴포넌트

#### 구조

```jsx
<Card hoverable>
  <CardHeader>
    <h3>카드 제목</h3>
  </CardHeader>
  <CardBody>
    카드 내용
  </CardBody>
  <CardFooter>
    액션 버튼
  </CardFooter>
</Card>
```

#### 스타일 매핑

| 속성 | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | `bg-white` | `dark:bg-gray-800` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Shadow | `shadow-sm` | `shadow-sm` |
| Hover | `hover:shadow-lg` | `hover:shadow-lg` |

### 6.4 Badge 컴포넌트

#### 변형별 색상

```jsx
// Success Badge
<Badge variant="success">완료</Badge>
// bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400

// Warning Badge
<Badge variant="warning">진행중</Badge>
// bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
```

### 6.5 Modal 컴포넌트

#### 크기 옵션

| 크기 | 너비 | 용도 |
|------|------|------|
| **xs** | `max-w-sm` | 확인 다이얼로그 |
| **sm** | `max-w-md` | 간단한 폼 |
| **md** | `max-w-lg` | 기본값 |
| **lg** | `max-w-2xl` | 상세 내용 |
| **xl** | `max-w-4xl` | 전체 화면 |

### 6.6 Toast 알림

#### 타입별 스타일

```jsx
// Success Toast
showToast('저장되었습니다', 'success');
// bg-green-500 text-white

// Error Toast
showToast('오류가 발생했습니다', 'error');
// bg-red-500 text-white

// Info Toast
showToast('새 메시지가 있습니다', 'info');
// bg-blue-500 text-white
```

---

## 7. 레이아웃 가이드

### 7.1 페이지 레이아웃

#### 기본 구조

```jsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header />
  <main className="container mx-auto px-4 py-6">
    <div className="max-w-7xl mx-auto">
      {/* 콘텐츠 */}
    </div>
  </main>
  <Footer />
</div>
```

#### 대시보드 레이아웃

```jsx
<div className="flex h-screen">
  <Sidebar className="w-64 hidden lg:block" />
  <main className="flex-1 overflow-auto">
    <div className="p-4 sm:p-6 lg:p-8">
      {/* 콘텐츠 */}
    </div>
  </main>
</div>
```

### 7.2 그리드 시스템

#### 반응형 그리드

```jsx
// 카드 그리드 (1 → 2 → 3 → 4 컬럼)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {cards.map(card => <Card key={card.id} />)}
</div>

// 2컬럼 레이아웃 (모바일 스택)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <section>왼쪽</section>
  <section>오른쪽</section>
</div>
```

### 7.3 최대/최소 너비

```jsx
// 최소 너비 설정 (학습 페이지)
<div className="min-w-[1280px]">
  {/* 1280px 미만에서 가로 스크롤 */}
</div>

// 최대 너비 제한 (읽기 최적화)
<div className="max-w-4xl mx-auto">
  {/* 최대 896px 너비 */}
</div>
```

---

## 8. 애니메이션

### 8.1 트랜지션

#### 기본 트랜지션

```jsx
// 색상 트랜지션
className="transition-colors duration-200"

// 모든 속성 트랜지션
className="transition-all duration-300"

// 트랜스폼 트랜지션
className="transition-transform duration-200 hover:scale-105"
```

### 8.2 커스텀 애니메이션

#### Blob 애니메이션 (배경)

```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(1); }
  75% { transform: translate(-50px, -10px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}
```

#### Pulse 애니메이션 (알림)

```jsx
// 도움 필요 상태
<span className="animate-pulse text-red-400">
  도움 필요
</span>
```

### 8.3 포커스 애니메이션

```jsx
// 포커스 링
className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

// 다크모드 포커스
className="dark:focus:ring-offset-gray-900"
```

---

## 9. 반응형 디자인

### 9.1 브레이크포인트

| 브레이크포인트 | 최소 너비 | 디바이스 타겟 |
|----------------|-----------|---------------|
| **기본** | 0px | 모바일 (세로) |
| **sm** | 640px | 모바일 (가로) |
| **md** | 768px | 태블릿 |
| **lg** | 1024px | 데스크톱 |
| **xl** | 1280px | 큰 데스크톱 |
| **2xl** | 1536px | 초대형 화면 |

### 9.2 모바일 우선 패턴

```jsx
// 텍스트 크기
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// 패딩
<div className="p-4 sm:p-6 lg:p-8">

// 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// 표시/숨김
<nav className="hidden sm:block">  // 모바일에서 숨김
<button className="sm:hidden">      // 모바일에서만 표시
```

### 9.3 반응형 패턴 예시

#### 네비게이션

```jsx
// 모바일: 햄버거 메뉴
// 데스크톱: 가로 메뉴
<header className="flex justify-between items-center p-4">
  <Logo />

  {/* 모바일 메뉴 버튼 */}
  <button className="sm:hidden">
    <Menu />
  </button>

  {/* 데스크톱 메뉴 */}
  <nav className="hidden sm:flex gap-4">
    <Link>홈</Link>
    <Link>학습</Link>
    <Link>프로필</Link>
  </nav>
</header>
```

#### 카드 레이아웃

```jsx
// 모바일: 1열
// 태블릿: 2열
// 데스크톱: 3열
// 대형: 4열
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {courses.map(course => (
    <CourseCard key={course.id} {...course} />
  ))}
</div>
```

---

## 10. 아이콘 시스템

### 10.1 Lucide React Icons

#### 주요 아이콘 사용

| 카테고리 | 아이콘 | 용도 |
|----------|--------|------|
| **네비게이션** | Home, Settings, LogOut | 메뉴, 라우팅 |
| **액션** | Plus, Edit, Trash, Save | CRUD 작업 |
| **상태** | Check, X, AlertCircle, Info | 피드백, 알림 |
| **UI** | ChevronDown, Menu, Search, Filter | 인터페이스 조작 |
| **학습** | BookOpen, Code, Trophy, Target | 교육 관련 |

#### 아이콘 크기 규칙

```jsx
// 작은 아이콘 (버튼, 인풋)
<Search className="w-4 h-4" />

// 기본 아이콘
<Settings className="w-5 h-5" />

// 큰 아이콘 (대시보드)
<Trophy className="w-8 h-8" />
```

### 10.2 아이콘 색상

```jsx
// 테마 대응
<Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />

// 상태별 색상
<CheckCircle className="w-5 h-5 text-green-500" />
<AlertCircle className="w-5 h-5 text-yellow-500" />
<XCircle className="w-5 h-5 text-red-500" />
```

---

## 11. 접근성

### 11.1 색상 대비

#### WCAG AA 기준 준수

| 요소 | 최소 대비율 | 예시 |
|------|------------|------|
| 일반 텍스트 | 4.5:1 | gray-900 on white |
| 큰 텍스트 (18px+) | 3:1 | gray-700 on white |
| UI 컴포넌트 | 3:1 | primary-500 on white |

### 11.2 키보드 네비게이션

```jsx
// Tab 인덱스
<button tabIndex={0}>클릭 가능</button>

// 포커스 표시
className="focus:outline-none focus:ring-2 focus:ring-primary-500"

// 포커스 트랩 (모달)
<Modal onKeyDown={handleKeyDown}>
  {/* ESC로 닫기, Tab으로 순환 */}
</Modal>
```

### 11.3 ARIA 속성

```jsx
// 역할 정의
<nav role="navigation" aria-label="주 메뉴">

// 상태 표시
<button aria-pressed={isActive}>토글</button>
<input aria-invalid={hasError} aria-describedby="error-message">

// 라이브 영역
<div role="status" aria-live="polite">
  {loading && "로딩 중..."}
</div>

// 레이블
<button aria-label="메뉴 열기">
  <Menu className="w-5 h-5" />
</button>
```

### 11.4 스크린 리더 지원

```jsx
// 숨겨진 라벨
<span className="sr-only">검색</span>

// 설명 텍스트
<input aria-describedby="password-help">
<p id="password-help" className="text-sm text-gray-500">
  8자 이상 입력하세요
</p>
```

---

## 12. 실제 구현 예시

### 12.1 로그인 페이지

```jsx
const LoginPage = () => {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center
      ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-primary-50 to-primary-100'}`}>

      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <h1 className="text-2xl font-bold text-center mb-6
            text-gray-900 dark:text-white">
            로그인
          </h1>

          <form className="space-y-4">
            <Input
              type="email"
              placeholder="이메일"
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              type="password"
              placeholder="비밀번호"
              icon={<Lock className="w-4 h-4" />}
            />
            <Button variant="primary" className="w-full">
              로그인
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
```

### 12.2 학생 대시보드

```jsx
const StudentDashboard = () => {
  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 환영 배너 */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-600
          rounded-lg p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            안녕하세요, {userName}님! 👋
          </h1>
          <p className="mt-2 opacity-90">
            오늘도 열심히 공부해봐요!
          </p>
        </div>

        {/* 진행중인 코스 */}
        <section>
          <h2 className="text-xl font-semibold mb-4
            text-gray-900 dark:text-white">
            진행 중인 코스
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
};
```

### 12.3 나의 성장 기록 페이지

```jsx
const ProgressPage = () => {
  const { currentTheme } = useTheme();

  return (
    <StudentLayout>
      <div className="max-w-6xl min-w-[1280px] mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className={`text-3xl font-bold
            ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            나의 성장 기록
          </h1>
          <p className={`mt-2
            ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            차시별 학습 성과를 확인하고 성장 과정을 분석하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp />}
            title="누적 평균"
            value={85}
            color="purple"
          />
          <StatCard
            icon={<Award />}
            title="개념 이해도"
            value={88}
            color="blue"
          />
          <StatCard
            icon={<Target />}
            title="코드 활용도"
            value={82}
            color="green"
          />
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-center mb-4">
                개념 이해도
              </h3>
              <BarChart data={conceptData} />
            </CardBody>
          </Card>
          {/* ... */}
        </div>
      </div>
    </StudentLayout>
  );
};
```

---

## 13. 성능 최적화

### 13.1 CSS 최적화

```jsx
// Tailwind 클래스 정리
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 사용
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)} />
```

### 13.2 다크모드 최적화

```jsx
// 시스템 테마 감지
const getSystemTheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// 테마 변경 시 깜빡임 방지
useEffect(() => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}, [theme]);
```

---

## 14. 마이그레이션 가이드

### 14.1 v1.x → v2.0

#### 주요 변경사항

1. **테마 시스템**
   - 단일 다크 테마 → 다크/라이트/시스템 3개 모드
   - `bg-gray-900` → `bg-white dark:bg-gray-900`

2. **컬러 팔레트**
   - Indigo → Cyan (Primary)
   - 시맨틱 색상 추가 (success, warning, error, info)

3. **컴포넌트**
   - 공통 컴포넌트 표준화
   - TypeScript 타입 정의 추가

4. **반응형**
   - 모바일 우선 설계 강화
   - 브레이크포인트 일관성

#### 마이그레이션 체크리스트

- [ ] ThemeProvider 설정
- [ ] FontProvider 설정
- [ ] Tailwind config 업데이트
- [ ] 공통 컴포넌트 교체
- [ ] 다크모드 클래스 추가
- [ ] 반응형 클래스 검토

---

## 15. 참고 자료

### 15.1 외부 리소스

- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [Recharts 문서](https://recharts.org/en-US)
- [React 접근성 가이드](https://react.dev/reference/react-dom/components#accessibility)

### 15.2 내부 참조

- `/frontend/src/components/common/` - 공통 컴포넌트
- `/frontend/src/contexts/` - 테마, 폰트 컨텍스트
- `/frontend/tailwind.config.js` - Tailwind 설정
- `/frontend/src/pages/` - 페이지 구현 예시

---

**문서 작성 완료일**: 2025-10-29
**작성자**: Claude AI Assistant
**버전**: 2.0

이 디자인 시스템은 실제 구현된 코드를 기반으로 작성되었으며, EduVerse UI의 일관성 있는 개발을 위한 가이드라인입니다.
