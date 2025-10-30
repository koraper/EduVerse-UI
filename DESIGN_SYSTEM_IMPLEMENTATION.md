# EduVerse Design System - Implementation Analysis

## 1. Theme System

- Location: src/contexts/ThemeContext.tsx
- Modes: light, dark, system (default)
- Storage: localStorage['selectedTheme']
- DOM: document.documentElement.classList.add/remove('dark')
- Usage: useTheme() hook with conditional Tailwind classes

## 2. Color Palette (tailwind.config.js)

- primary (cyan): 50-900 shades, #0ea5e9 at 500
- secondary (slate): neutral grays
- success (emerald): green
- warning (amber): yellow  
- error (red): red
- info: #3b82f6

## 3. Responsive Breakpoints

- sm: 640px (mobile to tablet)
- md: 768px (tablets)
- lg: 1024px (desktop)
- xl: large screens

Common pattern: grid grid-cols-1 sm:grid-cols-2 gap-4

## 4. Key Components

### Button
- Variants: primary, secondary, success, warning, error, ghost, outline
- Sizes: sm, md, lg
- Transitions: transition-all duration-200

### Input
- Theme-aware: bg-white dark:bg-gray-800
- Error state: border-error-500
- Features: password toggle, icon support, length counter

### Card
- Light: bg-white border-gray-200
- Dark: bg-gray-800 border-gray-700
- Padding: sm (p-3), md (p-4), lg (p-6)
- Hover: shadow-sm hover:shadow-lg

### Badge
- Variants: primary, secondary, success, warning, error, info, blue, purple
- Light: bg-{color}-100 text-{color}-800
- Dark: bg-{color}-900/30 text-{color}-400

### Modal
- Backdrop: bg-black bg-opacity-50 backdrop-blur-sm
- Sizes: sm, md, lg, xl, full
- Features: ESC close, backdrop click close, portal

## 5. Typography

Fonts:
- Default: Noto Sans KR, system-ui, sans-serif
- Poppins: Poppins
- Nanum Pen: decorative
- Mono: Fira Code

Sizes: text-2xl (xl), text-lg (lg), text-base (body), text-sm (small)

## 6. Spacing

- p-4 (mobile)
- sm:p-6 (tablet)
- lg:p-8 (desktop)
- Section gaps: space-y-6
- Component gaps: gap-2, gap-3, gap-4, gap-6

## 7. Transitions & Animations

- Standard: transition-colors duration-200/300
- Hover: hover:bg-primary-700, hover:shadow-lg
- Focus: focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
- Custom: blob animation (7s infinite)

## 8. Theme Usage Pattern



## 9. Example Pages

- LoginPage: gradient backgrounds, form styling
- StudentDashboardPage: grid cards, filter buttons, welcome banner
- LearningPage: lesson lists, content sections, difficulty selector
- QnAPage: Q&A list with filters, search
- ProgressPage: charts, lesson progress accordion

## 10. Page Layout Structure



## 11. Dark Mode Colors Reference

- Backgrounds: gray-900 (page), gray-800 (card), gray-700 (footer)
- Text: white (primary), gray-100 (secondary), gray-300 (tertiary)
- Borders: gray-700 (primary), gray-600 (secondary)
- Icons: theme-specific (e.g., emerald-600 dark vs green-200 light)

## 12. Component Import Pattern

All components use centralized exports in src/components/common/index.ts



## 13. Files to Reference

Core:
- tailwind.config.js
- src/contexts/ThemeContext.tsx
- src/contexts/FontContext.tsx
- src/components/common/Button.tsx
- src/components/common/Input.tsx
- src/components/common/Card.tsx
- src/components/layout/StudentLayout.tsx
- src/components/layout/Header.tsx

Example Pages:
- src/pages/auth/LoginPage.tsx
- src/pages/student/StudentDashboardPage.tsx
- src/pages/student/LearningPage.tsx

## 14. Quick Implementation Guide

For new components:
1. Import useTheme() hook
2. Use conditional className based on currentTheme
3. Add transition-colors duration-200 to theme-aware elements
4. Test in both light and dark modes
5. Use semantic colors (primary, success, error, warning)
6. Responsive padding: p-4 sm:p-6 lg:p-8
7. Include visible focus states

