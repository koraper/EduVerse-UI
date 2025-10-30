# EduVerse 와이어프레임 - 랜딩페이지

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 와이어프레임 - 랜딩페이지 |
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
2. [LP-01 메인 랜딩페이지](#2-lp-01-메인-랜딩페이지)
3. [반응형 레이아웃](#3-반응형-레이아웃)
4. [컴포넌트 명세](#4-컴포넌트-명세)
5. [인터랙션 가이드](#5-인터랙션-가이드)

---

## 1. 개요

### 1.1 목적
- EduVerse 플랫폼의 첫 인상을 결정하는 랜딩페이지 와이어프레임
- 오프라인 수업 특화 메시지 전달 및 회원가입 전환 최적화

### 1.2 핵심 목표
- **명확한 가치 제안**: 3초 내 "오프라인 수업을 위한 프로그래밍 교육 플랫폼" 인식
- **타겟별 CTA**: 교수자와 학생에게 각각 명확한 행동 유도
- **빠른 로딩**: 2초 이내 초기 렌더링 완료

### 1.3 관련 문서
- [기능 명세서 Part 1](../../03-specs/01-overview-and-auth.md)
- [디자인 시스템](../01-eduverse-design-system.md)

---

## 2. LP-01 메인 랜딩페이지

### 2.1 전체 페이지 구조 (Desktop 1920px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                          NAVIGATION BAR                                  │ │
│ │  [Logo] EduVerse                     [기능] [가격] [문의]  [로그인] [회원가입]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           HERO SECTION                                   │ │
│ │                        (Full viewport height)                            │ │
│ │                                                                           │ │
│ │                    오프라인 수업을 위한                                     │ │
│ │                  프로그래밍 교육 플랫폼                                      │ │
│ │                                                                           │ │
│ │             실시간 모니터링 • 코드 피드백 • 학습 분석                        │ │
│ │                                                                           │ │
│ │        [🎓 교수자로 시작하기]        [📚 학생으로 시작하기]                 │ │
│ │                                                                           │ │
│ │                    ┌───────────────────────┐                             │ │
│ │                    │  [스크린샷/데모 영상]  │                             │ │
│ │                    │                       │                             │ │
│ │                    └───────────────────────┘                             │ │
│ │                                                                           │ │
│ │                         [▼ 더 알아보기]                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                    OFFLINE CLASS FEATURES SECTION                        │ │
│ │                                                                           │ │
│ │              왜 EduVerse는 오프라인 수업에 최적일까요?                      │ │
│ │                                                                           │ │
│ │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            │ │
│ │  │ 👁️ 실시간  │  │ 🎯 즉각적  │  │ 💻 제로   │  │ 📊 수업후 │            │ │
│ │  │ 모니터링   │  │ 개입      │  │ 셋업      │  │ 분석      │            │ │
│ │  │           │  │           │  │           │  │           │            │ │
│ │  │ 강의 중    │  │ 막힌 학생 │  │ 브라우저  │  │ 학습 패턴 │            │ │
│ │  │ 모든 학생 │  │ 즉시 발견 │  │ 만으로    │  │ 분석 및   │            │ │
│ │  │ 화면을     │  │ 하고 도움 │  │ 즉시 시작 │  │ 개선점    │            │ │
│ │  │ 한눈에    │  │           │  │           │  │ 도출      │            │ │
│ │  └───────────┘  └───────────┘  └───────────┘  └───────────┘            │ │
│ │                                                                           │ │
│ │                    [무료 데모 수업 신청하기]                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                     STUDENT FEATURES SECTION                             │ │
│ │                                                                           │ │
│ │                        학생들을 위한 기능                                   │ │
│ │                                                                           │ │
│ │  ┌───────────────────────┐         ┌─────────────────────────┐          │ │
│ │  │                       │         │  • 인턴십 시뮬레이션    │          │ │
│ │  │  [시나리오 학습       │         │    LogiCore Tech에서    │          │ │
│ │  │   스크린샷]           │   ←→    │    실제 업무처럼 학습   │          │ │
│ │  │                       │         │                         │          │ │
│ │  │  Monaco Editor        │         │  • Monaco Editor       │          │ │
│ │  │  + 실행 결과          │         │    VS Code 수준의 편집  │          │ │
│ │  │                       │         │                         │          │ │
│ │  │                       │         │  • 다중 언어 지원       │          │ │
│ │  │                       │         │    Python/JS/C/Java    │          │ │
│ │  └───────────────────────┘         └─────────────────────────┘          │ │
│ │                                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                   PROFESSOR FEATURES SECTION                             │ │
│ │                                                                           │ │
│ │                       교수자를 위한 기능                                    │ │
│ │                                                                           │ │
│ │  ┌───────────────────────┐         ┌─────────────────────────┐          │ │
│ │  │                       │         │  • Code Peek           │          │ │
│ │  │  [실시간 대시보드     │   ←→    │    학생 코드 실시간 확인│          │ │
│ │  │   스크린샷]           │         │                         │          │ │
│ │  │                       │         │  • 실시간 대시보드      │          │ │
│ │  │  학생 카드 그리드     │         │    진도/막힌부분 한눈에 │          │ │
│ │  │  + Code Peek 버튼     │         │                         │          │ │
│ │  │                       │         │  • 학습 분석            │          │ │
│ │  │                       │         │    수업 후 데이터 분석  │          │ │
│ │  └───────────────────────┘         └─────────────────────────┘          │ │
│ │                                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                         USE CASE SECTION                                 │ │
│ │                                                                           │ │
│ │                    실제 사용 사례 / 후기                                    │ │
│ │                                                                           │ │
│ │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │ │
│ │  │ "20명 학생의    │  │ "Code Peek으로  │  │ "학습 분석으로  │         │ │
│ │  │  진도를 실시간  │  │  자리 가기 전   │  │  다음 수업을    │         │ │
│ │  │  확인할 수 있어 │  │  문제 파악"     │  │  개선했어요"    │         │ │
│ │  │  편리해요"      │  │                 │  │                 │         │ │
│ │  │                 │  │  - 박교수님     │  │  - 최교수님     │         │ │
│ │  │  - 김교수님     │  │    컴퓨터공학과 │  │    소프트웨어학과│         │ │
│ │  │    프로그래밍   │  │                 │  │                 │         │ │
│ │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │ │
│ │                                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                            CTA SECTION                                   │ │
│ │                                                                           │ │
│ │                    지금 바로 시작해보세요                                   │ │
│ │                                                                           │ │
│ │        ┌─────────────────────┐       ┌─────────────────────┐            │ │
│ │        │ 🎓 교수자              │       │ 📚 학생              │            │ │
│ │        │                     │       │                     │            │ │
│ │        │ 지금 바로 수업       │       │ 초대코드를          │            │ │
│ │        │ 만들기               │       │ 받으셨나요?         │            │ │
│ │        │                     │       │                     │            │ │
│ │        │ [시작하기 →]        │       │ [참여하기 →]        │            │ │
│ │        └─────────────────────┘       └─────────────────────┘            │ │
│ │                                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                             FOOTER                                       │ │
│ │                                                                           │ │
│ │  EduVerse                    기능             회사              지원      │ │
│ │  오프라인 수업을 위한        학생용 기능      회사 소개         문의하기   │ │
│ │  프로그래밍 교육 플랫폼      교수자용 기능    이용약관          FAQ       │ │
│ │                              관리자 기능      개인정보처리방침   블로그    │ │
│ │                                                                           │ │
│ │  © 2025 EduVerse. All rights reserved.                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Hero Section 상세 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                              [Logo] EduVerse                                 │
│                                                                              │
│                                                                              │
│                           오프라인 수업을 위한                                │
│                         프로그래밍 교육 플랫폼                                 │
│                            (font-size: 48px)                                │
│                                                                              │
│                                                                              │
│              실시간 모니터링 • 코드 피드백 • 학습 분석                         │
│                         (font-size: 20px, gray-400)                         │
│                                                                              │
│                                                                              │
│   ┌────────────────────────────────┐   ┌────────────────────────────────┐  │
│   │  🎓 교수자로 시작하기            │   │  📚 학생으로 시작하기            │  │
│   │                                │   │                                │  │
│   │  지금 바로 수업을 만들어보세요   │   │  초대코드를 받으셨나요?          │  │
│   │  무료 • 설치 불필요 • 즉시 승인  │   │  무료 • 5분 만에 시작            │  │
│   │                                │   │                                │  │
│   │  (bg-indigo-600, hover효과)    │   │  (bg-green-600, hover효과)     │  │
│   └────────────────────────────────┘   └────────────────────────────────┘  │
│                                                                              │
│                                                                              │
│              ┌───────────────────────────────────────────┐                  │
│              │                                           │                  │
│              │        [데모 스크린샷 or 영상]             │                  │
│              │                                           │                  │
│              │  • 실제 대시보드 스크린샷                  │                  │
│              │  • 교수자가 학생 모니터링하는 화면         │                  │
│              │  • Glassmorphism 효과 적용               │                  │
│              │  • 애니메이션: fade-in + slide-up        │                  │
│              │                                           │                  │
│              └───────────────────────────────────────────┘                  │
│                                                                              │
│                                                                              │
│                            [▼ 더 알아보기]                                   │
│                       (Scroll down indicator)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

**색상**:
- 배경: bg-gray-900 (Dark 테마)
- 제목: text-white
- 부제: text-gray-400
- Primary CTA: bg-indigo-600
- Secondary CTA: bg-green-600

**애니메이션**:
- 제목: fade-in + slide-up (0.5s)
- 부제: fade-in + slide-up (0.7s, delay 0.2s)
- CTA 버튼: fade-in + slide-up (0.9s, delay 0.4s)
- 스크린샷: fade-in + slide-up (1.1s, delay 0.6s)
- Scroll indicator: bounce animation (infinite)
```

### 2.3 오프라인 수업 특화 섹션 상세

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                왜 EduVerse는 오프라인 수업에 최적일까요?                       │
│                        (font-size: 36px, text-center)                       │
│                                                                              │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │                  │  │                  │  │                  │         │
│  │   👁️ (48px)      │  │   🎯 (48px)      │  │   💻 (48px)      │         │
│  │                  │  │                  │  │                  │         │
│  │  실시간 모니터링  │  │  즉각적 개입      │  │  제로 셋업        │         │
│  │  (font-size: 20px)│  │  (font-size: 20px)│  │  (font-size: 20px)│         │
│  │                  │  │                  │  │                  │         │
│  │  강의 중 모든     │  │  막힌 학생을      │  │  브라우저만으로   │         │
│  │  학생의 화면을    │  │  즉시 발견하고    │  │  즉시 시작       │         │
│  │  한눈에 파악      │  │  도움             │  │                  │         │
│  │                  │  │                  │  │                  │         │
│  │  (bg-gray-800)   │  │  (bg-gray-800)   │  │  (bg-gray-800)   │         │
│  │  (rounded-lg)    │  │  (rounded-lg)    │  │  (rounded-lg)    │         │
│  │  (p-6)           │  │  (p-6)           │  │  (p-6)           │         │
│  │                  │  │                  │  │                  │         │
│  │  [hover: scale   │  │  [hover: scale   │  │  [hover: scale   │         │
│  │   +border glow]  │  │   +border glow]  │  │   +border glow]  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │                  │                                                       │
│  │   📊 (48px)      │                                                       │
│  │                  │                                                       │
│  │  수업 후 분석     │                                                       │
│  │                  │                                                       │
│  │  학습 패턴 분석   │                                                       │
│  │  및 개선점 도출   │                                                       │
│  │                  │                                                       │
│  │  (bg-gray-800)   │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
│                                                                              │
│                     ┌───────────────────────────────┐                       │
│                     │  무료 데모 수업 신청하기       │                       │
│                     │  (bg-indigo-600, py-4, px-8)  │                       │
│                     │  (hover: bg-indigo-700)       │                       │
│                     └───────────────────────────────┘                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

**레이아웃**:
- Container: max-w-7xl mx-auto px-6 py-20
- Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

**카드 스펙**:
- 배경: bg-gray-800
- 테두리: border border-gray-700
- 모서리: rounded-lg
- 패딩: p-6
- 호버: transform scale-105 + border-indigo-500

**애니메이션**:
- Scroll-triggered fade-in
- 각 카드 순차적 등장 (0.2s stagger)
```

---

## 3. 반응형 레이아웃

### 3.1 Desktop (1920px+)

```
┌─────────────────────────────────────────────────────────────────┐
│  Navigation: Horizontal menu                                    │
│  Hero: Full width, 100vh                                        │
│  Feature Cards: 4-column grid                                   │
│  Content Sections: 2-column (image + text side by side)        │
│  Footer: 4-column                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Laptop (1024px ~ 1919px)

```
┌──────────────────────────────────────────────────────┐
│  Navigation: Horizontal menu (compact)               │
│  Hero: Full width, 90vh                              │
│  Feature Cards: 3-column grid → 2-column grid       │
│  Content Sections: 2-column (narrow)                │
│  Footer: 3-column                                    │
└──────────────────────────────────────────────────────┘
```

### 3.3 Tablet (768px ~ 1023px)

```
┌───────────────────────────────────────────┐
│  Navigation: Horizontal menu (icons)     │
│  Hero: Full width, 80vh                  │
│  Feature Cards: 2-column grid            │
│  Content Sections: Stacked (image above) │
│  CTA: Stacked (교수자 above 학생)        │
│  Footer: 2-column                        │
└───────────────────────────────────────────┘
```

### 3.4 Mobile (< 768px)

```
┌──────────────────────────┐
│  ≡ [Hamburger menu]      │
│  Hero: Full width, 70vh  │
│  Feature Cards: 1-column │
│  Content: Stacked        │
│  CTA: Stacked            │
│  Footer: 1-column        │
└──────────────────────────┘

**Mobile 최적화**:
- 제목 font-size: 32px (desktop 48px)
- CTA 버튼: Full width
- 패딩: px-4 (desktop px-6)
- Hero 이미지: Lazy load
```

---

## 4. 컴포넌트 명세

### 4.1 Navigation Bar

```tsx
// Component: LandingNavbar.tsx
<nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md z-50
                border-b border-gray-800">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <Logo />
      <span className="text-xl font-bold text-white">EduVerse</span>
    </div>

    {/* Desktop Menu */}
    <div className="hidden md:flex items-center space-x-8">
      <a href="#features" className="text-gray-300 hover:text-white">기능</a>
      <a href="#pricing" className="text-gray-300 hover:text-white">가격</a>
      <a href="#contact" className="text-gray-300 hover:text-white">문의</a>
    </div>

    {/* CTA Buttons */}
    <div className="flex items-center space-x-4">
      <Button variant="ghost" href="/login">로그인</Button>
      <Button variant="primary" href="/signup">회원가입</Button>
    </div>

    {/* Mobile Hamburger */}
    <button className="md:hidden text-white">
      <HamburgerIcon />
    </button>
  </div>
</nav>
```

**상태**:
- Default: 투명 배경 + blur
- Scrolled: bg-gray-900 (불투명도 증가)

### 4.2 CTA Button (Primary)

```tsx
// Component: CTAButton.tsx
<button className="
  bg-indigo-600 hover:bg-indigo-700
  text-white font-bold
  py-4 px-8
  rounded-lg
  transition-all duration-200
  transform hover:scale-105
  shadow-lg hover:shadow-xl
  flex items-center justify-center space-x-2
">
  <Icon />
  <span>{children}</span>
</button>
```

**상태**:
- Default: bg-indigo-600
- Hover: bg-indigo-700 + scale-105 + shadow-xl
- Active: scale-95
- Disabled: opacity-50 + cursor-not-allowed

### 4.3 Feature Card

```tsx
// Component: FeatureCard.tsx
<div className="
  bg-gray-800
  border border-gray-700
  rounded-lg
  p-6
  transition-all duration-300
  hover:border-indigo-500
  hover:transform hover:scale-105
  cursor-pointer
">
  {/* Icon */}
  <div className="text-5xl mb-4">{icon}</div>

  {/* Title */}
  <h3 className="text-xl font-bold text-white mb-2">
    {title}
  </h3>

  {/* Description */}
  <p className="text-gray-400 text-sm leading-relaxed">
    {description}
  </p>
</div>
```

---

## 5. 인터랙션 가이드

### 5.1 스크롤 애니메이션

**Intersection Observer 사용**:
```javascript
// Scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in-up');
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
  observer.observe(section);
});
```

### 5.2 버튼 클릭 플로우

**교수자 CTA 클릭**:
```
1. 사용자가 "교수자로 시작하기" 버튼 클릭
2. 버튼 scale-95 애니메이션 (0.1s)
3. navigate('/professor/signup')
4. 로딩 인디케이터 표시
5. 교수자 회원가입 페이지로 이동
```

**학생 CTA 클릭**:
```
1. 사용자가 "학생으로 시작하기" 버튼 클릭
2. 버튼 애니메이션
3. navigate('/student/signup')
4. 학생 회원가입 페이지로 이동
```

### 5.3 호버 효과

**Feature Card 호버**:
```css
/* Default state */
.feature-card {
  transform: scale(1);
  border-color: theme('colors.gray.700');
  transition: all 0.3s ease;
}

/* Hover state */
.feature-card:hover {
  transform: scale(1.05);
  border-color: theme('colors.indigo.500');
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

### 5.4 페이지 로딩 시퀀스

```
1. Navigation Bar: fade-in (0.2s)
2. Hero Title: fade-in + slide-up (0.5s, delay 0.1s)
3. Hero Subtitle: fade-in + slide-up (0.7s, delay 0.3s)
4. CTA Buttons: fade-in + slide-up (0.9s, delay 0.5s)
5. Hero Image: fade-in + slide-up (1.1s, delay 0.7s)
6. Sections: Scroll-triggered fade-in
```

---

## 6. 성능 최적화

### 6.1 이미지 최적화
- **형식**: WebP (fallback: PNG/JPG)
- **Lazy Loading**: `loading="lazy"` 속성
- **Responsive Images**: `srcset` 사용
- **Compression**: 70-80% 품질

```html
<picture>
  <source srcset="/hero-large.webp" media="(min-width: 1024px)" type="image/webp">
  <source srcset="/hero-medium.webp" media="(min-width: 768px)" type="image/webp">
  <source srcset="/hero-small.webp" type="image/webp">
  <img src="/hero-fallback.jpg" alt="EduVerse Dashboard" loading="lazy">
</picture>
```

### 6.2 초기 로딩 최적화
- **Critical CSS**: Inline 삽입
- **Above-the-fold content**: 우선 렌더링
- **Code Splitting**: 라우트별 청크 분리
- **Font Loading**: `font-display: swap`

### 6.3 목표 성능 지표
| 항목 | 목표 | 측정 도구 |
|------|------|-----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| TTI (Time to Interactive) | < 3s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| Lighthouse Score | > 90 | Chrome DevTools |

---

## 7. 접근성 (a11y)

### 7.1 키보드 네비게이션
- **Tab 순서**: Logo → Menu → CTA → Content links
- **Focus 표시**: 2px solid ring-indigo-500
- **Skip to content**: 첫 번째 탭에 "본문으로 건너뛰기" 링크

### 7.2 ARIA 레이블
```html
<nav aria-label="Main navigation">
  <button aria-label="Open menu" aria-expanded="false">
    <HamburgerIcon aria-hidden="true" />
  </button>
</nav>

<button aria-label="Start as a professor">
  🎓 교수자로 시작하기
</button>
```

### 7.3 색상 대비
- **제목 (white on gray-900)**: 21:1 (AAA)
- **본문 (gray-400 on gray-900)**: 7:1 (AAA)
- **CTA 버튼 (white on indigo-600)**: 4.5:1 (AA)

---

## 8. 브라우저 호환성

| 브라우저 | 최소 버전 | 비고 |
|----------|-----------|------|
| Chrome | 90+ | 완전 지원 |
| Firefox | 88+ | 완전 지원 |
| Safari | 14+ | Backdrop-filter 지원 |
| Edge | 90+ | 완전 지원 |
| Mobile Safari | 14+ | iOS 최적화 |
| Chrome Mobile | 90+ | Android 최적화 |

**Polyfills 필요**:
- Intersection Observer (IE11)
- CSS Grid (IE11)
- WebP (IE11, fallback PNG 제공)

---

## 9. 디버깅 체크리스트

- [ ] Hero section이 2초 이내 로드되는가?
- [ ] CTA 버튼이 모든 viewport에서 명확히 보이는가?
- [ ] 모바일에서 햄버거 메뉴가 정상 작동하는가?
- [ ] Feature card hover 애니메이션이 부드러운가?
- [ ] 스크롤 애니메이션이 자연스러운가?
- [ ] 모든 링크와 버튼이 키보드로 접근 가능한가?
- [ ] 이미지가 lazy load 되는가?
- [ ] Lighthouse 점수가 90 이상인가?
- [ ] 다크 모드에서 색상 대비가 충분한가?
- [ ] 404 에러 없이 모든 리소스가 로드되는가?

---

**문서 버전**: 1.0
**최종 수정**: 2025-10-16
**다음 문서**: [02-common-wireframes.md](./02-common-wireframes.md)
