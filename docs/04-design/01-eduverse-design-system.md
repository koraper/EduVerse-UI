# EduVerse 디자인 시스템

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 디자인 시스템 |
| 버전 | 1.1 |
| 최종 수정일 | 2025-10-19 |
| 상태 | 개발 중 |
| 관련 문서 | PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 |

## 📝 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1 | 2025-10-19 | 버전 통일 업데이트: PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 반영 | Claude AI |
| 1.0 | 2025-01-14 | 초기 버전 작성 | Claude AI |

---

## 📖 목차

1. [개요](#1-개요)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [간격 시스템](#4-간격-시스템)
5. [컴포넌트 스타일](#5-컴포넌트-스타일)
6. [레이아웃 가이드](#6-레이아웃-가이드)
7. [애니메이션](#7-애니메이션)
8. [반응형 디자인](#8-반응형-디자인)
9. [아이콘 시스템](#9-아이콘-시스템)
10. [접근성](#10-접근성)

---

## 1. 개요

### 1.1 디자인 철학

EduVerse는 **오프라인 강의실 환경에 최적화된 프로그래밍 교육 플랫폼**입니다. 디자인 시스템은 다음 원칙을 따릅니다:

**핵심 원칙**:
1. **집중력 극대화**: 다크 테마로 눈의 피로를 줄이고 코드에 집중
2. **직관적 인터페이스**: 교육 현장에서 즉시 사용 가능한 단순함
3. **실시간 피드백**: 학생 상태를 한눈에 파악할 수 있는 시각적 표현
4. **몰입형 학습**: LogiCore Tech 시나리오를 통한 게임화된 경험

### 1.2 기술 스택

**Frontend (디자인 구현)**:
- **CSS 프레임워크**: TailwindCSS v3.x
- **폰트**:
  - 기본: system-ui, -apple-system, sans-serif
  - 특수: Nanum Pen Script (플래너 스타일)
- **아이콘**: Emoji + Custom SVG
- **테마**: Dark Mode (기본), vs-dark theme for Monaco Editor

**Backend (제공자)**:
- **프레임워크**: Express.js 4+ (Node.js 20+)
- **ORM**: Prisma
- **데이터베이스**: MariaDB
- **캐시/세션**: Redis 7+ (세션 관리, 실시간 모니터링, Rate Limiting)

---

## 2. 컬러 시스템

### 2.1 기본 컬러 팔레트

EduVerse는 **다크 테마**를 기본으로 사용합니다.

#### Gray Scale (배경 및 표면)

| 컬러명 | Hex | TailwindCSS | 용도 |
|--------|-----|-------------|------|
| **Background** | `#111827` | `bg-gray-900` | 페이지 기본 배경 |
| **Surface** | `#1F2937` | `bg-gray-800` | 카드, 모달 배경 |
| **Surface Elevated** | `#374151` | `bg-gray-700` | 입력 필드, 호버 상태 |
| **Border** | `#374151` | `border-gray-700` | 테두리 |

#### Text Colors

| 컬러명 | Hex | TailwindCSS | 용도 |
|--------|-----|-------------|------|
| **Primary Text** | `#FFFFFF` | `text-white` | 제목, 중요 텍스트 |
| **Secondary Text** | `#D1D5DB` | `text-gray-300` | 본문 텍스트 |
| **Tertiary Text** | `#9CA3AF` | `text-gray-400` | 부가 정보, 힌트 |
| **Disabled Text** | `#6B7280` | `text-gray-500` | 비활성 텍스트 |

### 2.2 브랜드 컬러

#### Primary (Indigo) - 주요 액션

| 상태 | Hex | TailwindCSS | 용도 |
|------|-----|-------------|------|
| **Default** | `#4F46E5` | `bg-indigo-600` | 시작하기, 로그인 버튼 |
| **Hover** | `#4338CA` | `hover:bg-indigo-700` | 호버 상태 |
| **Text** | `#A5B4FC` | `text-indigo-400` | 링크, 강조 텍스트 |

```html
<!-- 사용 예시 -->
<button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">
  학습 시작하기
</button>
```

### 2.3 시맨틱 컬러

#### Success (Green)

| 상태 | Hex | TailwindCSS | 용도 |
|------|-----|-------------|------|
| **Default** | `#059669` | `bg-green-600` | 회원가입, 완료 |
| **Hover** | `#047857` | `hover:bg-green-700` | 호버 상태 |
| **Text** | `#6EE7B7` | `text-green-300` | 성공 메시지 |

#### Warning (Yellow/Amber)

| 상태 | Hex | TailwindCSS | 용도 |
|------|-----|-------------|------|
| **Default** | `#F59E0B` | `bg-yellow-500` | 경고, 주의 |
| **Text** | `#FCD34D` | `text-yellow-300` | 플래너 강조 |

#### Danger (Red)

| 상태 | Hex | TailwindCSS | 용도 |
|------|-----|-------------|------|
| **Default** | `#DC2626` | `bg-red-600` | 로그아웃, 삭제 |
| **Hover** | `#B91C1C` | `hover:bg-red-700` | 호버 상태 |
| **Text** | `#FCA5A5` | `text-red-300` | 에러 메시지 |

#### Info (Blue/Teal)

| 상태 | Hex | TailwindCSS | 용도 |
|------|-----|-------------|------|
| **Blue Default** | `#2563EB` | `bg-blue-600` | 정보, 일반 액션 |
| **Teal Default** | `#0D9488` | `bg-teal-600` | 수업 참여, Code Peek |
| **Teal Hover** | `#0F766E` | `hover:bg-teal-700` | 호버 상태 |

#### Special Purpose

| 컬러명 | Hex | TailwindCSS | 용도 |
|--------|-----|-------------|------|
| **Purple** | `#9333EA` | `bg-purple-600` | 질문하기 |
| **Emerald** | `#059669` | `bg-emerald-600` | 성장 확인 |

### 2.4 상태 표시 컬러

#### 학생 상태

| 상태 | 컬러 | Emoji | 설명 |
|------|------|-------|------|
| **활동중** | Green | 🟢 | 최근 5분 이내 활동 |
| **도움필요** | Red (animate-pulse) | 🔴 | 5분 이상 진도 없음 |
| **대기중** | Yellow | 🟡 | 로그인했으나 활동 없음 |
| **완료** | White | ✅ | 과제 완료 |
| **일시정지** | Gray | ⏸️ | 일시 정지 |

```html
<!-- 활동 상태 표시 예시 -->
<span class="text-red-400 font-bold animate-pulse">🔴 정체</span>
<span class="text-green-400 font-bold">🟢 활동중</span>
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

#### Primary Font (본문)

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**TailwindCSS**: `font-sans`

#### Display Font (플래너 스타일)

```css
font-family: 'Nanum Pen Script', cursive;
```

**TailwindCSS**: `font-planner` (커스텀 클래스)

```css
/* tailwind.config.js에 추가 */
fontFamily: {
  'planner': ['"Nanum Pen Script"', 'cursive'],
}
```

**사용처**:
- 플래너 제목
- 감성적 메시지
- 환영 인사

#### Monospace Font (코드)

```css
font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
```

**TailwindCSS**: `font-mono`

### 3.2 폰트 크기

| 크기명 | Size (px) | Line Height | TailwindCSS | 용도 |
|--------|-----------|-------------|-------------|------|
| **XS** | 12px | 16px | `text-xs` | 보조 정보 |
| **SM** | 14px | 20px | `text-sm` | 작은 텍스트, 레이블 |
| **Base** | 16px | 24px | `text-base` | 본문 (기본) |
| **LG** | 18px | 28px | `text-lg` | 강조 본문 |
| **XL** | 20px | 28px | `text-xl` | 작은 제목 |
| **2XL** | 24px | 32px | `text-2xl` | 제목 |
| **3XL** | 30px | 36px | `text-3xl` | 큰 제목 |
| **4XL** | 36px | 40px | `text-4xl` | 플래너 제목 |
| **5XL** | 48px | 1 | `text-5xl` | 히어로 제목 (모바일) |
| **7XL** | 72px | 1 | `text-7xl` | 히어로 제목 (데스크톱) |

### 3.3 폰트 굵기

| 굵기명 | Weight | TailwindCSS | 용도 |
|--------|--------|-------------|------|
| **Normal** | 400 | `font-normal` | 본문 |
| **Medium** | 500 | `font-medium` | 강조 텍스트 |
| **Semibold** | 600 | `font-semibold` | 서브 제목, 링크 |
| **Bold** | 700 | `font-bold` | 제목, 버튼 |

### 3.4 텍스트 스타일 예시

```html
<!-- 페이지 제목 -->
<h1 class="text-3xl md:text-5xl font-bold text-white">
  LogiCore Tech
</h1>

<!-- 플래너 스타일 제목 -->
<h2 class="font-planner text-4xl md:text-7xl text-white drop-shadow-lg">
  오늘의 학습 플래너
</h2>

<!-- 본문 텍스트 -->
<p class="text-base text-gray-300">
  프로그래밍 학습을 시작해보세요.
</p>

<!-- 레이블 -->
<label class="text-sm font-bold text-gray-400">
  이메일
</label>

<!-- 링크 -->
<a class="font-semibold text-indigo-400 hover:underline">
  회원가입
</a>
```

---

## 4. 간격 시스템

### 4.1 Spacing Scale

TailwindCSS의 기본 spacing scale (4px 단위)을 사용합니다.

| 크기 | Value | TailwindCSS | 용도 |
|------|-------|-------------|------|
| **0** | 0px | `p-0`, `m-0` | 여백 없음 |
| **1** | 4px | `p-1`, `m-1` | 최소 여백 |
| **2** | 8px | `p-2`, `m-2` | 작은 여백 |
| **3** | 12px | `p-3`, `m-3` | 중간 여백 |
| **4** | 16px | `p-4`, `m-4` | 기본 여백 |
| **6** | 24px | `p-6`, `m-6` | 큰 여백 |
| **8** | 32px | `p-8`, `m-8` | 매우 큰 여백 |

### 4.2 컴포넌트 간격 가이드

#### 카드 내부 패딩

```html
<!-- 일반 카드 -->
<div class="p-4 md:p-6 bg-gray-800 rounded-lg">
  내용
</div>

<!-- 로그인 폼 -->
<div class="p-8 bg-gray-800 rounded-lg">
  폼 요소
</div>
```

#### 섹션 간격

```html
<!-- 섹션 간 여백 -->
<section class="space-y-4">
  <div>첫 번째 요소</div>
  <div>두 번째 요소</div>
</section>

<!-- 큰 섹션 간 여백 -->
<div class="space-y-6 lg:space-y-8">
  <section>섹션 1</section>
  <section>섹션 2</section>
</div>
```

---

## 5. 컴포넌트 스타일

### 5.1 버튼

#### Primary Button

```html
<button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
               py-3 px-6 rounded-lg transition-colors duration-200
               transform hover:scale-105">
  시작하기
</button>
```

**변형**:
- **Small**: `py-2 px-4 text-sm`
- **Large**: `py-4 px-8 text-lg`
- **Full Width**: `w-full`

#### Success Button

```html
<button class="bg-green-600 hover:bg-green-700 text-white font-bold
               py-3 px-6 rounded-lg">
  가입하기
</button>
```

#### Danger Button

```html
<button class="bg-red-600 hover:bg-red-700 text-white font-bold
               py-2 px-4 rounded-lg">
  로그아웃
</button>
```

#### Secondary Button (Teal)

```html
<button class="bg-teal-600 hover:bg-teal-700 text-white font-bold
               py-2 px-4 rounded-lg flex items-center space-x-2">
  <span>👁️</span>
  <span>Code Peek</span>
</button>
```

#### Icon Button

```html
<button class="bg-purple-600 hover:bg-purple-700 text-white font-bold
               py-2 px-4 rounded-lg flex items-center space-x-2">
  <span>💬</span>
  <span>질문하기</span>
</button>
```

### 5.2 입력 필드

#### Text Input

```html
<div class="space-y-2">
  <label for="email" class="text-sm font-bold text-gray-400">
    이메일
  </label>
  <input
    type="email"
    id="email"
    class="w-full p-3 bg-gray-700 rounded-md text-white
           border border-gray-600 focus:border-indigo-500
           focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    placeholder="your@email.com"
  />
</div>
```

#### Select

```html
<select class="w-full p-3 bg-gray-700 rounded-md text-white
               border border-gray-600 focus:border-indigo-500">
  <option value="student">학생</option>
  <option value="professor">교수자</option>
</select>
```

#### Textarea

```html
<textarea
  class="w-full p-3 bg-gray-700 rounded-md text-white
         border border-gray-600 focus:border-indigo-500
         focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
  rows="4"
  placeholder="질문 내용을 입력하세요..."
></textarea>
```

### 5.3 카드

#### Basic Card

```html
<div class="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
  <h3 class="text-lg font-bold text-white mb-2">카드 제목</h3>
  <p class="text-gray-300">카드 내용</p>
</div>
```

#### Student Status Card (실시간 모니터링)

```html
<div class="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col space-y-2">
  <h3 class="text-lg font-bold text-white">김태현</h3>
  <p class="text-sm">
    <span class="font-bold text-indigo-400">현재 주차:</span>
    Week 2 - 자료구조 입문
  </p>
  <p>
    <span class="font-bold">학습 진도:</span>
    <span class="text-green-400">68%</span>
  </p>
  <p>
    <span class="text-red-400 font-bold animate-pulse">🔴 정체</span>
  </p>
  <button class="bg-teal-600 hover:bg-teal-700 text-white font-bold
                 py-2 px-4 rounded-lg text-sm">
    👁️ Code Peek
  </button>
</div>
```

#### Planner Widget

```html
<div class="planner-widget p-6 rounded-2xl">
  <h2 class="font-planner text-4xl text-yellow-300 flex items-center space-x-2">
    <span>📝</span>
    <span>오늘의 학습 기록</span>
  </h2>
  <div class="mt-4 space-y-2 text-lg">
    <!-- 내용 -->
  </div>
</div>
```

**Planner Widget 스타일**:
```css
.planner-widget {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(168, 85, 247, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 5.4 모달

```html
<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  <div class="bg-gray-800 w-full max-w-2xl rounded-lg shadow-2xl
              border border-gray-700 max-h-[90vh] flex flex-col">

    <!-- Header -->
    <div class="p-4 border-b border-gray-700 flex justify-between items-center">
      <h2 class="text-xl font-bold text-white">모달 제목</h2>
      <button class="text-gray-400 hover:text-white text-2xl">×</button>
    </div>

    <!-- Body -->
    <div class="flex-grow p-6 overflow-y-auto">
      모달 내용
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-700 flex justify-end space-x-2">
      <button class="bg-gray-700 hover:bg-gray-600 text-white
                     py-2 px-4 rounded-lg">
        취소
      </button>
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white
                     py-2 px-4 rounded-lg">
        확인
      </button>
    </div>
  </div>
</div>
```

### 5.5 진도바 (Progress Bar)

```html
<div class="space-y-2">
  <div class="flex justify-between text-sm">
    <span class="text-gray-400">학습 진도</span>
    <span class="text-white font-bold">68%</span>
  </div>
  <div class="w-full bg-gray-700 rounded-full h-3">
    <div class="bg-green-500 h-3 rounded-full" style="width: 68%"></div>
  </div>
</div>
```

---

## 6. 레이아웃 가이드

### 6.1 컨테이너

```html
<!-- 중앙 정렬 컨테이너 -->
<div class="container mx-auto px-4 max-w-7xl">
  내용
</div>

<!-- 로그인/회원가입 -->
<div class="min-h-screen flex items-center justify-center bg-gray-900">
  <div class="w-full max-w-md">
    폼
  </div>
</div>
```

### 6.2 그리드 시스템

```html
<!-- 2단 그리드 (반응형) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>왼쪽</div>
  <div>오른쪽</div>
</div>

<!-- 학생 카드 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div>학생 1</div>
  <div>학생 2</div>
  <!-- ... -->
</div>

<!-- 플래너 레이아웃 -->
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div class="lg:col-span-3">메인 콘텐츠</div>
  <div>사이드바</div>
</div>
```

### 6.3 Flexbox

```html
<!-- 수평 정렬 -->
<div class="flex items-center justify-between">
  <div>왼쪽</div>
  <div>오른쪽</div>
</div>

<!-- 수직 스택 -->
<div class="flex flex-col space-y-4">
  <div>첫 번째</div>
  <div>두 번째</div>
</div>

<!-- 아이템 중앙 정렬 -->
<div class="flex items-center justify-center space-x-2">
  <span>🚀</span>
  <span>시작하기</span>
</div>
```

---

## 7. 애니메이션

### 7.1 Transition

```html
<!-- 기본 트랜지션 -->
<button class="transition-colors duration-200 bg-indigo-600 hover:bg-indigo-700">
  버튼
</button>

<!-- 복합 트랜지션 -->
<button class="transition-all duration-300 transform hover:scale-105">
  호버 애니메이션
</button>
```

### 7.2 Pulse (깜빡임)

```html
<!-- 긴급 상태 표시 -->
<span class="animate-pulse text-red-400 font-bold">
  🔴 도움 필요
</span>
```

### 7.3 Custom Animations

```css
/* tailwind.config.js에 추가 */
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in',
      'slide-up': 'slideUp 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

---

## 8. 반응형 디자인

### 8.1 브레이크포인트

| 브레이크포인트 | 최소 너비 | TailwindCSS | 대상 기기 |
|----------------|-----------|-------------|-----------|
| **sm** | 640px | `sm:` | 모바일 가로 |
| **md** | 768px | `md:` | 태블릿 |
| **lg** | 1024px | `lg:` | 데스크톱 |
| **xl** | 1280px | `xl:` | 큰 데스크톱 |
| **2xl** | 1536px | `2xl:` | 매우 큰 화면 |

### 8.2 모바일 우선 설계

```html
<!-- 기본 (모바일) → 태블릿 → 데스크톱 -->
<h1 class="text-3xl md:text-5xl lg:text-7xl font-bold">
  반응형 제목
</h1>

<!-- 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 모바일: 1단, 태블릿: 2단, 데스크톱: 3단 -->
</div>

<!-- 패딩 -->
<div class="p-4 md:p-6 lg:p-8">
  반응형 패딩
</div>
```

### 8.3 숨김/표시

```html
<!-- 모바일에서만 표시 -->
<div class="block md:hidden">
  모바일 메뉴
</div>

<!-- 데스크톱에서만 표시 -->
<div class="hidden md:block">
  데스크톱 네비게이션
</div>
```

---

## 9. 아이콘 시스템

### 9.1 Emoji 아이콘

EduVerse는 **Emoji**를 주 아이콘으로 사용하여 친근하고 직관적인 UI를 제공합니다.

#### 주요 Emoji

| 카테고리 | Emoji | 용도 |
|----------|-------|------|
| **액션** | 🚀 | 시작하기 |
| | ✅ | 완료, 성공 |
| | 💾 | 저장 |
| | 🔄 | 새로고침 |
| **학습** | 📚 | 학습 자료 |
| | 📝 | 학습 기록 |
| | 💻 | 코드 작성 |
| | 🎯 | 목표 |
| **상호작용** | 💬 | 질문하기 |
| | 👁️ | Code Peek |
| | 📊 | 통계, 분석 |
| **상태** | 🟢 | 활동중 |
| | 🔴 | 도움필요 |
| | 🟡 | 대기중 |
| | ⏸️ | 일시정지 |
| **감정** | 🎉 | 축하 |
| | 💡 | 힌트, 아이디어 |
| | ⚠️ | 경고 |

### 9.2 사용 예시

```html
<button class="flex items-center space-x-2">
  <span>🚀</span>
  <span>시작하기</span>
</button>

<h2 class="flex items-center space-x-2">
  <span>📝</span>
  <span>오늘의 학습 기록</span>
</h2>
```

---

## 10. 접근성

### 10.1 색상 대비

- **텍스트/배경 대비**: 최소 4.5:1 (WCAG AA)
- **큰 텍스트 대비**: 최소 3:1
- **링크**: 주변 텍스트와 구분 가능한 색상

### 10.2 키보드 네비게이션

```html
<!-- 포커스 스타일 -->
<button class="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
  버튼
</button>

<input class="focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
```

### 10.3 ARIA 레이블

```html
<!-- 버튼에 레이블 추가 -->
<button aria-label="모달 닫기" class="text-gray-400 hover:text-white">
  ×
</button>

<!-- 입력 필드 -->
<label for="email">이메일</label>
<input id="email" type="email" aria-required="true">

<!-- 상태 표시 -->
<div role="status" aria-live="polite">
  <span class="animate-pulse">🔴 도움 필요</span>
</div>
```

---

## 11. 코드 에디터 스타일 (Monaco Editor)

### 11.1 에디터 테마

```javascript
// Monaco Editor 설정
{
  theme: 'vs-dark',
  fontSize: 14,
  lineHeight: 20,
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  wordWrap: 'on',
}
```

### 11.2 에디터 컨테이너

```html
<div class="h-[70vh] flex flex-col border border-gray-700 rounded-lg overflow-hidden">
  <!-- 툴바 -->
  <div class="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
    <div class="flex space-x-2">
      <button class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">
        Python
      </button>
    </div>
    <div class="flex space-x-2">
      <button class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded">
        💾 저장
      </button>
      <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
        ▶️ 실행
      </button>
    </div>
  </div>

  <!-- 에디터 영역 -->
  <div class="flex-grow p-1 font-mono text-sm bg-gray-900">
    <!-- Monaco Editor -->
  </div>
</div>
```

---

## 12. 토스트 알림

```html
<!-- 성공 토스트 -->
<div class="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg
            flex items-center space-x-2 animate-slide-up">
  <span>✅</span>
  <span>저장되었습니다</span>
</div>

<!-- 에러 토스트 -->
<div class="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg
            flex items-center space-x-2">
  <span>❌</span>
  <span>오류가 발생했습니다</span>
</div>

<!-- 정보 토스트 -->
<div class="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
  <span>ℹ️ 새로운 질문이 등록되었습니다</span>
</div>
```

---

## 13. 로딩 상태

### 13.1 스피너

```html
<!-- 전체 화면 로딩 -->
<div class="min-h-screen flex flex-col items-center justify-center bg-gray-900">
  <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-indigo-600"></div>
  <p class="text-white mt-4">환경 준비중...</p>
</div>
```

### 13.2 스켈레톤 UI

```html
<!-- 카드 스켈레톤 -->
<div class="bg-gray-800 p-4 rounded-lg space-y-3 animate-pulse">
  <div class="h-4 bg-gray-700 rounded w-3/4"></div>
  <div class="h-4 bg-gray-700 rounded w-1/2"></div>
  <div class="h-4 bg-gray-700 rounded w-5/6"></div>
</div>
```

---

## 14. 다크 모드 전용 효과

### 14.1 Glassmorphism

```css
/* 플래너 위젯 */
.planner-widget {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(168, 85, 247, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 14.2 그림자

```html
<!-- 카드 그림자 -->
<div class="shadow-lg">기본 그림자</div>
<div class="shadow-xl">강한 그림자</div>
<div class="shadow-2xl">매우 강한 그림자</div>

<!-- 발광 효과 -->
<div class="shadow-lg shadow-indigo-500/50">발광 그림자</div>
```

### 14.3 텍스트 그림자

```html
<h1 class="drop-shadow-lg text-white">
  텍스트 그림자
</h1>

<!-- 커스텀 -->
<style>
.text-glow {
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}
</style>
```

---

## 15. 구현 체크리스트

### 15.1 필수 설정

- [ ] TailwindCSS v3.x 설치
- [ ] Nanum Pen Script 폰트 로드
- [ ] 커스텀 컬러 설정 (tailwind.config.js)
- [ ] 커스텀 폰트 패밀리 설정 (font-planner)
- [ ] Monaco Editor 통합

### 15.2 컴포넌트 구현

- [ ] 버튼 (Primary, Success, Danger, Secondary)
- [ ] 입력 필드 (Text, Select, Textarea)
- [ ] 카드 (Basic, Student Status, Planner Widget)
- [ ] 모달
- [ ] 진도바
- [ ] 토스트 알림
- [ ] 로딩 스피너

### 15.3 레이아웃 구현

- [ ] 로그인/회원가입 페이지
- [ ] 학생 대시보드 (플래너 스타일)
- [ ] 교수자 실시간 모니터링
- [ ] 학습 페이지 (시나리오 + 코드 에디터)
- [ ] Q&A 페이지

---

## 16. 참고 자료

### 16.1 TailwindCSS

- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)
- [TailwindCSS 컬러 팔레트](https://tailwindcss.com/docs/customizing-colors)

### 16.2 Monaco Editor

- [Monaco Editor 문서](https://microsoft.github.io/monaco-editor/)
- [VS Code 테마](https://github.com/microsoft/vscode/tree/main/src/vs/editor/common/themes)

### 16.3 폰트

- [Google Fonts - Nanum Pen Script](https://fonts.google.com/specimen/Nanum+Pen+Script)

---

**문서 작성 완료일**: 2025-01-14
**작성자**: Claude AI Assistant
**버전**: 1.0

이 디자인 시스템을 따라 일관성 있고 사용자 친화적인 EduVerse UI를 구현할 수 있습니다.
